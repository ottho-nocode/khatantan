import { createFileRoute, Link } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities";
import { useTranslation } from "@/contexts/Language";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";

function HomePage() {
  const { t } = useTranslation();

  const { data: coursesData, isLoading } = useDatabaseQuery({
    from: "courses",
    where: { field: "status", operator: "eq", value: "published" },
    include: { instructor_profiles: { include: { profiles: true } }, categories: true },
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 3,
  });

  const { data: categoriesData } = useDatabaseQuery({
    from: "categories",
    orderBy: [{ field: "position", direction: "asc" }],
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-32 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t("home.heroSubtitle")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/courses">
                <Button size="lg" className="w-full text-base sm:w-auto">
                  {t("home.discoverCourses")}
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base sm:w-auto"
                >
                  {t("home.learnMore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categoriesData?.data && categoriesData.data.length > 0 && (
        <section className="bg-white py-16 dark:bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
                {t("home.exploreCategories")}
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                {t("home.exploreCategoriesSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {categoriesData.data.map((category: any) => (
                <Link
                  key={category.id}
                  to="/courses"
                  search={{ category: category.slug }}
                  className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:shadow-lg"
                >
                  {category.thumbnail_url && (
                    <img
                      src={category.thumbnail_url}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-90"
                    />
                  )}
                  <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
                  <div className="relative z-10 p-4 text-center">
                    <h3 className="text-lg font-bold text-white drop-shadow-md md:text-xl">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Courses Section */}
      <section className="bg-primary/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
                {t("home.popularCourses")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.popularCoursesSubtitle")}
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden items-center font-medium text-primary hover:text-primary/80 md:flex"
            >
              {t("home.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 animate-pulse rounded-2xl bg-muted"
                  />
                ))
              : coursesData?.data.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/courses">
              <Button variant="outline" className="w-full">
                {t("home.viewAllCourses")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="relative overflow-hidden bg-primary py-20 text-white">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 font-serif text-3xl font-bold md:text-4xl">
            {t("home.joinCommunity")}
          </h2>
          <p className="mb-8 text-lg text-white/80">
            {t("home.joinCommunitySubtitle")}
          </p>
          <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={t("home.emailPlaceholder")}
              className="w-full rounded-full px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              {t("home.subscribe")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/_public/")({
  component: HomePage,
});

import { createFileRoute, Link } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";

function HomePage() {
  const { data: coursesData, isLoading } = useDatabaseQuery({
    from: "courses",
    where: { field: "status", operator: "eq", value: "published" },
    include: { instructor_profiles: { include: { profiles: true } } },
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
              &Eacute;veillez votre potentiel spirituel et personnel
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              La premi&egrave;re marketplace de cours en ligne en Mongolie
              d&eacute;di&eacute;e au bien-&ecirc;tre, &agrave; la
              spiritualit&eacute; et au d&eacute;veloppement personnel.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/courses">
                <Button size="lg" className="w-full text-base sm:w-auto">
                  D&eacute;couvrir les cours
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base sm:w-auto"
                >
                  En savoir plus
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
                Explorez par cat&eacute;gories
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Trouvez le chemin qui vous correspond parmi nos th&eacute;matiques
                vari&eacute;es.
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
                Cours populaires
              </h2>
              <p className="text-muted-foreground">
                Les formations les plus pl&eacute;biscit&eacute;es par notre
                communaut&eacute;.
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden items-center font-medium text-primary hover:text-primary/80 md:flex"
            >
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
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
                Voir tous les cours
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
            Rejoignez la communaut&eacute; Khatantan
          </h2>
          <p className="mb-8 text-lg text-white/80">
            Inscrivez-vous pour recevoir nos conseils bien-&ecirc;tre et
            &ecirc;tre inform&eacute; des nouveaux cours.
          </p>
          <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="w-full rounded-full px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              S'inscrire
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

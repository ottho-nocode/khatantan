import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

function FavoritesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useDatabaseQuery({
    from: "favorites",
    where: { field: "student_id", operator: "eq", value: user?.id ?? "" },
    include: { courses: true },
    orderBy: [{ field: "created_at", direction: "desc" }],
  });

  const favorites = data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          {t("favorites.title")}
        </h1>
        <p className="text-muted-foreground">{t("favorites.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 py-16">
          <Heart className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">
            {t("favorites.noFavorites")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("favorites.noFavoritesSubtitle")}
          </p>
          <Link to="/courses" className="mt-4">
            <Button className="gap-2">{t("favorites.exploreCourses")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav: any) => {
            const course = fav.courses;
            if (!course) return null;

            return (
              <div
                key={fav.id}
                className="group overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-card"
              >
                <div className="relative aspect-[4/3]">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm">
                      <Heart className="h-4 w-4 fill-primary text-primary" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base font-bold text-foreground line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  <Link
                    to="/courses/$courseSlug"
                    params={{ courseSlug: course.slug }}
                    className="mt-3 block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      {t("favorites.viewCourse")}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_app/favorites")({
  component: FavoritesPage,
});

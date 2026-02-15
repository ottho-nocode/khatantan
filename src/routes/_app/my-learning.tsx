import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function MyLearningPage() {
  const { user } = useAuth();

  const { data: enrollmentsData, isLoading } = useDatabaseQuery({
    from: "enrollments",
    where: { field: "student_id", operator: "eq", value: user?.id ?? "" },
    include: { courses: true },
    orderBy: [{ field: "enrolled_at", direction: "desc" }],
  });

  const enrollments = enrollmentsData?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Mes cours
        </h1>
        <p className="text-muted-foreground">
          Reprenez votre apprentissage l&agrave; o&ugrave; vous l'avez
          laiss&eacute;.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Aucun cours en cours</p>
          <p className="text-sm text-muted-foreground">
            Explorez le catalogue pour trouver votre prochain cours
          </p>
          <Link to="/courses" className="mt-4">
            <Button className="gap-2">Explorer les cours</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {enrollments.map((enrollment: any) => {
            const course = enrollment.courses;
            if (!course) return null;
            const progress = Number(enrollment.progress_percent ?? 0);

            const levelLabel =
              course.level === "beginner"
                ? "D\u00e9butant"
                : course.level === "intermediate"
                  ? "Interm\u00e9diaire"
                  : course.level === "advanced"
                    ? "Avanc\u00e9"
                    : "Tous niveaux";

            const categoryName = course.categories?.name ?? "";

            return (
              <div
                key={enrollment.id}
                className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-card"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail with play overlay */}
                  <div className="relative aspect-video w-full md:aspect-auto md:w-72 lg:w-80">
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      {categoryName && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {categoryName}
                        </span>
                      )}
                      <h3 className="mt-1 font-serif text-lg font-bold text-foreground">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Instructeur : {course.instructor_profiles?.profiles?.display_name ?? "—"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-primary">
                          {Math.round(progress)}% compl&eacute;t&eacute;
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {course.duration ?? ""}
                        </span>
                      </div>
                      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <Link
                        to="/learn/$courseSlug"
                        params={{ courseSlug: course.slug }}
                      >
                        <Button className="w-full">
                          Continuer le cours
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_app/my-learning")({
  component: MyLearningPage,
});

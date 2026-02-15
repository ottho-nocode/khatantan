import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities";
import { Award, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardPage() {
  const { user, profile } = useAuth();

  const { data: enrollments, isLoading } = useDatabaseQuery({
    from: "enrollments",
    where: { field: "student_id", operator: "eq", value: user?.id ?? "" },
    include: { courses: true },
    orderBy: [{ field: "enrolled_at", direction: "desc" }],
    limit: 5,
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Bonjour, {profile?.display_name} !
        </h1>
        <p className="text-muted-foreground">
          Pr&ecirc;t &agrave; continuer votre apprentissage aujourd'hui ?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Loyalty Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-pink-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white/90">
              Programme de Fid&eacute;lit&eacute;
            </h3>
            <Award className="h-6 w-6 text-yellow-300" />
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold">{profile?.xp ?? 0}</span>
            <span className="ml-2 text-sm opacity-80">points</span>
          </div>
          <div className="relative pt-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-block rounded-full bg-white px-2 py-1 text-xs font-semibold text-primary">
                Actif
              </span>
            </div>
            <div className="mb-4 flex h-2 overflow-hidden rounded text-xs bg-white/20">
              <div
                style={{ width: `${Math.min(((profile?.xp ?? 0) / 200) * 100, 100)}%` }}
                className="flex flex-col justify-center whitespace-nowrap bg-white text-center text-white shadow-none"
              />
            </div>
          </div>
        </div>

        {/* Courses count */}
        <div className="flex flex-col justify-center rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-foreground">
                {enrollments?.meta.total ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">
                Cours en cours
              </span>
            </div>
          </div>
        </div>

        {/* Learning time */}
        <div className="flex flex-col justify-center rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-foreground">
                &mdash;
              </span>
              <span className="text-sm text-muted-foreground">
                Apprentissage ce mois
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-foreground">Mes cours</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : enrollments?.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 p-8 text-center">
            <p className="text-muted-foreground">
              Vous n'&ecirc;tes inscrit &agrave; aucun cours.
            </p>
            <Link to="/courses" className="mt-2 inline-block">
              <Button variant="outline" className="mt-4">
                Explorer les cours
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments?.data.map((enrollment: any) => (
              <div
                key={enrollment.id}
                className="flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm dark:bg-card"
              >
                <div className="relative aspect-video">
                  {enrollment.courses?.thumbnail_url && (
                    <img
                      src={enrollment.courses.thumbnail_url}
                      alt={enrollment.courses?.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${enrollment.progress_percent ?? 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 font-bold text-foreground line-clamp-1">
                    {enrollment.courses?.title ?? "Cours"}
                  </h3>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground">
                    Progression : {enrollment.progress_percent ?? 0}%
                  </p>
                  <Link
                    to="/learn/$courseSlug"
                    params={{
                      courseSlug: enrollment.courses?.slug ?? enrollment.course_id,
                    }}
                  >
                    <Button className="w-full" size="sm">
                      Continuer
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

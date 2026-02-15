import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities";
import { BookOpen, Users, Star } from "lucide-react";

function InstructorDashboard() {
  const { user } = useAuth();

  const { data: instructorProfile } = useDatabaseQuery({
    from: "instructor_profiles",
    where: { field: "profile_id", operator: "eq", value: user?.id ?? "" },
    limit: 1,
  });

  const instructor = instructorProfile?.data?.[0];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Tableau de bord Enseignant
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-foreground">
                {instructor?.total_courses ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">
                Cours publi&eacute;s
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-foreground">
                {instructor?.total_students ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">
                &Eacute;tudiants
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-foreground">
                {instructor?.avg_rating ?? "&mdash;"}
              </span>
              <span className="text-sm text-muted-foreground">
                Note moyenne
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/instructor/dashboard")({
  component: InstructorDashboard,
});

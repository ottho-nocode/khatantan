import { createFileRoute, Link } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useInstructorProfile } from "@/hooks/use-instructor-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users } from "lucide-react";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  review: "outline",
  published: "default",
  archived: "destructive",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  review: "En review",
  published: "Publié",
  archived: "Archivé",
};

function InstructorCourses() {
  const { instructor, isLoading: profileLoading } = useInstructorProfile();

  const { data: coursesData, isLoading: coursesLoading } = useDatabaseQuery({
    from: "courses",
    where: instructor
      ? { field: "instructor_id", operator: "eq", value: instructor.id }
      : { field: "id", operator: "eq", value: "" },
    orderBy: [{ field: "updated_at", direction: "desc" }],
    include: { categories: true },
  });

  const isLoading = profileLoading || coursesLoading;
  const courses = coursesData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mes cours</h1>
        </div>
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <Link to="/instructor/courses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau cours
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Aucun cours</p>
          <p className="text-sm text-muted-foreground">
            Créez votre premier cours pour commencer
          </p>
          <Link to="/instructor/courses/new" className="mt-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un cours
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course: any) => (
            <Link
              key={course.id}
              to="/instructor/courses/$courseId/edit"
              params={{ courseId: course.id }}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="h-16 w-24 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{course.title}</p>
                  <Badge variant={statusColors[course.status] ?? "secondary"}>
                    {statusLabels[course.status] ?? course.status}
                  </Badge>
                </div>
                {course.subtitle && (
                  <p className="truncate text-sm text-muted-foreground">
                    {course.subtitle}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.total_students ?? 0} étudiants
                  </span>
                  <span>{course.total_lessons ?? 0} leçons</span>
                  {course.categories?.name && <span>{course.categories.name}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/instructor/courses/")({
  component: InstructorCourses,
});

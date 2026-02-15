import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import database from "@/services/database";
import { CourseEditForm } from "@/components/instructor/course-edit-form";

function CourseEdit() {
  const { courseId } = Route.useParams();

  const { data: course, isLoading } = useQuery({
    queryKey: ["database", "courses", courseId],
    queryFn: () => database.getRow({ table: "courses", value: courseId }),
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  if (!course) {
    return <div className="text-destructive">Cours introuvable.</div>;
  }

  return <CourseEditForm key={courseId} course={course} courseId={courseId} />;
}

export const Route = createFileRoute("/instructor/courses/$courseId/edit")({
  component: CourseEdit,
});

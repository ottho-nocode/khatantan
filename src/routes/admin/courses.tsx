import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Search, Check, X, Eye } from "lucide-react";

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

function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const { updateRow } = useDatabaseMutation({ table: "courses" });

  const { data, isLoading, refetch } = useDatabaseQuery({
    from: "courses",
    where: search
      ? { field: "title", operator: "ilike", value: search }
      : undefined,
    include: { instructor_profiles: { include: { profiles: true } } },
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 50,
  });

  const courses = data?.data ?? [];

  const handleStatusChange = async (courseId: string, status: string) => {
    try {
      await updateRow({
        id: courseId,
        data: {
          status,
          ...(status === "published"
            ? { published_at: new Date().toISOString() }
            : {}),
        },
      });
      toast.success(`Cours ${statusLabels[status]?.toLowerCase() ?? status}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cours</h1>
        <span className="text-sm text-muted-foreground">
          {data?.meta.total ?? 0} cours
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un cours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Cours</th>
                <th className="px-4 py-2 text-left font-medium">
                  Instructeur
                </th>
                <th className="px-4 py-2 text-left font-medium">Statut</th>
                <th className="px-4 py-2 text-left font-medium">Étudiants</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: any) => (
                <tr key={course.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {course.instructor_profiles?.profiles?.display_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={statusColors[course.status] ?? "secondary"}
                    >
                      {statusLabels[course.status] ?? course.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {course.total_students ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {course.status === "review" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600"
                            title="Approuver"
                            onClick={() =>
                              handleStatusChange(course.id, "published")
                            }
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            title="Rejeter"
                            onClick={() =>
                              handleStatusChange(course.id, "draft")
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {course.status === "published" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Archiver"
                          onClick={() =>
                            handleStatusChange(course.id, "archived")
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {(course.status === "draft" ||
                        course.status === "archived") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-green-600"
                          title="Publier"
                          onClick={() =>
                            handleStatusChange(course.id, "published")
                          }
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/courses")({
  component: AdminCoursesPage,
});

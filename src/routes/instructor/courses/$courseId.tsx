import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import database from "@/services/database";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, List, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  review: "En review",
  published: "Publié",
  archived: "Archivé",
};

function CourseEditLayout() {
  const { courseId } = Route.useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ["database", "courses", courseId],
    queryFn: () =>
      database.getRow({
        table: "courses",
        value: courseId,
      }),
  });

  // Redirect to /edit when landing on the bare $courseId path
  useEffect(() => {
    const basePath = `/instructor/courses/${courseId}`;
    if (
      location.pathname === basePath ||
      location.pathname === `${basePath}/`
    ) {
      navigate({
        to: "/instructor/courses/$courseId/edit",
        params: { courseId },
        replace: true,
      });
    }
  }, [courseId, location.pathname, navigate]);

  // For lesson pages, render Outlet without tabs
  if (location.pathname.includes("/lessons/")) {
    return <Outlet />;
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  if (!course) {
    return <div className="text-destructive">Cours introuvable.</div>;
  }

  const tabs = [
    {
      to: `/instructor/courses/${courseId}/edit`,
      label: "Détails",
      icon: FileText,
    },
    {
      to: `/instructor/courses/${courseId}/curriculum`,
      label: "Curriculum",
      icon: List,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/instructor/courses"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cours
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <Badge variant="secondary">
            {statusLabels[course.status] ?? course.status}
          </Badge>
        </div>
      </div>

      <nav className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              location.pathname === tab.to
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/instructor/courses/$courseId")({
  component: CourseEditLayout,
});

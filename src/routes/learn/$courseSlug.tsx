import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import database from "@/services/database";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
};

function CoursePlayerLayout() {
  const { courseSlug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-player", courseSlug],
    queryFn: () =>
      database.getRow({
        table: "courses",
        value: courseSlug,
        field: "slug",
        include: { modules: { include: { lessons: true } } },
      }),
  });

  const { data: enrollmentData } = useDatabaseQuery({
    from: "enrollments",
    where: {
      operator: "and",
      conditions: [
        { field: "student_id", operator: "eq", value: user?.id ?? "" },
        { field: "course_id", operator: "eq", value: course?.id ?? "" },
      ],
    },
    limit: 1,
  });

  const enrollment = enrollmentData?.data?.[0];

  const { data: progressData } = useDatabaseQuery({
    from: "lesson_progress",
    where: {
      field: "enrollment_id",
      operator: "eq",
      value: enrollment?.id ?? "",
    },
  });

  const completedLessons = useMemo(() => {
    const set = new Set<string>();
    (progressData?.data ?? []).forEach((p: any) => {
      if (p.status === "completed") set.add(p.lesson_id);
    });
    return set;
  }, [progressData]);

  const sortedModules = useMemo(() => {
    return [...(course?.modules ?? [])].sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
    );
  }, [course]);

  const allLessons = useMemo(() => {
    return sortedModules.flatMap((m: any) =>
      [...(m.lessons ?? [])].sort(
        (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
      )
    );
  }, [sortedModules]);

  const progress = Number(enrollment?.progress_percent ?? 0);

  // Redirect to first lesson if on bare course URL
  useEffect(() => {
    if (!courseLoading && course && allLessons.length > 0) {
      const basePath = `/learn/${courseSlug}`;
      if (
        location.pathname === basePath ||
        location.pathname === `${basePath}/`
      ) {
        const firstUncompleted = allLessons.find(
          (l: any) => !completedLessons.has(l.id)
        );
        const target = firstUncompleted ?? allLessons[0];
        navigate({
          to: "/learn/$courseSlug/$lessonId",
          params: { courseSlug, lessonId: target.id },
          replace: true,
        });
      }
    }
  }, [
    courseLoading,
    course,
    allLessons,
    completedLessons,
    location.pathname,
    courseSlug,
    navigate,
  ]);

  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-destructive">Cours introuvable.</div>
      </div>
    );
  }

  // Extract current lessonId from URL
  const pathParts = location.pathname.split("/");
  const currentLessonId = pathParts.length > 3 ? pathParts[3] : "";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <Link
          to="/my-learning"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Mes cours
        </Link>
        <h2 className="text-sm font-bold line-clamp-2">{course.title}</h2>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-[10px] font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {sortedModules.map((module: any) => {
          const lessons = [...(module.lessons ?? [])].sort(
            (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
          );

          return (
            <div key={module.id}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {module.title}
              </div>
              {lessons.map((lesson: any) => {
                const isActive = lesson.id === currentLessonId;
                const isCompleted = completedLessons.has(lesson.id);
                const TypeIcon = typeIcons[lesson.type] ?? FileText;

                return (
                  <Link
                    key={lesson.id}
                    to="/learn/$courseSlug/$lessonId"
                    params={{ courseSlug, lessonId: lesson.id }}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <TypeIcon className="h-3 w-3 shrink-0" />
                    <span className="flex-1 truncate">{lesson.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r bg-card md:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-card shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-10 items-center justify-end px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex h-10 items-center border-b px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-xs font-medium truncate">
            {course.title}
          </span>
        </div>
        <div className="mx-auto max-w-6xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/learn/$courseSlug")({
  component: CoursePlayerLayout,
});

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import database from "@/services/database";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { QuizPlayer } from "@/components/student/quiz-player";
import { ReviewForm } from "@/components/student/review-form";

function extractVideoEmbed(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function LessonViewer() {
  const { courseSlug, lessonId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ["database", "lessons", lessonId],
    queryFn: () => database.getRow({ table: "lessons", value: lessonId }),
  });

  // Get course for navigation
  const { data: course } = useQuery({
    queryKey: ["course-player", courseSlug],
    queryFn: () =>
      database.getRow({
        table: "courses",
        value: courseSlug,
        field: "slug",
        include: { modules: { include: { lessons: true } } },
      }),
  });

  // Enrollment
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

  // Progress for this lesson
  const { data: progressData } = useDatabaseQuery({
    from: "lesson_progress",
    where: {
      operator: "and",
      conditions: [
        { field: "student_id", operator: "eq", value: user?.id ?? "" },
        { field: "lesson_id", operator: "eq", value: lessonId },
      ],
    },
    limit: 1,
  });
  const lessonProgress = progressData?.data?.[0];
  const isCompleted = lessonProgress?.status === "completed";

  // Build ordered lesson list for prev/next
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    const sorted = [...course.modules].sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
    );
    return sorted.flatMap((m: any) =>
      [...(m.lessons ?? [])].sort(
        (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
      )
    );
  }, [course]);

  const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (!user || !enrollment) return;
    setCompleting(true);
    try {
      if (lessonProgress) {
        await database.updateRow({
          table: "lesson_progress",
          id: lessonProgress.id,
          data: {
            status: "completed",
            completed_at: new Date().toISOString(),
          },
        });
      } else {
        await database.createRow({
          table: "lesson_progress",
          data: {
            student_id: user.id,
            lesson_id: lessonId,
            enrollment_id: enrollment.id,
            status: "completed",
            completed_at: new Date().toISOString(),
          },
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["database", "lesson_progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "enrollments"],
      });
      toast.success("Leçon marquée comme terminée !");

      // Auto-navigate to next lesson
      if (nextLesson) {
        navigate({
          to: "/learn/$courseSlug/$lessonId",
          params: { courseSlug, lessonId: nextLesson.id },
        });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    } finally {
      setCompleting(false);
    }
  };

  if (lessonLoading) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  if (!lesson) {
    return <div className="text-destructive">Leçon introuvable.</div>;
  }

  const embedUrl = lesson.video_url
    ? extractVideoEmbed(lesson.video_url)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">{lesson.title}</h1>

      {/* Video player */}
      {lesson.type === "video" && embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Text content */}
      {(lesson.type === "text" || lesson.type === "video") && lesson.content && (
        <div
          className="text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {/* Quiz player */}
      {lesson.type === "quiz" && (
        <QuizPlayer lessonId={lessonId} enrollmentId={enrollment?.id} />
      )}

      {/* Review form (show on last lesson) */}
      {!nextLesson && course?.id && (
        <div className="border-t pt-6">
          <ReviewForm courseId={course.id} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          {prevLesson && (
            <Link
              to="/learn/$courseSlug/$lessonId"
              params={{ courseSlug, lessonId: prevLesson.id }}
            >
              <Button variant="outline" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted && lesson.type !== "quiz" && (
            <Button
              onClick={handleMarkComplete}
              disabled={completing || !enrollment}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {completing ? "..." : "Marquer comme terminé"}
            </Button>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Terminé
            </span>
          )}
        </div>

        <div>
          {nextLesson && (
            <Link
              to="/learn/$courseSlug/$lessonId"
              params={{ courseSlug, lessonId: nextLesson.id }}
            >
              <Button variant="outline" size="sm" className="gap-1">
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/learn/$courseSlug/$lessonId")({
  component: LessonViewer,
});

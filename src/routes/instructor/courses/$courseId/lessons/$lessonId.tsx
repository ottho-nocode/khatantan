import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import database from "@/services/database";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Video, FileText, HelpCircle } from "lucide-react";
import { QuizBuilder } from "@/components/instructor/quiz-builder";

interface LessonFormData {
  title: string;
  video_url: string;
  video_duration_seconds: number;
  content: string;
  is_preview: boolean;
  is_required: boolean;
}

function extractVideoEmbed(url: string): string | null {
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
};

function LessonEditorInner({
  lesson,
  courseId,
  lessonId,
}: {
  lesson: any;
  courseId: string;
  lessonId: string;
}) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateRow } = useDatabaseMutation({ table: "lessons" });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isDirty },
  } = useForm<LessonFormData>({
    defaultValues: {
      title: lesson.title ?? "",
      video_url: lesson.video_url ?? "",
      video_duration_seconds: lesson.video_duration_seconds ?? 0,
      content: lesson.content ?? "",
      is_preview: lesson.is_preview ?? false,
      is_required: lesson.is_required ?? true,
    },
  });

  const videoUrl = watch("video_url");
  const embedUrl = extractVideoEmbed(videoUrl ?? "");

  const onSubmit = async (data: LessonFormData) => {
    setIsSubmitting(true);
    try {
      await updateRow({
        id: lessonId,
        data: {
          title: data.title,
          video_url: data.video_url || null,
          video_duration_seconds: Number(data.video_duration_seconds) || 0,
          content: data.content || null,
          is_preview: data.is_preview,
          is_required: data.is_required,
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "lessons", lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "modules", "course", courseId],
      });
      toast.success("Leçon mise à jour !");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TypeIcon = typeIcons[lesson.type] ?? FileText;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/instructor/courses/$courseId/curriculum"
          params={{ courseId }}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au curriculum
        </Link>
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          <span className="text-sm capitalize text-muted-foreground">
            ({lesson.type})
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Titre de la leçon</Label>
          <Input id="title" {...register("title", { required: true })} />
        </div>

        <div className="flex gap-6">
          <Controller
            name="is_preview"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Aperçu gratuit</Label>
              </div>
            )}
          />
          <Controller
            name="is_required"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Requis pour complétion</Label>
              </div>
            )}
          />
        </div>

        {/* Video fields */}
        {lesson.type === "video" && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Vidéo</h2>

            <div className="grid gap-2">
              <Label htmlFor="video_url">URL de la vidéo</Label>
              <Input
                id="video_url"
                placeholder="https://youtube.com/watch?v=..."
                {...register("video_url")}
              />
              <p className="text-xs text-muted-foreground">YouTube ou Vimeo</p>
            </div>

            {embedUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <iframe
                  src={embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="video_duration_seconds">Durée (secondes)</Label>
              <Input
                id="video_duration_seconds"
                type="number"
                {...register("video_duration_seconds")}
              />
            </div>
          </section>
        )}

        {/* Content editor */}
        {(lesson.type === "video" || lesson.type === "text") && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">
              {lesson.type === "video" ? "Contenu complémentaire" : "Contenu"}
            </h2>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TipTapEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder={
                    lesson.type === "video"
                      ? "Notes, ressources complémentaires..."
                      : "Rédigez le contenu de la leçon..."
                  }
                />
              )}
            />
          </section>
        )}

        {/* Quiz builder */}
        {lesson.type === "quiz" && (
          <QuizBuilder lessonId={lessonId} />
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function LessonEditor() {
  const { courseId, lessonId } = Route.useParams();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["database", "lessons", lessonId],
    queryFn: () => database.getRow({ table: "lessons", value: lessonId }),
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  if (!lesson) {
    return <div className="text-destructive">Leçon introuvable.</div>;
  }

  return (
    <LessonEditorInner
      key={lessonId}
      lesson={lesson}
      courseId={courseId}
      lessonId={lessonId}
    />
  );
}

export const Route = createFileRoute(
  "/instructor/courses/$courseId/lessons/$lessonId"
)({
  component: LessonEditor,
});

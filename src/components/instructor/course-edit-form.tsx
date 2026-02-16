import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { useFileUpload } from "@/utilities/useFileUpload";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Upload, X, Eye, EyeOff, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseEditData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnail_url: string;
  promo_video_url: string;
  category_id: string;
  level: string;
  language: string;
  requirements: string;
  what_you_will_learn: string;
}

export function CourseEditForm({
  course,
  courseId,
}: {
  course: any;
  courseId: string;
}) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useDatabaseQuery({
    from: "categories",
    orderBy: [{ field: "name", direction: "asc" }],
  });
  const categories = categoriesData?.data ?? [];

  const { updateRow } = useDatabaseMutation({ table: "courses" });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CourseEditData>({
    defaultValues: {
      title: course.title ?? "",
      slug: course.slug ?? "",
      subtitle: course.subtitle ?? "",
      description: course.description ?? "",
      thumbnail_url: course.thumbnail_url ?? "",
      promo_video_url: course.promo_video_url ?? "",
      category_id: course.category_id ?? "",
      level: course.level ?? "all_levels",
      language: course.language ?? "fr",
      requirements: (course.requirements ?? []).join("\n"),
      what_you_will_learn: (course.what_you_will_learn ?? []).join("\n"),
    },
  });

  const thumbnailUrl = watch("thumbnail_url");

  const {
    onDrop,
    onClick,
    onChange: onFileChange,
    fileInputRef,
    isLoading: uploading,
  } = useFileUpload({
    bucket: "course-thumbnails",
    folder: courseId,
    onSuccess: (file) => {
      setValue("thumbnail_url", file.url, { shouldDirty: true });
    },
  });

  const onSubmit = async (data: CourseEditData) => {
    setIsSubmitting(true);
    try {
      await updateRow({
        id: courseId,
        data: {
          title: data.title,
          slug: data.slug,
          subtitle: data.subtitle,
          description: data.description,
          thumbnail_url: data.thumbnail_url,
          promo_video_url: data.promo_video_url,
          category_id: data.category_id || null,
          level: data.level,
          language: data.language,
          requirements: data.requirements
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          what_you_will_learn: data.what_you_will_learn
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "courses", courseId],
      });
      toast.success("Cours mis à jour !");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* Basic Info */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Informations générales</h2>

        <div className="grid gap-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            {...register("title", { required: "Le titre est requis" })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subtitle">Sous-titre</Label>
          <Textarea id="subtitle" {...register("subtitle")} rows={2} />
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TipTapEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Décrivez votre cours en détail..."
              />
            )}
          />
        </div>
      </section>

      {/* Media */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Médias</h2>

        <div className="grid gap-2">
          <Label>Image de couverture</Label>
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={onClick}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            {thumbnailUrl ? (
              <div className="relative">
                <img
                  src={thumbnailUrl}
                  alt="Couverture"
                  className="max-h-48 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue("thumbnail_url", "", { shouldDirty: true });
                  }}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {uploading
                    ? "Upload en cours..."
                    : "Cliquez ou déposez une image"}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="promo_video_url">URL vidéo promotionnelle</Label>
          <Input
            id="promo_video_url"
            placeholder="https://youtube.com/watch?v=..."
            {...register("promo_video_url")}
          />
          <p className="text-xs text-muted-foreground">
            URL YouTube ou Vimeo pour la vidéo de présentation
          </p>
        </div>
      </section>

      {/* Classification */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Classification</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Catégorie</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Niveau</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                    <SelectItem value="all_levels">Tous niveaux</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Langue</Label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </section>

      {/* Requirements & Learning objectives */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Contenu pédagogique</h2>

        <div className="grid gap-2">
          <Label htmlFor="requirements">Prérequis</Label>
          <Textarea
            id="requirements"
            placeholder="Un prérequis par ligne"
            rows={3}
            {...register("requirements")}
          />
          <p className="text-xs text-muted-foreground">
            Un prérequis par ligne
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="what_you_will_learn">
            Objectifs d'apprentissage
          </Label>
          <Textarea
            id="what_you_will_learn"
            placeholder="Un objectif par ligne"
            rows={3}
            {...register("what_you_will_learn")}
          />
          <p className="text-xs text-muted-foreground">
            Un objectif par ligne
          </p>
        </div>
      </section>

      {/* Status management */}
      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Publication</h2>
            <p className="text-sm text-muted-foreground">
              Statut actuel :{" "}
              <Badge
                variant={
                  course.status === "published"
                    ? "default"
                    : course.status === "archived"
                      ? "destructive"
                      : "secondary"
                }
              >
                {course.status === "published"
                  ? "Publié"
                  : course.status === "archived"
                    ? "Archivé"
                    : course.status === "review"
                      ? "En review"
                      : "Brouillon"}
              </Badge>
            </p>
          </div>
          <div className="flex gap-2">
            {(course.status === "draft" || course.status === "archived") && (
              <Button
                type="button"
                variant="default"
                className="gap-2"
                onClick={async () => {
                  try {
                    await updateRow({
                      id: courseId,
                      data: {
                        status: "published",
                        published_at: new Date().toISOString(),
                      },
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["database", "courses", courseId],
                    });
                    toast.success("Cours publié !");
                  } catch (err: any) {
                    toast.error(err?.message ?? "Erreur");
                  }
                }}
              >
                <Eye className="h-4 w-4" />
                Publier
              </Button>
            )}
            {course.status === "published" && (
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    await updateRow({
                      id: courseId,
                      data: { status: "archived" },
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["database", "courses", courseId],
                    });
                    toast.success("Cours archivé");
                  } catch (err: any) {
                    toast.error(err?.message ?? "Erreur");
                  }
                }}
              >
                <EyeOff className="h-4 w-4" />
                Archiver
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

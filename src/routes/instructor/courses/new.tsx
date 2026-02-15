import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { useInstructorProfile } from "@/hooks/use-instructor-profile";
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

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CourseFormData {
  title: string;
  subtitle: string;
  slug: string;
  category_id: string;
  level: string;
  language: string;
}

function NewCourse() {
  const navigate = useNavigate();
  const { instructor, ensureProfile } = useInstructorProfile();
  const { createRow } = useDatabaseMutation({ table: "courses" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useDatabaseQuery({
    from: "categories",
    orderBy: [{ field: "name", direction: "asc" }],
  });
  const categories = categoriesData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      subtitle: "",
      slug: "",
      category_id: "",
      level: "all_levels",
      language: "fr",
    },
  });

  const watchTitle = watch("title");

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    const currentSlug = watch("slug");
    const expectedSlug = generateSlug(watchTitle);
    if (!currentSlug || currentSlug === expectedSlug) {
      setValue("slug", generateSlug(title));
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const profile = instructor ?? (await ensureProfile());
      if (!profile) {
        toast.error("Impossible de créer le profil instructeur");
        return;
      }

      const result = await createRow({
        data: {
          ...data,
          instructor_id: profile.id,
          status: "draft",
        },
      });

      toast.success("Cours créé !");
      navigate({
        to: "/instructor/courses/$courseId/edit",
        params: { courseId: result.id },
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Nouveau cours</h1>
        <p className="text-muted-foreground">
          Renseignez les informations de base de votre cours.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-2xl flex-col gap-6"
      >
        <div className="grid gap-2">
          <Label htmlFor="title">Titre du cours *</Label>
          <Input
            id="title"
            placeholder="Ex: Introduction au développement web"
            {...register("title", {
              required: "Le titre est requis",
              onChange: onTitleChange,
            })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            placeholder="introduction-au-developpement-web"
            {...register("slug", { required: "Le slug est requis" })}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subtitle">Sous-titre</Label>
          <Textarea
            id="subtitle"
            placeholder="Une brève description de votre cours"
            {...register("subtitle")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Catégorie *</Label>
            <Select onValueChange={(v) => setValue("category_id", v)}>
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
            {errors.category_id && (
              <p className="text-sm text-destructive">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Niveau</Label>
            <Select
              defaultValue="all_levels"
              onValueChange={(v) => setValue("level", v)}
            >
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
          </div>

          <div className="grid gap-2">
            <Label>Langue</Label>
            <Select
              defaultValue="fr"
              onValueChange={(v) => setValue("language", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le cours"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/instructor/courses" })}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}

export const Route = createFileRoute("/instructor/courses/new")({
  component: NewCourse,
});

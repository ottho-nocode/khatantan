import { Link } from "@tanstack/react-router";
import { Clock, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: any;
}

export function CourseCard({ course }: CourseCardProps) {
  const levelLabel =
    course.level === "beginner"
      ? "Débutant"
      : course.level === "intermediate"
        ? "Intermédiaire"
        : course.level === "advanced"
          ? "Avancé"
          : "Tous niveaux";

  const instructorName =
    course.instructor_profiles?.profiles?.display_name ??
    course.instructorName ??
    "Enseignant";

  const categoryName =
    course.categories?.name ?? course.category ?? "";

  const price =
    typeof course.price_cents === "number"
      ? course.price_cents === 0
        ? "Gratuit"
        : `${(course.price_cents / 100).toFixed(0)} €`
      : typeof course.price === "number"
        ? `${course.price.toLocaleString()} ₮`
        : "—";

  return (
    <div className="group overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        {(course.thumbnail_url || course.imageUrl) && (
          <img
            src={course.thumbnail_url || course.imageUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {categoryName && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            {categoryName}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="min-h-[3.5rem] font-serif text-lg font-bold text-foreground line-clamp-2">
          {course.title}
        </h3>

        {(course.subtitle || course.description) && (
          <p className="mb-4 mt-1 text-sm text-muted-foreground line-clamp-2">
            {course.subtitle || course.description}
          </p>
        )}

        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {course.duration}
            </div>
          )}
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {course.rating}
              {course.reviewsCount && ` (${course.reviewsCount})`}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {levelLabel}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-primary/5 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Enseignant</span>
            <span className="text-sm font-medium text-foreground">
              {instructorName}
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-primary">{price}</span>
          </div>
        </div>

        <Link
          to="/courses/$courseSlug"
          params={{ courseSlug: course.slug || course.id }}
          className="mt-4 block"
        >
          <Button className="w-full" variant="secondary">
            Voir le cours
          </Button>
        </Link>
      </div>
    </div>
  );
}

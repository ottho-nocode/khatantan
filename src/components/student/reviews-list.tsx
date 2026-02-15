import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Star } from "lucide-react";

interface ReviewsListProps {
  courseId: string;
}

export function ReviewsList({ courseId }: ReviewsListProps) {
  const { data, isLoading } = useDatabaseQuery({
    from: "reviews",
    where: {
      operator: "and",
      conditions: [
        { field: "course_id", operator: "eq", value: courseId },
        { field: "is_visible", operator: "eq", value: true },
      ],
    },
    include: { profiles: true },
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 20,
  });

  const reviews = data?.data ?? [];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review: any) => (
        <div key={review.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {review.profiles?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <span className="text-sm font-medium">
                {review.profiles?.display_name ?? "Anonyme"}
              </span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
          {review.title && (
            <p className="mt-2 text-sm font-medium">{review.title}</p>
          )}
          {review.body && (
            <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
          )}
          {review.instructor_reply && (
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium">Réponse de l'instructeur</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {review.instructor_reply}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

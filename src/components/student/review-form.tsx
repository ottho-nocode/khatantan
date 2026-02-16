import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Star } from "lucide-react";

interface ReviewFormProps {
  courseId: string;
}

export function ReviewForm({ courseId }: ReviewFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: existingReview, refetch } = useDatabaseQuery({
    from: "reviews",
    where: {
      operator: "and",
      conditions: [
        { field: "student_id", operator: "eq", value: user?.id ?? "" },
        { field: "course_id", operator: "eq", value: courseId },
      ],
    },
    limit: 1,
  });

  const existing = existingReview?.data?.[0] as any;
  const { createRow, updateRow } = useDatabaseMutation({ table: "reviews" });

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      if (existing) {
        await updateRow({
          id: existing.id,
          data: { rating, title: title || null, body: body || null },
        });
        toast.success(t("reviews.updated"));
      } else {
        await createRow({
          data: {
            student_id: user.id,
            course_id: courseId,
            rating,
            title: title || null,
            body: body || null,
          },
        });
        toast.success(t("reviews.thanks"));
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  // If already reviewed, show existing review with edit option
  if (existing && !submitting) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">{t("reviews.yourReview")}</p>
        <div className="mt-1 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i <= existing.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        {existing.title && (
          <p className="mt-1 text-sm font-medium">{existing.title}</p>
        )}
        {existing.body && (
          <p className="mt-1 text-sm text-muted-foreground">{existing.body}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <p className="text-sm font-medium">{t("reviews.leaveReview")}</p>

      {/* Star rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                i <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>

      <Input
        placeholder={t("reviews.titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder={t("reviews.bodyPlaceholder")}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />
      <Button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="w-fit"
      >
        {submitting ? t("reviews.submitting") : t("reviews.submit")}
      </Button>
    </div>
  );
}

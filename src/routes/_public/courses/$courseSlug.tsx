import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import database from "@/services/database";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Eye,
  Check,
  Play,
  Heart,
  Infinity,
  MessageCircle,
  GraduationCap,
} from "lucide-react";
import { ReviewsList } from "@/components/student/reviews-list";

const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
};

function ModuleAccordion({
  module,
  index,
}: {
  module: any;
  index: number;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(index === 0);
  const lessons = [...(module.lessons ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
  );

  return (
    <div className="border-b border-primary/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/50"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 font-serif text-sm font-bold text-foreground">
          {module.title}
        </span>
        <span className="text-xs text-muted-foreground">
          {lessons.length}{" "}
          {lessons.length !== 1 ? t("courses.lessons") : t("courses.lesson")}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 pb-3">
          {lessons.map((lesson: any, li: number) => {
            const TypeIcon = typeIcons[lesson.type] ?? FileText;
            const mins = lesson.video_duration_seconds
              ? Math.floor(lesson.video_duration_seconds / 60)
              : 0;
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-3 px-5 py-2 pl-12 text-sm"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/20 text-[10px] text-muted-foreground">
                  {lesson.is_preview ? (
                    <Play className="h-2.5 w-2.5 fill-primary text-primary" />
                  ) : (
                    li + 1
                  )}
                </span>
                <TypeIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-muted-foreground">
                  {lesson.title}
                </span>
                {lesson.is_preview && (
                  <span className="text-[10px] font-medium uppercase text-primary">
                    <Eye className="mr-0.5 inline h-3 w-3" />
                    {t("courses.preview")}
                  </span>
                )}
                {mins > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {mins}:{String(
                      (lesson.video_duration_seconds ?? 0) % 60,
                    ).padStart(2, "0")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CourseDetailPage() {
  const { courseSlug } = Route.useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [enrolling, setEnrolling] = useState(false);

  const levelLabels: Record<string, string> = {
    beginner: t("courses.beginner"),
    intermediate: t("courses.intermediate"),
    advanced: t("courses.advanced"),
    all_levels: t("courses.allLevels"),
  };

  const { data: course, isLoading } = useQuery({
    queryKey: ["course-detail", courseSlug],
    queryFn: () =>
      database.getRow({
        table: "courses",
        value: courseSlug,
        field: "slug",
        include: {
          modules: { include: { lessons: true } },
          categories: true,
          instructor_profiles: { include: { profiles: true } },
        },
      }),
  });

  const { data: enrollmentData } = useDatabaseQuery({
    from: "enrollments",
    where: {
      operator: "and",
      conditions: [
        { field: "student_id", operator: "eq", value: user?.id ?? "" },
        { field: "course_id", operator: "eq", value: (course as any)?.id ?? "" },
      ],
    },
    limit: 1,
  });

  const isEnrolled = (enrollmentData?.data?.length ?? 0) > 0;

  // Favorites
  const { data: favoriteData } = useDatabaseQuery({
    from: "favorites",
    where: {
      operator: "and",
      conditions: [
        { field: "student_id", operator: "eq", value: user?.id ?? "" },
        { field: "course_id", operator: "eq", value: (course as any)?.id ?? "" },
      ],
    },
    limit: 1,
  });
  const existingFavorite = favoriteData?.data?.[0] as any;
  const isFavorited = !!existingFavorite;
  const { createRow: createFavorite, deleteRow: deleteFavorite } =
    useDatabaseMutation({ table: "favorites" });
  const [togglingFav, setTogglingFav] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setTogglingFav(true);
    try {
      if (isFavorited) {
        await deleteFavorite({ id: existingFavorite.id });
        toast.success(t("courses.removedFromFavorites"));
      } else {
        await createFavorite({
          data: { student_id: user.id, course_id: (course as any).id },
        });
        toast.success(t("courses.addedToFavorites"));
      }
      queryClient.invalidateQueries({ queryKey: ["database", "favorites"] });
    } catch (err: any) {
      toast.error(err?.message ?? t("common.error"));
    } finally {
      setTogglingFav(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setEnrolling(true);
    try {
      await database.createRow({
        table: "enrollments",
        data: { student_id: user.id, course_id: (course as any).id },
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "enrollments"],
      });
      toast.success(t("courses.enrolledSuccess"));
      navigate({ to: "/learn/$courseSlug", params: { courseSlug } });
    } catch (err: any) {
      toast.error(err?.message ?? t("courses.enrollError"));
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-xl text-muted-foreground">{t("courses.notFound")}</p>
        <Link to="/courses" className="mt-4 text-primary hover:underline">
          {t("courses.backToCatalog")}
        </Link>
      </div>
    );
  }

  const c = course as any;
  const sortedModules = [...(c.modules ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
  );
  const totalLessons = sortedModules.reduce(
    (acc: number, m: any) => acc + (m.lessons?.length ?? 0),
    0,
  );
  const totalDurationSec = sortedModules.reduce(
    (acc: number, m: any) =>
      acc +
      (m.lessons ?? []).reduce(
        (la: number, l: any) => la + (l.video_duration_seconds ?? 0),
        0,
      ),
    0,
  );
  const totalHours = Math.floor(totalDurationSec / 3600);
  const totalMins = Math.round((totalDurationSec % 3600) / 60);
  const durationLabel =
    totalHours > 0
      ? `${totalHours}h ${totalMins}min`
      : totalMins > 0
        ? `${totalMins}min`
        : "";

  const instructor = c.instructor_profiles;
  const instructorName =
    instructor?.profiles?.display_name ?? t("courses.instructor");
  const instructorBio = instructor?.profiles?.bio ?? "";
  const instructorAvatar = instructor?.profiles?.avatar_url ?? "";

  const priceCents = c.price_cents ?? 0;
  const price =
    priceCents > 0
      ? `${(priceCents / 100).toLocaleString("fr-FR")} \u20ae`
      : t("courses.free");

  return (
    <div className="pb-16">
      {/* Header */}
      <section className="border-b border-primary/10 bg-white dark:bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {c.categories && (
              <>
                <span className="font-medium text-primary">
                  {c.categories.name}
                </span>
                <span>&bull;</span>
              </>
            )}
            <span>{levelLabels[c.level] ?? c.level}</span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {c.title}
          </h1>
          {c.subtitle && (
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              {c.subtitle}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {c.avg_rating && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {Number(c.avg_rating).toFixed(1)} ({c.rating_count ?? 0})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {c.total_students?.toLocaleString("fr-FR") ?? 0}{" "}
              {t("courses.students")}
            </span>
            <span>
              {t("courses.createdBy")}{" "}
              <span className="font-medium text-foreground underline underline-offset-2">
                {instructorName}
              </span>
            </span>
          </div>

          {durationLabel && (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {sortedModules.length} {t("courses.sections")} &bull;{" "}
              {totalLessons} {t("courses.lessons")} &bull; {durationLabel}{" "}
              {t("courses.total")}
            </p>
          )}
        </div>
      </section>

      {/* Main content + sidebar */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-10">
            {/* What you'll learn */}
            {c.what_you_will_learn?.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t("courses.whatYouWillLearn")}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.what_you_will_learn.map(
                    (item: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        <Check className="h-3 w-3 text-primary" />
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* Course content */}
            <section>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {t("courses.courseContent")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {sortedModules.length} {t("courses.sections")} &bull;{" "}
                {totalLessons} {t("courses.lessons")}
                {durationLabel
                  ? ` \u2022 ${durationLabel} ${t("courses.total")}`
                  : ""}
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-primary/10">
                {sortedModules.length > 0 ? (
                  sortedModules.map((mod: any, i: number) => (
                    <ModuleAccordion key={mod.id} module={mod} index={i} />
                  ))
                ) : (
                  <p className="p-6 text-sm text-muted-foreground">
                    {t("courses.noContent")}
                  </p>
                )}
              </div>
            </section>

            {/* Description */}
            {c.description && (
              <section>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t("courses.description")}
                </h2>
                <div
                  className="mt-4 text-sm leading-relaxed text-muted-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: c.description }}
                />
              </section>
            )}

            {/* Instructor */}
            <section>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {t("courses.yourInstructor")}
              </h2>
              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {instructorAvatar ? (
                    <img
                      src={instructorAvatar}
                      alt={instructorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground">
                    {instructorName}
                  </h3>
                  {instructor?.title && (
                    <p className="text-xs text-muted-foreground">
                      {instructor.title}
                    </p>
                  )}
                  {instructorBio && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {instructorBio}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {t("courses.studentReviews")}
              </h2>
              <div className="mt-4">
                <ReviewsList courseId={c.id} />
              </div>
            </section>
          </div>

          {/* Right sidebar - Price card */}
          <div className="lg:w-80 lg:shrink-0">
            <div className="sticky top-20 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-card">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {c.thumbnail_url ? (
                  <img
                    src={c.thumbnail_url}
                    alt={c.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {price}
                  </span>
                  {priceCents > 0 && c.original_price_cents && (
                    <span className="text-sm text-muted-foreground line-through">
                      {(c.original_price_cents / 100).toLocaleString("fr-FR")}{" "}
                      \u20ae
                    </span>
                  )}
                </div>

                {/* CTA */}
                {isEnrolled ? (
                  <Link to="/learn/$courseSlug" params={{ courseSlug }}>
                    <Button className="w-full gap-2" size="lg">
                      <Play className="h-4 w-4" />
                      {t("courses.continueCourse")}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling
                      ? t("courses.enrolling")
                      : priceCents > 0
                        ? t("courses.buyCourse")
                        : t("courses.enrollFree")}
                  </Button>
                )}

                {priceCents > 0 && (
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    {t("courses.guarantee")}
                  </p>
                )}

                {/* Features */}
                <div className="mt-5 flex flex-col gap-3 border-t border-primary/10 pt-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Infinity className="h-4 w-4 shrink-0 text-primary" />
                    {t("courses.unlimitedAccess")}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                    {t("courses.privateCommunity")}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                    {t("courses.certificate")}
                  </div>
                </div>

                {/* Favorite */}
                <div className="mt-5 border-t border-primary/10 pt-4">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={togglingFav}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                      isFavorited
                        ? "text-primary hover:bg-primary/5"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorited ? "fill-primary text-primary" : ""}`}
                    />
                    {togglingFav
                      ? "..."
                      : isFavorited
                        ? t("courses.inFavorites")
                        : t("courses.addToFavorites")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_public/courses/$courseSlug")({
  component: CourseDetailPage,
});

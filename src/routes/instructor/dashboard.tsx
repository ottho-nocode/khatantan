import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useInstructorProfile } from "@/hooks/use-instructor-profile";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Users, BookOpen, Star, TrendingUp } from "lucide-react";

const COLORS = [
  "oklch(0.645 0.246 16.439)",
  "oklch(0.6 0.2 250)",
  "oklch(0.65 0.2 150)",
  "oklch(0.6 0.2 50)",
  "oklch(0.55 0.2 300)",
  "oklch(0.7 0.15 100)",
];

function InstructorDashboard() {
  const { profile } = useAuth();
  const { instructor } = useInstructorProfile();

  const { data: coursesData } = useDatabaseQuery({
    from: "courses",
    where: {
      field: "instructor_id",
      operator: "eq",
      value: instructor?.id ?? "",
    },
    orderBy: [{ field: "created_at", direction: "desc" }],
  });
  const courses = (coursesData?.data ?? []) as any[];

  const courseIds = courses.map((c: any) => c.id);
  const { data: enrollmentsData } = useDatabaseQuery({
    from: "enrollments",
    where: {
      field: "course_id",
      operator: "in",
      value: courseIds.length > 0 ? courseIds : ["__none__"],
    },
    orderBy: [{ field: "enrolled_at", direction: "asc" }],
    limit: 500,
  });
  const enrollments = (enrollmentsData?.data ?? []) as any[];

  const { data: reviewsData } = useDatabaseQuery({
    from: "reviews",
    where: {
      field: "course_id",
      operator: "in",
      value: courseIds.length > 0 ? courseIds : ["__none__"],
    },
    include: { profiles: true, courses: true },
    orderBy: [{ field: "created_at", direction: "desc" }],
  });
  const reviews = (reviewsData?.data ?? []) as any[];

  // Enrollments per month (last 6 months)
  const enrollmentsByMonth = useMemo(() => {
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      });
      const filtered = enrollments.filter((e: any) =>
        e.enrolled_at?.startsWith(key),
      );
      months.push({ label, count: filtered.length });
    }
    return months;
  }, [enrollments]);

  // Enrollments per course (pie chart)
  const enrollmentsByCourse = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const course of courses) {
      map.set(course.id, { name: course.title, count: 0 });
    }
    for (const e of enrollments) {
      const entry = map.get(e.course_id);
      if (entry) entry.count++;
    }
    return Array.from(map.values())
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [courses, enrollments]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = [
      { stars: "5\u2605", count: 0 },
      { stars: "4\u2605", count: 0 },
      { stars: "3\u2605", count: 0 },
      { stars: "2\u2605", count: 0 },
      { stars: "1\u2605", count: 0 },
    ];
    for (const r of reviews) {
      const idx = 5 - (r.rating ?? 0);
      if (idx >= 0 && idx < 5) dist[idx].count++;
    }
    return dist;
  }, [reviews]);

  const totalStudents = instructor?.total_students ?? enrollments.length;
  const totalRevenue = enrollments.reduce(
    (sum: number, e: any) => sum + (e.amount_paid_cents ?? 0),
    0,
  );
  const avgRating = instructor?.avg_rating ?? 0;
  const publishedCourses = courses.filter(
    (c: any) => c.status === "published",
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Bonjour, {profile?.display_name} !
        </h1>
        <p className="text-sm text-muted-foreground">
          Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Étudiants"
          value={totalStudents}
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Revenus"
          value={`${Math.round(totalRevenue / 100)}\u20AE`}
          color="bg-green-50 text-green-500"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Cours publiés"
          value={publishedCourses}
          color="bg-purple-50 text-purple-500"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Note moyenne"
          value={Number(avgRating) > 0 ? Number(avgRating).toFixed(1) : "\u2014"}
          color="bg-yellow-50 text-yellow-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enrollments over time */}
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Inscriptions par mois
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentsByMonth}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.645 0.246 16.439)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.645 0.246 16.439)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value, "Inscriptions"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.645 0.246 16.439)"
                  strokeWidth={2}
                  fill="url(#enrollGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollments by course (pie) */}
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Répartition par cours
          </h3>
          {enrollmentsByCourse.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={enrollmentsByCourse}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {enrollmentsByCourse.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [value, "Étudiants"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {enrollmentsByCourse.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                    <span className="line-clamp-1 text-muted-foreground">
                      {item.name}
                    </span>
                    <span className="ml-auto font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune inscription pour le moment.
            </p>
          )}
        </div>
      </div>

      {/* Rating distribution + courses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Rating distribution */}
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Distribution des avis
          </h3>
          {reviews.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="stars"
                    tick={{ fontSize: 11 }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #eee",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [value, "Avis"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.645 0.246 16.439)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun avis pour le moment.
            </p>
          )}
        </div>

        {/* Top courses mini-table */}
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-3 text-sm font-semibold">Vos cours</h3>
          <div className="flex flex-col gap-2">
            {courses.slice(0, 5).map((course: any) => (
              <Link
                key={course.id}
                to="/instructor/courses/$courseId/edit"
                params={{ courseId: course.id }}
                className="flex items-center justify-between rounded-lg p-2 text-xs transition-colors hover:bg-accent"
              >
                <span className="line-clamp-1 flex-1 font-medium">
                  {course.title}
                </span>
                {Number(course.avg_rating) > 0 && (
                  <span className="mr-2 inline-flex items-center gap-0.5 text-[10px]">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {Number(course.avg_rating).toFixed(1)}
                  </span>
                )}
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    course.status === "published"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.status === "published" ? "Publié" : "Brouillon"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Star className="h-4 w-4" />
          Avis récents ({reviews.length})
        </h3>
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reviews.slice(0, 8).map((review: any) => (
              <div
                key={review.id}
                className="flex items-start gap-3 rounded-lg border border-primary/5 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {review.profiles?.display_name?.charAt(0)?.toUpperCase() ??
                    "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {review.profiles?.display_name ?? "Anonyme"}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {review.courses?.title ?? "Cours"}
                  </p>
                  {review.title && (
                    <p className="mt-1 text-sm font-medium">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {review.body}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString("fr-FR")
                    : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun avis pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm dark:bg-card">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}
        >
          {icon}
        </div>
        <div>
          <span className="block text-xl font-bold text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/instructor/dashboard")({
  component: InstructorDashboard,
});

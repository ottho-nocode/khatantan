import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  Receipt,
  ArrowUpRight,
  Users,
  GraduationCap,
  BookOpen,
  Star,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const COLORS = [
  "oklch(0.645 0.246 16.439)",
  "oklch(0.6 0.2 250)",
  "oklch(0.65 0.2 150)",
  "oklch(0.6 0.2 50)",
  "oklch(0.55 0.2 300)",
  "oklch(0.7 0.15 100)",
];

const COMMISSION_RATE = 0.2;

const fmt = (cents: number) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(cents / 100))}\u20AE`;

function AdminDashboard() {
  const [instructorSearch, setInstructorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Platform counts
  const { data: usersData } = useDatabaseQuery({
    from: "profiles",
    limit: 0,
  });
  const { data: reviewsCountData } = useDatabaseQuery({
    from: "reviews",
    limit: 0,
  });

  // Recent reviews with details
  const { data: reviewsData } = useDatabaseQuery({
    from: "reviews",
    include: { profiles: true, courses: true },
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 10,
  });
  const recentReviews = (reviewsData?.data ?? []) as any[];

  // All enrollments with course + student info
  const { data: enrollmentsData } = useDatabaseQuery({
    from: "enrollments",
    include: {
      courses: {
        include: { instructor_profiles: { include: { profiles: true } } },
      },
      profiles: true,
    },
    orderBy: [{ field: "enrolled_at", direction: "asc" }],
    limit: 5000,
  });
  const enrollments = (enrollmentsData?.data ?? []) as any[];

  // All courses
  const { data: coursesData } = useDatabaseQuery({
    from: "courses",
    include: { instructor_profiles: { include: { profiles: true } } },
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 500,
  });
  const courses = (coursesData?.data ?? []) as any[];

  // --- Totals ---
  const totalBrut = enrollments.reduce(
    (sum: number, e: any) => sum + (e.amount_paid_cents ?? 0),
    0,
  );
  const totalCommission = Math.round(totalBrut * COMMISSION_RATE);
  const totalInstructorPayout = totalBrut - totalCommission;
  const totalSales = enrollments.length;

  // Current month
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthEnrollments = enrollments.filter((e: any) =>
    e.enrolled_at?.startsWith(currentMonthKey),
  );
  const currentMonthRevenue = currentMonthEnrollments.reduce(
    (sum: number, e: any) => sum + (e.amount_paid_cents ?? 0),
    0,
  );

  // Last month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthRevenue = enrollments
    .filter((e: any) => e.enrolled_at?.startsWith(lastMonthKey))
    .reduce((sum: number, e: any) => sum + (e.amount_paid_cents ?? 0), 0);

  const monthGrowth =
    lastMonthRevenue > 0
      ? Math.round(
          ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
        )
      : currentMonthRevenue > 0
        ? 100
        : 0;

  // --- Revenue by month (12 months) ---
  const revenueByMonth = useMemo(() => {
    const months: {
      label: string;
      brut: number;
      commission: number;
      instructeur: number;
      ventes: number;
    }[] = [];
    for (let i = 11; i >= 0; i--) {
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
      const brut = filtered.reduce(
        (sum: number, e: any) => sum + (e.amount_paid_cents ?? 0),
        0,
      );
      const commission = Math.round(brut * COMMISSION_RATE);
      months.push({
        label,
        brut,
        commission,
        instructeur: brut - commission,
        ventes: filtered.length,
      });
    }
    return months;
  }, [enrollments]);

  // --- Revenue by instructor ---
  const revenueByInstructor = useMemo(() => {
    const map = new Map<
      string,
      { name: string; brut: number; ventes: number; coursCount: number }
    >();
    for (const c of courses) {
      const instrId = c.instructor_id;
      const instrName =
        c.instructor_profiles?.profiles?.display_name ?? "Inconnu";
      if (!map.has(instrId)) {
        map.set(instrId, {
          name: instrName,
          brut: 0,
          ventes: 0,
          coursCount: 0,
        });
      }
      map.get(instrId)!.coursCount++;
    }
    for (const e of enrollments) {
      const instrId = e.courses?.instructor_id;
      if (instrId && map.has(instrId)) {
        map.get(instrId)!.brut += e.amount_paid_cents ?? 0;
        map.get(instrId)!.ventes++;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.brut - a.brut);
  }, [courses, enrollments]);

  const filteredInstructors = instructorSearch
    ? revenueByInstructor.filter((i) =>
        i.name.toLowerCase().includes(instructorSearch.toLowerCase()),
      )
    : revenueByInstructor;

  // --- Spending by student ---
  const spendingByStudent = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; achats: number }
    >();
    for (const e of enrollments) {
      const studentId = e.student_id;
      const studentName = e.profiles?.display_name ?? "Inconnu";
      if (!map.has(studentId)) {
        map.set(studentId, { name: studentName, total: 0, achats: 0 });
      }
      map.get(studentId)!.total += e.amount_paid_cents ?? 0;
      map.get(studentId)!.achats++;
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [enrollments]);

  const filteredStudents = studentSearch
    ? spendingByStudent.filter((s) =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()),
      )
    : spendingByStudent;

  // --- Revenue by course ---
  const revenueByCourse = useMemo(() => {
    const map = new Map<
      string,
      { name: string; brut: number; ventes: number; instructor: string; avgRating: number; ratingCount: number }
    >();
    for (const c of courses) {
      map.set(c.id, {
        name: c.title,
        brut: 0,
        ventes: 0,
        instructor:
          c.instructor_profiles?.profiles?.display_name ?? "Inconnu",
        avgRating: Number(c.avg_rating) || 0,
        ratingCount: c.rating_count ?? 0,
      });
    }
    for (const e of enrollments) {
      const entry = map.get(e.course_id);
      if (entry) {
        entry.brut += e.amount_paid_cents ?? 0;
        entry.ventes++;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.brut - a.brut);
  }, [courses, enrollments]);

  const revenuePie = revenueByCourse
    .filter((c) => c.brut > 0)
    .slice(0, 8)
    .map((c) => ({ name: c.name, value: c.brut }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble de la plateforme Khatantan.
        </p>
      </div>

      {/* Platform overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Utilisateurs"
          value={usersData?.meta.total ?? 0}
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Cours"
          value={courses.length}
          color="bg-purple-50 text-purple-500"
        />
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Inscriptions"
          value={totalSales}
          color="bg-orange-50 text-orange-500"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Avis"
          value={reviewsCountData?.meta.total ?? 0}
          color="bg-yellow-50 text-yellow-500"
        />
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          icon={<Wallet className="h-5 w-5" />}
          label="Revenus bruts"
          value={fmt(totalBrut)}
          color="bg-blue-50 text-blue-500"
        />
        <KpiCard
          icon={<Receipt className="h-5 w-5" />}
          label={`Commission plateforme (${COMMISSION_RATE * 100}%)`}
          value={fmt(totalCommission)}
          color="bg-green-50 text-green-600"
          highlight
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Versé aux enseignants"
          value={fmt(totalInstructorPayout)}
          color="bg-orange-50 text-orange-500"
        />
        <KpiCard
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="Ce mois (brut)"
          value={fmt(currentMonthRevenue)}
          color="bg-purple-50 text-purple-500"
          badge={
            monthGrowth !== 0
              ? `${monthGrowth > 0 ? "+" : ""}${monthGrowth}%`
              : undefined
          }
          badgePositive={monthGrowth >= 0}
        />
      </div>

      {/* Revenue evolution */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Revenus plateforme (12 mois)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="brutGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.6 0.2 250)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.6 0.2 250)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  fmt(value),
                  name === "brut"
                    ? "Brut"
                    : name === "commission"
                      ? "Commission"
                      : "Enseignants",
                ]}
              />
              <Area
                type="monotone"
                dataKey="brut"
                stroke="oklch(0.6 0.2 250)"
                strokeWidth={1.5}
                fill="url(#brutGradAdmin)"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="commission"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#commGrad)"
              />
              <Legend
                formatter={(value) =>
                  value === "brut"
                    ? "Brut"
                    : value === "commission"
                      ? "Commission plateforme"
                      : "Enseignants"
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales volume + Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Volume de ventes par mois
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value, "Ventes"]}
                />
                <Bar
                  dataKey="ventes"
                  fill="oklch(0.645 0.246 16.439)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Revenus par cours
          </h3>
          {revenuePie.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenuePie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {revenuePie.map((_, index) => (
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
                      formatter={(value: number) => [fmt(value), "Revenus"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 overflow-hidden">
                {revenuePie.map((item, i) => (
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
                    <span className="ml-auto shrink-0 font-medium">
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun revenu pour le moment.
            </p>
          )}
        </div>
      </div>

      {/* Revenue by instructor */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <GraduationCap className="h-4 w-4" />
            Revenus par enseignant
          </h3>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={instructorSearch}
              onChange={(e) => setInstructorSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Enseignant</th>
                <th className="pb-2 pr-4 font-medium text-right">Cours</th>
                <th className="pb-2 pr-4 font-medium text-right">Ventes</th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Revenu brut
                </th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Commission ({COMMISSION_RATE * 100}%)
                </th>
                <th className="pb-2 font-medium text-right">Versé</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map((instr, i) => {
                const commission = Math.round(instr.brut * COMMISSION_RATE);
                const payout = instr.brut - commission;
                return (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{instr.name}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {instr.coursCount}
                    </td>
                    <td className="py-3 pr-4 text-right">{instr.ventes}</td>
                    <td className="py-3 pr-4 text-right">
                      {instr.brut > 0 ? fmt(instr.brut) : "\u2014"}
                    </td>
                    <td className="py-3 pr-4 text-right text-green-600">
                      {commission > 0 ? fmt(commission) : "\u2014"}
                    </td>
                    <td className="py-3 text-right font-semibold text-orange-600">
                      {payout > 0 ? fmt(payout) : "\u2014"}
                    </td>
                  </tr>
                );
              })}
              {filteredInstructors.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Aucun enseignant
                  </td>
                </tr>
              )}
            </tbody>
            {filteredInstructors.length > 0 &&
              totalBrut > 0 &&
              !instructorSearch && (
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="pt-3 pr-4">Total</td>
                    <td className="pt-3 pr-4 text-right">{courses.length}</td>
                    <td className="pt-3 pr-4 text-right">{totalSales}</td>
                    <td className="pt-3 pr-4 text-right">{fmt(totalBrut)}</td>
                    <td className="pt-3 pr-4 text-right text-green-600">
                      {fmt(totalCommission)}
                    </td>
                    <td className="pt-3 text-right text-orange-600">
                      {fmt(totalInstructorPayout)}
                    </td>
                  </tr>
                </tfoot>
              )}
          </table>
        </div>
      </div>

      {/* Spending by student */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4" />
            Achats par étudiant
          </h3>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Étudiant</th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Cours achetés
                </th>
                <th className="pb-2 font-medium text-right">Total dépensé</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{student.name}</td>
                  <td className="py-3 pr-4 text-right">{student.achats}</td>
                  <td className="py-3 text-right font-semibold">
                    {student.total > 0 ? fmt(student.total) : "Gratuit"}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Aucun étudiant
                  </td>
                </tr>
              )}
            </tbody>
            {filteredStudents.length > 0 &&
              totalBrut > 0 &&
              !studentSearch && (
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="pt-3 pr-4">Total</td>
                    <td className="pt-3 pr-4 text-right">{totalSales}</td>
                    <td className="pt-3 text-right">{fmt(totalBrut)}</td>
                  </tr>
                </tfoot>
              )}
          </table>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Star className="h-4 w-4" />
          Avis récents
        </h3>
        {recentReviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentReviews.map((review: any) => (
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

      {/* Detailed revenue by course */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Détail par cours
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Cours</th>
                <th className="pb-2 pr-4 font-medium">Enseignant</th>
                <th className="pb-2 pr-4 font-medium text-center">Note</th>
                <th className="pb-2 pr-4 font-medium text-right">Ventes</th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Revenu brut
                </th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Commission
                </th>
                <th className="pb-2 font-medium text-right">Enseignant</th>
              </tr>
            </thead>
            <tbody>
              {revenueByCourse.map((course, i) => {
                const commission = Math.round(course.brut * COMMISSION_RATE);
                const payout = course.brut - commission;
                return (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      <span className="line-clamp-1">{course.name}</span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {course.instructor}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {course.avgRating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {course.avgRating.toFixed(1)}
                          <span className="text-muted-foreground">({course.ratingCount})</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">{course.ventes}</td>
                    <td className="py-3 pr-4 text-right">
                      {course.brut > 0 ? fmt(course.brut) : "\u2014"}
                    </td>
                    <td className="py-3 pr-4 text-right text-green-600">
                      {commission > 0 ? fmt(commission) : "\u2014"}
                    </td>
                    <td className="py-3 text-right font-semibold text-orange-600">
                      {payout > 0 ? fmt(payout) : "\u2014"}
                    </td>
                  </tr>
                );
              })}
              {revenueByCourse.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Aucun cours
                  </td>
                </tr>
              )}
            </tbody>
            {totalBrut > 0 && (
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="pt-3 pr-4">Total</td>
                  <td className="pt-3 pr-4" />
                  <td className="pt-3 pr-4" />
                  <td className="pt-3 pr-4 text-right">{totalSales}</td>
                  <td className="pt-3 pr-4 text-right">{fmt(totalBrut)}</td>
                  <td className="pt-3 pr-4 text-right text-green-600">
                    {fmt(totalCommission)}
                  </td>
                  <td className="pt-3 text-right text-orange-600">
                    {fmt(totalInstructorPayout)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
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
  value: number;
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
          <span className="block text-2xl font-bold text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  highlight,
  badge,
  badgePositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
  badge?: string;
  badgePositive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm dark:bg-card ${
        highlight
          ? "border-green-200 bg-green-50/50"
          : "border-primary/10 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="block text-xl font-bold text-foreground truncate">
              {value}
            </span>
            {badge && (
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  badgePositive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

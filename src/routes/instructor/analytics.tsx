import { createFileRoute } from "@tanstack/react-router";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Wallet, Receipt, ArrowUpRight } from "lucide-react";

const COLORS = [
  "oklch(0.645 0.246 16.439)",
  "oklch(0.6 0.2 250)",
  "oklch(0.65 0.2 150)",
  "oklch(0.6 0.2 50)",
  "oklch(0.55 0.2 300)",
  "oklch(0.7 0.15 100)",
];

const COMMISSION_RATE = 0.2; // 20% platform commission

function InstructorAnalytics() {
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
    limit: 1000,
  });
  const enrollments = (enrollmentsData?.data ?? []) as any[];

  // --- Revenue by month (last 12 months) ---
  const revenueByMonth = useMemo(() => {
    const months: {
      label: string;
      brut: number;
      commission: number;
      net: number;
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
        net: brut - commission,
        ventes: filtered.length,
      });
    }
    return months;
  }, [enrollments]);

  // --- Revenue by course ---
  const revenueByCourse = useMemo(() => {
    const map = new Map<
      string,
      { name: string; brut: number; ventes: number; price: number }
    >();
    for (const course of courses) {
      map.set(course.id, {
        name: course.title,
        brut: 0,
        ventes: 0,
        price: course.price_cents ?? 0,
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

  // --- Revenue split (pie) ---
  const revenuePie = useMemo(() => {
    const data = revenueByCourse
      .filter((c) => c.brut > 0)
      .map((c) => ({
        name: c.name,
        value: c.brut,
      }));
    return data;
  }, [revenueByCourse]);

  // --- Totals ---
  const totalBrut = enrollments.reduce(
    (sum: number, e: any) => sum + (e.amount_paid_cents ?? 0),
    0,
  );
  const totalCommission = Math.round(totalBrut * COMMISSION_RATE);
  const totalNet = totalBrut - totalCommission;
  const totalSales = enrollments.length;

  // Current month revenue
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

  const fmt = (cents: number) =>
    `${new Intl.NumberFormat("fr-FR").format(Math.round(cents / 100))}\u20AE`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Analytics financiers
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivez vos revenus et la performance financière de vos cours.
        </p>
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FinanceCard
          icon={<Wallet className="h-5 w-5" />}
          label="Revenus bruts"
          value={fmt(totalBrut)}
          color="bg-blue-50 text-blue-500"
        />
        <FinanceCard
          icon={<Receipt className="h-5 w-5" />}
          label={`Commission (${COMMISSION_RATE * 100}%)`}
          value={fmt(totalCommission)}
          color="bg-orange-50 text-orange-500"
        />
        <FinanceCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Revenus nets"
          value={fmt(totalNet)}
          color="bg-green-50 text-green-600"
          highlight
        />
        <FinanceCard
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="Ce mois"
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

      {/* Revenue evolution (12 months) */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Évolution des revenus (12 mois)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="brutGrad" x1="0" y1="0" x2="0" y2="1">
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
                    : name === "net"
                      ? "Net"
                      : "Commission",
                ]}
              />
              <Area
                type="monotone"
                dataKey="brut"
                stroke="oklch(0.6 0.2 250)"
                strokeWidth={1.5}
                fill="url(#brutGrad)"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#netGrad)"
              />
              <Legend
                formatter={(value) =>
                  value === "brut" ? "Brut" : value === "net" ? "Net" : value
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales volume + Revenue by course pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales volume bar chart */}
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

        {/* Revenue by course pie */}
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Répartition des revenus
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
              <div className="flex flex-col gap-2">
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
                    <span className="ml-auto font-medium">
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

      {/* Detailed revenue table */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Détail par cours
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Cours</th>
                <th className="pb-2 pr-4 font-medium text-right">Prix</th>
                <th className="pb-2 pr-4 font-medium text-right">Ventes</th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Revenu brut
                </th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Commission
                </th>
                <th className="pb-2 font-medium text-right">Revenu net</th>
              </tr>
            </thead>
            <tbody>
              {revenueByCourse.map((course) => {
                const commission = Math.round(course.brut * COMMISSION_RATE);
                const net = course.brut - commission;
                return (
                  <tr
                    key={course.name}
                    className="border-b last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">
                      <span className="line-clamp-1">{course.name}</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {course.price > 0 ? fmt(course.price) : "Gratuit"}
                    </td>
                    <td className="py-3 pr-4 text-right">{course.ventes}</td>
                    <td className="py-3 pr-4 text-right">
                      {course.brut > 0 ? fmt(course.brut) : "\u2014"}
                    </td>
                    <td className="py-3 pr-4 text-right text-orange-600">
                      {commission > 0 ? `-${fmt(commission)}` : "\u2014"}
                    </td>
                    <td className="py-3 text-right font-semibold text-green-600">
                      {net > 0 ? fmt(net) : "\u2014"}
                    </td>
                  </tr>
                );
              })}
              {revenueByCourse.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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
                  <td className="pt-3 pr-4 text-right">{totalSales}</td>
                  <td className="pt-3 pr-4 text-right">{fmt(totalBrut)}</td>
                  <td className="pt-3 pr-4 text-right text-orange-600">
                    -{fmt(totalCommission)}
                  </td>
                  <td className="pt-3 text-right text-green-600">
                    {fmt(totalNet)}
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

function FinanceCard({
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

export const Route = createFileRoute("/instructor/analytics")({
  component: InstructorAnalytics,
});

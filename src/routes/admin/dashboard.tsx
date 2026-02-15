import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Users, BookOpen, GraduationCap, Star } from "lucide-react";

function AdminDashboard() {
  const { data: usersData } = useDatabaseQuery({
    from: "profiles",
    limit: 0,
  });
  const { data: coursesData } = useDatabaseQuery({
    from: "courses",
    limit: 0,
  });
  const { data: enrollmentsData } = useDatabaseQuery({
    from: "enrollments",
    limit: 0,
  });
  const { data: reviewsData } = useDatabaseQuery({
    from: "reviews",
    limit: 0,
  });

  const stats = [
    {
      icon: Users,
      label: "Utilisateurs",
      value: usersData?.meta.total ?? 0,
    },
    {
      icon: BookOpen,
      label: "Cours",
      value: coursesData?.meta.total ?? 0,
    },
    {
      icon: GraduationCap,
      label: "Inscriptions",
      value: enrollmentsData?.meta.total ?? 0,
    },
    {
      icon: Star,
      label: "Avis",
      value: reviewsData?.meta.total ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Administration</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4">
            <stat.icon className="h-5 w-5 text-primary" />
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

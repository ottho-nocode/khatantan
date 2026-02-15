import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";

function AdminGuard() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (role !== "admin") {
        navigate({ to: "/" });
      }
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user || role !== "admin") return null;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export const Route = createFileRoute("/admin")({
  component: AdminGuard,
});

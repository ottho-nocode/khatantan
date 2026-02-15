import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";

function AppLayoutGuard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export const Route = createFileRoute("/_app")({
  component: AppLayoutGuard,
});

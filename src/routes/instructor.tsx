import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useEffect } from "react";
import { InstructorLayout } from "@/components/layout/instructor-layout";

function InstructorGuard() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (role !== "instructor" && role !== "admin") {
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

  if (!user || (role !== "instructor" && role !== "admin")) return null;

  return (
    <InstructorLayout>
      <Outlet />
    </InstructorLayout>
  );
}

export const Route = createFileRoute("/instructor")({
  component: InstructorGuard,
});

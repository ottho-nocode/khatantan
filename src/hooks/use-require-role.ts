import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";

export function useRequireAuth(redirectTo = "/login") {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: redirectTo });
    }
  }, [user, isLoading, navigate, redirectTo]);

  return { isLoading, isAuthenticated: !!user };
}

export function useRequireRole(
  role: "admin" | "instructor" | "student",
  redirectTo = "/"
) {
  const { user, role: userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (userRole !== role && userRole !== "admin") {
        // Admins can access any role's pages
        navigate({ to: redirectTo });
      }
    }
  }, [user, userRole, isLoading, role, navigate, redirectTo]);

  return { isLoading, hasAccess: userRole === role || userRole === "admin" };
}

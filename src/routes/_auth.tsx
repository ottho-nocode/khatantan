import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-primary/5 px-4 py-12">
      <Outlet />
    </div>
  ),
});

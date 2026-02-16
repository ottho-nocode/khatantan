import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/theme-provider";
import { AuthProvider } from "@/contexts/Auth";
import { LanguageProvider } from "@/contexts/Language";
import QueriesContext from "@/contexts/queries";

function RootComponent() {
  return (
    <QueriesContext>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            <Outlet />
            <Toaster richColors />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueriesContext>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#dc2626" }}>Something went wrong</h1>
      <pre
        style={{
          background: "#fef2f2",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {error?.message || String(error)}
      </pre>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorBoundary,
});

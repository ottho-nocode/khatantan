import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import {
  Home,
  Users,
  BookOpen,
  FolderTree,
  Medal,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TopNavbar } from "./top-navbar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: "/admin/dashboard", label: t("sidebar.dashboard"), icon: Home },
    { to: "/admin/users", label: t("sidebar.users"), icon: Users },
    { to: "/admin/courses", label: t("sidebar.courses"), icon: BookOpen },
    { to: "/admin/categories", label: t("sidebar.categories"), icon: FolderTree },
    { to: "/admin/badges", label: t("sidebar.badges"), icon: Medal },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-primary/10 bg-white md:flex dark:bg-card">
          <div className="flex h-14 items-center gap-2 border-b border-primary/10 px-4">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold">{t("sidebar.admin")}</span>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    location.pathname === item.to
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-primary/10 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 truncate text-sm font-medium">
                {profile?.display_name}
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              {t("sidebar.logout")}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-primary/5 dark:bg-background">
          <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

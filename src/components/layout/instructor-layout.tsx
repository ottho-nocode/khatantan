import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import {
  BookOpen,
  BarChart3,
  Home,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TopNavbar } from "./top-navbar";

export function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: "/instructor/dashboard", label: t("sidebar.dashboard"), icon: Home },
    { to: "/instructor/courses", label: t("sidebar.myCourses"), icon: BookOpen },
    { to: "/instructor/analytics", label: t("sidebar.analytics"), icon: BarChart3 },
    { to: "/instructor/profile", label: t("sidebar.profile"), icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-primary/10 bg-white md:flex dark:bg-card">
          <div className="p-4">
            <h2 className="mb-4 px-2 font-serif text-lg font-bold text-foreground">
              {t("sidebar.instructorArea")}
            </h2>
            <Link to="/instructor/courses/new">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                {t("sidebar.newCourse")}
              </Button>
            </Link>
          </div>
          <nav className="flex flex-col gap-1 px-4">
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

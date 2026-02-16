import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import {
  BookOpen,
  Heart,
  Home,
  LogOut,
  Settings,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TopNavbar } from "./top-navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarItems = [
    { to: "/dashboard", label: t("sidebar.dashboard"), icon: Home },
    { to: "/my-learning", label: t("sidebar.myCourses"), icon: BookOpen },
    { to: "/favorites", label: t("sidebar.favorites"), icon: Heart },
    { to: "/settings", label: t("sidebar.settings"), icon: Settings },
  ];

  const isSidebarActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-primary/10 bg-white md:block dark:bg-card">
          <div className="p-5">
            <h2 className="font-serif text-base font-bold text-foreground">
              {t("sidebar.studentArea")}
            </h2>
          </div>
          <nav className="flex flex-col gap-0.5 px-3">
            {sidebarItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isSidebarActive(item.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isSidebarActive(item.to)
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              {t("sidebar.logout")}
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="border-b border-primary/10 bg-white p-3 md:hidden dark:bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            className="gap-2"
          >
            <Menu className="h-4 w-4" />
            {t("sidebar.menu")}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl dark:bg-card">
              <div className="flex items-center justify-between border-b p-4">
                <span className="font-serif font-bold">
                  {t("sidebar.studentArea")}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex flex-col gap-0.5 p-3">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isSidebarActive(item.to)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "#FFF4F7" }}
        >
          <div className="mx-auto max-w-5xl p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-white dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  K
                </div>
                <span className="font-serif text-xl font-bold text-foreground">
                  Khatantan
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                {t("footer.description")}
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("footer.platform")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/courses"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {t("footer.allCourses")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {t("footer.about")}
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">
                    {t("footer.pricing")}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("footer.support")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-sm text-muted-foreground">
                    {t("footer.contact")}
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">
                    {t("footer.terms")}
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">
                    {t("footer.faq")}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("footer.followUs")}
              </h3>
              <div className="flex gap-4">
                <Facebook className="h-5 w-5 text-muted-foreground" />
                <Instagram className="h-5 w-5 text-muted-foreground" />
                <Twitter className="h-5 w-5 text-muted-foreground" />
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-primary/10 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Khatantan.{" "}
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import {
  BookOpen,
  BarChart3,
  Home,
  LogOut,
  Plus,
  User,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/instructor/dashboard", label: "Tableau de bord", icon: Home },
  { to: "/instructor/courses", label: "Mes cours", icon: BookOpen },
  { to: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/instructor/profile", label: "Profil", icon: User },
];

export function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-primary/10 bg-white md:block dark:bg-card">
        <div className="flex h-14 items-center justify-between border-b border-primary/10 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
        </div>
        <div className="p-4">
          <h2 className="mb-4 px-2 font-serif text-lg font-bold text-foreground">
            Espace Enseignant
          </h2>
          <Link to="/instructor/courses/new">
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Nouveau cours
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
            D&eacute;connexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-primary/5 dark:bg-background">
        <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

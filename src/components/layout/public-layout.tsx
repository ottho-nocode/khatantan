import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User,
  Globe,
  LogOut,
  Facebook,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "Cours", path: "/courses" },
  { name: "Classement", path: "/leaderboard" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md dark:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                K
              </div>
              <span className="font-serif text-xl font-bold text-foreground">
                Khatantan
              </span>
            </Link>
            <div className="ml-8 hidden space-x-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>MN</span>
            </Button>

            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {(profile?.role === "instructor" ||
                  profile?.role === "admin") && (
                  <Link to="/instructor/dashboard">
                    <Button variant="outline" size="sm">
                      Espace Enseignant
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span>{profile?.display_name ?? "Mon compte"}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="border-b border-primary/10 bg-white md:hidden dark:bg-background">
            <div className="space-y-1 pb-3 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                    isActive(link.path)
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-transparent text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 border-t px-4 pt-4">
                {!user ? (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button size="sm">S'inscrire</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm">
                        Mon espace
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="mt-auto border-t border-primary/10 bg-white dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1">
              <Link to="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  K
                </div>
                <span className="font-serif text-xl font-bold text-foreground">
                  Khatantan
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                La plateforme d'apprentissage dédiée au développement personnel
                et spirituel en Mongolie.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Plateforme
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/courses"
                    className="text-base text-muted-foreground hover:text-primary"
                  >
                    Tous les cours
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-base text-muted-foreground hover:text-primary"
                  >
                    Classement
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Support
              </h3>
              <ul className="space-y-4">
                <li>
                  <span className="text-base text-muted-foreground">
                    Contact
                  </span>
                </li>
                <li>
                  <span className="text-base text-muted-foreground">CGV</span>
                </li>
                <li>
                  <span className="text-base text-muted-foreground">FAQ</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Suivez-nous
              </h3>
              <div className="flex space-x-6">
                <span className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Facebook</span>
                  <Facebook className="h-6 w-6" />
                </span>
                <span className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-6 w-6" />
                </span>
                <span className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-6 w-6" />
                </span>
                <span className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Email</span>
                  <Mail className="h-6 w-6" />
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-primary/10 pt-8">
            <p className="text-center text-base text-muted-foreground">
              &copy; {new Date().getFullYear()} Khatantan. Tous droits
              r&eacute;serv&eacute;s.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

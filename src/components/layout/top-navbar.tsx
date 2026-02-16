import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import { localeLabels, localeFlags, type Locale } from "@/i18n/translations";
import {
  Globe,
  User,
  GraduationCap,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const locales: Locale[] = ["fr", "en", "mn"];

export function TopNavbar() {
  const { user, profile, role, signOut } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.courses"), path: "/courses" },
    { name: t("nav.about"), path: "/about" },
  ];

  const isNavActive = (path: string) => location.pathname === path;

  const isInAdmin = location.pathname.startsWith("/admin");
  const isInInstructor = location.pathname.startsWith("/instructor");
  const isInStudent =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/my-learning") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/settings");

  const showAdmin = role === "admin" && !isInAdmin;
  const showInstructor = role === "instructor" && !isInInstructor;
  const showStudent = role === "student" && !isInStudent;

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md dark:bg-background/80">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              K
            </div>
            <span className="font-serif text-xl font-bold text-foreground">
              Khatantan
            </span>
          </Link>
          <div className="ml-8 hidden space-x-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isNavActive(link.path)
                    ? "text-foreground underline decoration-primary underline-offset-[20px] decoration-2"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => setLangOpen(!langOpen)}
            >
              <Globe className="h-4 w-4" />
              {locale.toUpperCase()}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-[160px] overflow-hidden rounded-lg border border-primary/10 bg-white shadow-lg dark:bg-card">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLocale(l);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent",
                      l === locale
                        ? "bg-primary/5 font-medium text-primary"
                        : "text-foreground",
                    )}
                  >
                    <span>{localeFlags[l]}</span>
                    {localeLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t("nav.register")}</Button>
              </Link>
            </>
          ) : (
            <>
              {showAdmin && (
                <Link to="/admin/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    {t("nav.admin")}
                  </Button>
                </Link>
              )}
              {showInstructor && (
                <Link to="/instructor/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {t("nav.instructor")}
                  </Button>
                </Link>
              )}
              {showStudent && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {t("nav.student")}
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-primary/10 bg-white px-4 pb-4 md:hidden dark:bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Language Selector */}
          <div className="flex gap-1 border-t border-primary/10 pt-3 mt-2">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  l === locale
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {localeFlags[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>

          {user && (
            <div className="mt-2 flex flex-wrap gap-2 border-t pt-3">
              {showAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    {t("nav.admin")}
                  </Button>
                </Link>
              )}
              {showInstructor && (
                <Link
                  to="/instructor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {t("nav.instructorShort")}
                  </Button>
                </Link>
              )}
              {showStudent && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {t("nav.studentShort")}
                  </Button>
                </Link>
              )}
            </div>
          )}
          {!user && (
            <div className="mt-2 flex gap-2 border-t pt-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm">{t("nav.register")}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

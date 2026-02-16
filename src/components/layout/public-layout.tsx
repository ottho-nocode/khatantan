import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { TopNavbar } from "./top-navbar";
import { useTranslation } from "@/contexts/Language";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />

      <main className="flex-1">{children}</main>

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
                {t("footer.description")}
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("footer.platform")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/courses"
                    className="text-base text-muted-foreground hover:text-primary"
                  >
                    {t("footer.allCourses")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-base text-muted-foreground hover:text-primary"
                  >
                    {t("footer.about")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("footer.support")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <span className="text-base text-muted-foreground">
                    {t("footer.contact")}
                  </span>
                </li>
                <li>
                  <span className="text-base text-muted-foreground">
                    {t("footer.terms")}
                  </span>
                </li>
                <li>
                  <span className="text-base text-muted-foreground">
                    {t("footer.faq")}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("footer.followUs")}
              </h3>
              <div className="flex space-x-6">
                <Facebook className="h-6 w-6 text-muted-foreground" />
                <Instagram className="h-6 w-6 text-muted-foreground" />
                <Twitter className="h-6 w-6 text-muted-foreground" />
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-primary/10 pt-8">
            <p className="text-center text-base text-muted-foreground">
              &copy; {new Date().getFullYear()} Khatantan.{" "}
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      // Fetch profile to determine role-based redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role === "admin") {
          navigate({ to: "/admin/dashboard" });
        } else if (profile?.role === "instructor") {
          navigate({ to: "/instructor/dashboard" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } else {
        navigate({ to: "/" });
      }
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl dark:bg-card">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          K
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground">
          {t("auth.login")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-foreground"
            >
              {t("auth.rememberMe")}
            </label>
          </div>
          <div className="text-sm">
            <span className="cursor-pointer font-medium text-primary hover:text-primary/80">
              {t("auth.forgotPassword")}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary/80"
          >
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

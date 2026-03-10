import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/Auth";
import { useTranslation } from "@/contexts/Language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterPage() {
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signUp(email, password, displayName);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl dark:bg-card">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          K
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground">
          {t("auth.createAccount")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.registerSubtitle")}
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">{t("auth.fullName")}</Label>
          <Input
            id="displayName"
            type="text"
            placeholder={t("auth.namePlaceholder")}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg"
            required
          />
        </div>
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
            minLength={6}
          />
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-foreground">
            {t("auth.acceptTermsPre")}{" "}
            <span className="cursor-pointer text-primary hover:underline">
              {t("footer.terms")}
            </span>{" "}
            {t("auth.acceptTermsPost")}
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("auth.registering") : t("auth.registerButton")}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            {t("auth.loginLink")}
          </Link>
        </p>
      </div>

    </div>
  );
}

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});

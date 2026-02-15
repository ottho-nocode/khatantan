import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { useFileUpload } from "@/utilities/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  User,
  Camera,
  Lock,
  Bell,
  CreditCard,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profil" | "securite" | "notifications" | "paiement";

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profil", label: "Profil", icon: User },
  { id: "securite", label: "Sécurité", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "paiement", label: "Paiement", icon: CreditCard },
];

function SettingsPage() {
  const { user, profile } = useAuth();
  const { updateRow } = useDatabaseMutation({ table: "profiles" });
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile) {
      const parts = (profile.display_name ?? "").split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  const {
    onDrop,
    onClick,
    onChange: onFileChange,
    fileInputRef,
    isLoading: uploading,
  } = useFileUpload({
    bucket: "profile-avatars",
    folder: user?.id ?? "",
    onSuccess: (file) => {
      setAvatarUrl(file.url);
    },
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const displayName = [firstName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(" ");
      await updateRow({
        id: user.id,
        data: {
          display_name: displayName || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
        },
      });
      toast.success("Modifications enregistrées !");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Paramètres du compte
          </h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et préférences.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="hidden sm:flex"
        >
          {isSubmitting
            ? "Enregistrement..."
            : "Enregistrer les modifications"}
        </Button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Vertical Tabs */}
        <nav className="flex flex-row gap-1 md:w-48 md:shrink-0 md:flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-left",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profil" && (
            <div className="flex flex-col gap-8">
              {/* Mon Profil */}
              <div className="rounded-2xl border border-primary/10 bg-white p-6 dark:bg-card">
                <h2 className="mb-6 font-serif text-lg font-bold text-foreground">
                  Mon Profil
                </h2>

                {/* Avatar */}
                <div className="mb-8 flex items-center gap-5">
                  <div
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={onClick}
                    className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-muted"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                      <Camera className="h-3 w-3" />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                  </div>
                  <div>
                    <p className="font-serif text-lg font-bold text-foreground">
                      {profile?.display_name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {memberSince
                        ? `Membre depuis ${memberSince}`
                        : ""}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={onClick}
                        className="text-xs font-medium text-foreground underline underline-offset-2"
                      >
                        {uploading ? "Upload..." : "Changer la photo"}
                      </button>
                      {avatarUrl && (
                        <button
                          onClick={() => setAvatarUrl("")}
                          className="text-xs font-medium text-primary"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prénom / Nom */}
                <div className="mb-5 grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">Prénom</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Nom</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nom"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-5 grid gap-2">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    Contactez le support pour changer votre email.
                  </p>
                </div>

                {/* Bio */}
                <div className="grid gap-2">
                  <Label htmlFor="bio">
                    Bio (visible sur votre profil public)
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parlez-nous de vous..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Moyens de paiement */}
              <div className="rounded-2xl border border-primary/10 bg-white p-6 dark:bg-card">
                <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
                  Moyens de paiement
                </h2>
                <div className="flex flex-col gap-3">
                  {/* Placeholder card */}
                  <div className="flex items-center justify-between rounded-xl border border-primary/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        VISA
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Visa terminant par 4242
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expire le 12/28
                        </p>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Add card */}
                  <button className="flex items-center justify-center rounded-xl border-2 border-dashed border-primary/20 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                    + Ajouter une carte
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "securite" && (
            <div className="rounded-2xl border border-primary/10 bg-white p-6 dark:bg-card">
              <h2 className="mb-6 font-serif text-lg font-bold text-foreground">
                Sécurité
              </h2>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button className="w-fit">Mettre à jour</Button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-primary/10 bg-white p-6 dark:bg-card">
              <h2 className="mb-6 font-serif text-lg font-bold text-foreground">
                Notifications
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Nouveaux cours",
                    desc: "Recevez une notification quand un nouveau cours est publié",
                  },
                  {
                    label: "Rappels d'apprentissage",
                    desc: "Rappels quotidiens pour continuer vos cours",
                  },
                  {
                    label: "Promotions",
                    desc: "Offres spéciales et réductions",
                  },
                  {
                    label: "Emails marketing",
                    desc: "Newsletter et actualités de la plateforme",
                  },
                ].map((notif) => (
                  <label
                    key={notif.label}
                    className="flex items-start justify-between gap-4 rounded-lg border border-primary/10 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {notif.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notif.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "paiement" && (
            <div className="rounded-2xl border border-primary/10 bg-white p-6 dark:bg-card">
              <h2 className="mb-6 font-serif text-lg font-bold text-foreground">
                Historique des paiements
              </h2>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium text-foreground">
                  Aucun paiement
                </p>
                <p className="text-xs text-muted-foreground">
                  Votre historique de paiements apparaîtra ici.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile save button */}
      <Button
        onClick={handleSave}
        disabled={isSubmitting}
        className="sm:hidden"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

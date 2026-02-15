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
import { Camera, User } from "lucide-react";

function ProfilePage() {
  const { user, profile } = useAuth();
  const { updateRow } = useDatabaseMutation({ table: "profiles" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
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
      await updateRow({
        id: user.id,
        data: {
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
        },
      });
      toast.success("Profil mis à jour !");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles.
        </p>
      </div>

      <div className="flex max-w-lg flex-col gap-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={onClick}
            className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors hover:border-primary/50"
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
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
            <p className="text-sm font-medium">{profile?.display_name}</p>
            <p className="text-xs text-muted-foreground">
              {uploading ? "Upload en cours..." : "Cliquez pour changer"}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
          <p className="text-xs text-muted-foreground">
            L'email ne peut pas être modifié.
          </p>
        </div>

        {/* Display name */}
        <div className="grid gap-2">
          <Label htmlFor="display-name">Nom d'affichage</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Parlez un peu de vous..."
            rows={3}
          />
        </div>

        {/* Stats */}
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium">Statistiques</p>
          <div className="mt-2 flex gap-6 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{profile?.xp ?? 0}</strong> XP
            </span>
            <span>
              Rôle :{" "}
              <strong className="capitalize text-foreground">
                {profile?.role}
              </strong>
            </span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-fit"
        >
          {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

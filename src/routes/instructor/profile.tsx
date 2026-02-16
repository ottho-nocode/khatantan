import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useInstructorProfile } from "@/hooks/use-instructor-profile";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { useFileUpload } from "@/utilities/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Camera, User, Globe, ExternalLink } from "lucide-react";

function InstructorProfilePage() {
  const { user, profile } = useAuth();
  const { instructor, refetch } = useInstructorProfile();
  const { updateRow: updateProfile } = useDatabaseMutation({
    table: "profiles",
  });
  const { updateRow: updateInstructor } = useDatabaseMutation({
    table: "instructor_profiles",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (instructor) {
      setHeadline(instructor.headline ?? "");
      setWebsiteUrl(instructor.website_url ?? "");
      const links = instructor.social_links ?? {};
      setSocialLinks({
        facebook: links.facebook ?? "",
        instagram: links.instagram ?? "",
        youtube: links.youtube ?? "",
      });
    }
  }, [instructor]);

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
    if (!user || !instructor) return;
    setIsSubmitting(true);
    try {
      await updateProfile({
        id: user.id,
        data: {
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
        },
      });

      const cleanLinks: Record<string, string> = {};
      if (socialLinks.facebook.trim())
        cleanLinks.facebook = socialLinks.facebook.trim();
      if (socialLinks.instagram.trim())
        cleanLinks.instagram = socialLinks.instagram.trim();
      if (socialLinks.youtube.trim())
        cleanLinks.youtube = socialLinks.youtube.trim();

      await updateInstructor({
        id: instructor.id,
        data: {
          headline: headline.trim() || null,
          website_url: websiteUrl.trim() || null,
          social_links: cleanLinks,
        },
      });

      refetch();
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
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Mon profil enseignant
        </h1>
        <p className="text-sm text-muted-foreground">
          Ces informations sont visibles par les étudiants sur vos cours.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column - Avatar & preview */}
        <div className="flex flex-col items-center gap-4 self-start rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={onClick}
            className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors hover:border-primary/50"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {uploading ? "Upload en cours..." : "Cliquez pour changer"}
          </p>
          <div className="text-center">
            <p className="font-semibold">{displayName || "Votre nom"}</p>
            <p className="text-xs text-muted-foreground">
              {headline || "Votre titre"}
            </p>
          </div>
          {instructor?.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-medium text-green-700">
              Vérifié
            </span>
          )}
        </div>

        {/* Right column - Form */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Basic info */}
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
            <h3 className="mb-4 text-sm font-semibold">
              Informations générales
            </h3>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display-name">Nom d'affichage</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Votre nom complet"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="headline">Titre / Spécialité</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex: Expert en méditation et pleine conscience"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Parlez de votre parcours, vos qualifications et votre approche..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-card">
            <h3 className="mb-4 text-sm font-semibold">Liens & réseaux</h3>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="website">
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Site web
                  </span>
                </Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://monsite.com"
                  type="url"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={socialLinks.facebook}
                  onChange={(e) =>
                    setSocialLinks((s) => ({
                      ...s,
                      facebook: e.target.value,
                    }))
                  }
                  placeholder="https://facebook.com/votrepage"
                  type="url"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={socialLinks.instagram}
                  onChange={(e) =>
                    setSocialLinks((s) => ({
                      ...s,
                      instagram: e.target.value,
                    }))
                  }
                  placeholder="https://instagram.com/votrenom"
                  type="url"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={socialLinks.youtube}
                  onChange={(e) =>
                    setSocialLinks((s) => ({
                      ...s,
                      youtube: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/@votrechaine"
                  type="url"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-fit"
          >
            {isSubmitting ? "Sauvegarde..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/instructor/profile")({
  component: InstructorProfilePage,
});

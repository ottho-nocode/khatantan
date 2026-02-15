import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

const categoryLabels: Record<string, string> = {
  learning: "Apprentissage",
  social: "Social",
  achievement: "Accomplissement",
  special: "Spécial",
};

const categoryVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  learning: "default",
  social: "secondary",
  achievement: "outline",
  special: "destructive",
};

interface BadgeForm {
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  category: string;
  xp_reward: number;
  rule_type: string;
  rule_threshold: number;
}

const emptyForm: BadgeForm = {
  name: "",
  slug: "",
  description: "",
  icon_url: "",
  category: "learning",
  xp_reward: 0,
  rule_type: "",
  rule_threshold: 0,
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminBadgesPage() {
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({
    open: false,
  });
  const [form, setForm] = useState<BadgeForm>(emptyForm);

  const { data, isLoading, refetch } = useDatabaseQuery({
    from: "badges",
    orderBy: [{ field: "category", direction: "asc" }],
  });

  const badges = data?.data ?? [];
  const { createRow, updateRow, deleteRow } = useDatabaseMutation({
    table: "badges",
  });

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ open: true });
  };

  const openEdit = (badge: any) => {
    setForm({
      name: badge.name,
      slug: badge.slug,
      description: badge.description ?? "",
      icon_url: badge.icon_url ?? "",
      category: badge.category ?? "learning",
      xp_reward: badge.xp_reward ?? 0,
      rule_type: badge.rule_type ?? "",
      rule_threshold: badge.rule_threshold ?? 0,
    });
    setDialog({ open: true, editing: badge });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      const slug = form.slug || generateSlug(form.name);
      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description || null,
        icon_url: form.icon_url || null,
        category: form.category,
        xp_reward: form.xp_reward,
        rule_type: form.rule_type || null,
        rule_threshold: form.rule_threshold,
      };
      if (dialog.editing) {
        await updateRow({ id: dialog.editing.id, data: payload });
        toast.success("Badge mis à jour");
      } else {
        await createRow({ data: payload });
        toast.success("Badge créé");
      }
      refetch();
      setDialog({ open: false });
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce badge ?")) return;
    try {
      await deleteRow({ id });
      refetch();
      toast.success("Badge supprimé");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  const setField = <K extends keyof BadgeForm>(key: K, value: BadgeForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Badges</h1>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouveau badge
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Badge</th>
                <th className="px-4 py-2 text-left font-medium">Catégorie</th>
                <th className="px-4 py-2 text-left font-medium">XP</th>
                <th className="px-4 py-2 text-left font-medium">Règle</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {badges.map((badge: any) => (
                <tr key={badge.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {badge.icon_url ? (
                        <img
                          src={badge.icon_url}
                          alt=""
                          className="h-6 w-6 rounded"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs">
                          🏆
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {badge.description ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={categoryVariants[badge.category] ?? "secondary"}
                    >
                      {categoryLabels[badge.category] ?? badge.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    +{badge.xp_reward ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {badge.rule_type
                      ? `${badge.rule_type} ≥ ${badge.rule_threshold}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(badge)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(badge.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog.editing ? "Modifier le badge" : "Nouveau badge"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setField("name", e.target.value);
                  if (!dialog.editing)
                    setField("slug", generateSlug(e.target.value));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>URL icône</Label>
              <Input
                value={form.icon_url}
                placeholder="https://..."
                onChange={(e) => setField("icon_url", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Catégorie</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setField("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">Apprentissage</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="achievement">Accomplissement</SelectItem>
                    <SelectItem value="special">Spécial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Récompense XP</Label>
                <Input
                  type="number"
                  value={form.xp_reward}
                  onChange={(e) =>
                    setField("xp_reward", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type de règle</Label>
                <Input
                  value={form.rule_type}
                  placeholder="ex: lessons_completed"
                  onChange={(e) => setField("rule_type", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Seuil</Label>
                <Input
                  type="number"
                  value={form.rule_threshold}
                  onChange={(e) =>
                    setField("rule_threshold", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog({ open: false })}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {dialog.editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/admin/badges")({
  component: AdminBadgesPage,
});

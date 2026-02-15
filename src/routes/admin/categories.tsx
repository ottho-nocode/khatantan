import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

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

function AdminCategoriesPage() {
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({
    open: false,
  });
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, refetch } = useDatabaseQuery({
    from: "categories",
    orderBy: [{ field: "position", direction: "asc" }],
  });

  const categories = data?.data ?? [];
  const { createRow, updateRow, deleteRow } = useDatabaseMutation({
    table: "categories",
  });

  const openCreate = () => {
    setName("");
    setSlug("");
    setDescription("");
    setDialog({ open: true });
  };

  const openEdit = (cat: any) => {
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setDialog({ open: true, editing: cat });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      const s = slug || generateSlug(name);
      if (dialog.editing) {
        await updateRow({
          id: dialog.editing.id,
          data: { name: name.trim(), slug: s, description: description || null },
        });
        toast.success("Catégorie mise à jour");
      } else {
        await createRow({
          data: {
            name: name.trim(),
            slug: s,
            description: description || null,
            position: categories.length,
          },
        });
        toast.success("Catégorie créée");
      }
      refetch();
      setDialog({ open: false });
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await deleteRow({ id });
      refetch();
      toast.success("Catégorie supprimée");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
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
                <th className="px-4 py-2 text-left font-medium">Pos.</th>
                <th className="px-4 py-2 text-left font-medium">Nom</th>
                <th className="px-4 py-2 text-left font-medium">Slug</th>
                <th className="px-4 py-2 text-left font-medium">
                  Description
                </th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any, i: number) => (
                <tr key={cat.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {cat.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(cat)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(cat.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Nom</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!dialog.editing)
                    setSlug(generateSlug(e.target.value));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

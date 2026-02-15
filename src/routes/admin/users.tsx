import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Search, Users, Shield, GraduationCap, User } from "lucide-react";

const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  instructor: GraduationCap,
  student: User,
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  instructor: "Instructeur",
  student: "Étudiant",
};

function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { updateRow } = useDatabaseMutation({ table: "profiles" });

  const { data, isLoading, refetch } = useDatabaseQuery({
    from: "profiles",
    where: search
      ? { field: "display_name", operator: "ilike", value: search }
      : undefined,
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 50,
  });

  const users = data?.data ?? [];

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRow({ id: userId, data: { role: newRole } });
      toast.success("Rôle mis à jour");
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <span className="text-sm text-muted-foreground">
          {data?.meta.total ?? 0} utilisateurs
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Nom</th>
                <th className="px-4 py-2 text-left font-medium">Rôle</th>
                <th className="px-4 py-2 text-left font-medium">XP</th>
                <th className="px-4 py-2 text-left font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const RoleIcon = roleIcons[user.role] ?? User;
                return (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            user.display_name?.charAt(0)?.toUpperCase() ?? "?"
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {user.display_name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v)}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Étudiant</SelectItem>
                          <SelectItem value="instructor">Instructeur</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.xp ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

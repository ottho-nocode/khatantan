import { useQueryClient } from "@tanstack/react-query";
import database from "@/services/database";

interface DatabaseMutationProps {
  table: string;
}

export function useDatabaseMutation({ table }: DatabaseMutationProps) {
  const queryClient = useQueryClient();

  return {
    async createRow({ data }: { data: Record<string, any> }) {
      try {
        const result = await database.createRow({ table, data });
        queryClient.invalidateQueries({ queryKey: ["database", table] });
        return result;
      } catch (err) {
        console.error("createRow error:", err);
        throw err;
      }
    },

    async updateRow({ id, data }: { id: string; data: Record<string, any> }) {
      try {
        const result = await database.updateRow({ table, id, data });
        queryClient.invalidateQueries({ queryKey: ["database", table] });
        return result;
      } catch (err) {
        console.error("updateRow error:", err);
        throw err;
      }
    },

    async deleteRow({ id }: { id: string }) {
      try {
        const result = await database.deleteRow({ table, id });
        queryClient.invalidateQueries({ queryKey: ["database", table] });
        return result;
      } catch (err) {
        console.error("deleteRow error:", err);
        throw err;
      }
    },
  };
}

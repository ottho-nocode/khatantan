import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import database from "@/services/database";
import { useQueryClient } from "@tanstack/react-query";

export function useInstructorProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useDatabaseQuery({
    from: "instructor_profiles",
    where: { field: "profile_id", operator: "eq", value: user?.id ?? "" },
    limit: 1,
  });

  const instructor = data?.data?.[0] as any | undefined;

  const ensureProfile = async () => {
    if (!user?.id) return null;
    if (instructor) return instructor;

    const result = await database.createRow({
      table: "instructor_profiles",
      data: { profile_id: user.id },
    });
    queryClient.invalidateQueries({
      queryKey: ["database", "instructor_profiles"],
    });
    return result;
  };

  return { instructor, isLoading, ensureProfile, refetch };
}

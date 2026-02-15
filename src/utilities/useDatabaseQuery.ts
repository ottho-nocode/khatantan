import database from "../services/database";

import { DataQuery, DataResponse } from "@/types/data";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useDatabaseQuery(queryParams: DataQuery): {
  data: DataResponse | undefined;
  refetch: () => void;
  isLoading: boolean;
  error: Error | null;
} {

  const { from, ...rest } = queryParams || { from: "" }
  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ["database", from, rest],
    queryFn: ({ signal }) => {
      return database.getTable({ from, ...rest }, signal);
    },
    placeholderData: keepPreviousData,
  });

  return { data: data, refetch, isLoading, error };
}

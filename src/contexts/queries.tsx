import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import data from "../services/database";
import React from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {},
  },
});

export async function resolveParam(value, table, field, include) {
  return await queryClient.fetchQuery({
    queryFn: ({ signal }) =>
      data.getRow({ table, value, field, include }, signal),
    queryKey: ["database", table, value],
    staleTime: 5 * 60 * 1000,
  });
}

export default function QueriesContext({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

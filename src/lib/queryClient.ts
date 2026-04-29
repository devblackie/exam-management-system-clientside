// clientside/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,   // 5 min — don't refetch if fresh
      gcTime:               10 * 60 * 1000,  // 10 min — keep in memory
      retry:                2,
      refetchOnWindowFocus: false,            // prevents jarring refetches on tab switch
    },
  },
});
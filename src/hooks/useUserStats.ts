"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import type { UserStats } from "@/types/user";

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: userApi.getStats,
    staleTime: 30_000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
    notifyOnChangeProps: ["data"], // Only re-render when data changes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import type { UserStats } from "@/types/user";

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: userApi.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    notifyOnChangeProps: ["data"], // Only re-render when data changes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
}

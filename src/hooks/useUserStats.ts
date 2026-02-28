"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";

export function useUserStats() {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: userApi.getStats,
    staleTime: 30_000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
}

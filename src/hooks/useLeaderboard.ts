"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/lib/api";

interface UseLeaderboardProps {
  page?: number;
  limit?: number;
  search?: string;
}

export function useLeaderboard({ page = 1, limit = 10, search = "" }: UseLeaderboardProps = {}) {
  return useQuery({
    queryKey: ["leaderboard", page, limit, search],
    queryFn: () => leaderboardApi.getLeaderboard(page, limit, search),
    staleTime: Infinity, // Rely on explicit invalidation for real-time updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    notifyOnChangeProps: ["data"],
  });
}

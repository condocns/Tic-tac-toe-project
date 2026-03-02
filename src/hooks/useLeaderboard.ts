"use client";

import { useQuery } from "@tanstack/react-query";
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

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
    staleTime: 60_000, // 1 minute for leaderboard
    retry: 2,
    retryDelay: 1000,
  });
}

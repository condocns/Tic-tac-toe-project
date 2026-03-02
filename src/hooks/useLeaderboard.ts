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
    staleTime: 5_000, // 5 seconds - more frequent updates
    refetchInterval: 10_000, // Auto refetch every 10 seconds
    retry: 2,
    retryDelay: 1000,
  });
}

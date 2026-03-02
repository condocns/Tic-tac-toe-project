"use client";

import { useQuery } from "@tanstack/react-query";
import { gameApi } from "@/lib/api";

interface UseGameHistoryProps {
  page?: number;
  limit?: number;
}

export function useGameHistory({ page = 1, limit = 10 }: UseGameHistoryProps = {}) {
  return useQuery({
    queryKey: ["gameHistory", page, limit],
    queryFn: () => gameApi.getHistory(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: 2,
    retryDelay: 1000,
  });
}

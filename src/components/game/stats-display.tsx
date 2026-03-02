"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import type { UserStats } from "@/types/user";

export const StatsDisplay = memo(() => {
  // Use React Query for both initial fetch and subscribing to cache updates
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => {
      const response = await userApi.getStats();
      return response as UserStats;
    },
    staleTime: Infinity, // Don't auto-refetch in background
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
      >
        <div id="stat-wins" className="text-2xl font-bold text-purple-900 dark:text-purple-100">
          {isLoading ? "..." : stats?.wins || 0}
        </div>
        <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Wins</div>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
      >
        <div id="stat-losses" className="text-2xl font-bold text-red-600 dark:text-red-400">
          {isLoading ? "..." : stats?.losses || 0}
        </div>
        <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Losses</div>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
      >
        <div id="stat-draws" className="text-2xl font-bold text-purple-600 dark:text-purple-300">
          {isLoading ? "..." : stats?.draws || 0}
        </div>
        <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Draws</div>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
      >
        <div id="stat-score" className="text-2xl font-bold text-purple-800 dark:text-purple-100">
          {isLoading ? "..." : stats?.score || 0}
        </div>
        <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Points</div>
      </motion.div>
    </motion.div>
  );
});

StatsDisplay.displayName = "StatsDisplay";

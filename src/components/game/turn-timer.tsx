"use client";

import { Clock, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTurnTimer } from "@/hooks/useTurnTimer";
import { getRuntimeConfig } from "@/lib/config";
import { useGameStore } from "@/lib/game/store";

export function TurnTimer() {
  const { timeRemaining, isTimerActive, isHumanTurn } = useTurnTimer();
  const { difficulty, board } = useGameStore();
  
  // Get max time based on difficulty from runtime config
  const config = getRuntimeConfig();
  const maxTime = config.TURN_TIMER[difficulty.toUpperCase() as keyof typeof config.TURN_TIMER];
  
  // Check if game is ready to start (empty board and human's turn)
  const isGameReady = board.every((cell: string | null) => cell === null) && isHumanTurn;
  
  if (!isTimerActive && !isHumanTurn) {
    return <div className="h-16 w-full" />; // Placeholder to maintain layout
  }

  if (isGameReady) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-500/20">
            <Clock className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Ready to Start!
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Click any cell to begin the game
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLowTime = timeRemaining <= 5; // Warning at 5 seconds
  const percentage = (timeRemaining / maxTime) * 100; // Dynamic percentage based on difficulty

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full transition-colors",
          isLowTime ? "bg-red-500/20" : "bg-blue-500/20"
        )}>
          <Clock className={cn(
            "h-4 w-4 transition-colors",
            isLowTime ? "text-red-500 animate-pulse" : "text-blue-500"
          )} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-medium transition-colors",
              isLowTime ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
            )}>
              Your Turn
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-lg font-bold transition-colors",
                isLowTime ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
              )}>
                {Math.ceil(timeRemaining)}s
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                /{maxTime}s
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-75 ease-out rounded-full",
                isLowTime ? "bg-red-500" : "bg-blue-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        {isLowTime && (
          <div className="p-1.5 rounded-full bg-red-500/20 animate-pulse">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}

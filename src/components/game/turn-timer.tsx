"use client";

import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTurnTimer } from "@/hooks/useTurnTimer";

export function TurnTimer() {
  const { timeRemaining, isTimerActive, isHumanTurn } = useTurnTimer();

  if (!isTimerActive || !isHumanTurn) {
    return <div className="h-16 w-full" />; // Placeholder to maintain layout
  }

  const isLowTime = timeRemaining <= 5; // Warning at 5 seconds
  const percentage = (timeRemaining / 30) * 100; // Max 30 seconds for percentage calculation

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full transition-colors",
          isLowTime ? "bg-red-500/20" : "bg-primary/10"
        )}>
          <Clock className={cn(
            "h-4 w-4 transition-colors",
            isLowTime ? "text-red-500 animate-pulse" : "text-primary"
          )} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-medium transition-colors",
              isLowTime ? "text-red-500" : "text-muted-foreground"
            )}>
              Your Turn
            </span>
            <span className={cn(
              "text-lg font-bold transition-colors",
              isLowTime ? "text-red-500" : "text-foreground"
            )}>
              {timeRemaining}s
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-100 ease-linear rounded-full",
                isLowTime ? "bg-red-500" : "bg-primary"
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

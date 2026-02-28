"use client";

import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTurnTimer } from "@/hooks/useTurnTimer";

export function TurnTimer() {
  const { timeRemaining, isTimerActive, isHumanTurn } = useTurnTimer();

  if (!isTimerActive || !isHumanTurn) {
    return <div className="h-12 w-full max-w-[380px] mx-auto" />; // Placeholder to maintain layout
  }

  const isLowTime = timeRemaining <= 5; // Warning at 5 seconds
  const percentage = (timeRemaining / 30) * 100; // Max 30 seconds for percentage calculation

  return (
    <div className="flex items-center gap-2 w-full max-w-[380px] mx-auto min-h-[48px]">
      <div className="flex items-center gap-2 flex-1">
        <Clock className={cn(
          "h-4 w-4 transition-colors",
          isLowTime ? "text-red-500 animate-pulse" : "text-muted-foreground"
        )} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              "text-sm font-medium transition-colors",
              isLowTime ? "text-red-500" : "text-muted-foreground"
            )}>
              Your Turn
            </span>
            <span className={cn(
              "text-sm font-bold transition-colors",
              isLowTime ? "text-red-500" : "text-foreground"
            )}>
              {timeRemaining}s
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-100 ease-linear",
                isLowTime ? "bg-red-500" : "bg-primary"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        {isLowTime && (
          <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
        )}
      </div>
    </div>
  );
}

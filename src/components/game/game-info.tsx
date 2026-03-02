"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game/store";
import { Bot, Loader2, Trophy, Frown, Minus, Swords, Target, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameInfo() {
  const { gameResult, botMessage, isAiThinking, currentTurn, humanPlayer, bonusAwarded, difficulty, gridSize } =
    useGameStore();

  const getResultInfo = () => {
    switch (gameResult) {
      case "win":
        return {
          icon: <Trophy className="h-5 w-5 text-yellow-500" />,
          text: bonusAwarded ? "You Win! +2 Points (Streak Bonus!)" : "You Win! +1 Point",
          color: "text-green-500",
          bg: "bg-green-500/10 border-green-500/20",
        };
      case "loss":
        return {
          icon: <Frown className="h-5 w-5 text-red-500" />,
          text: "You Lose! -1 Point",
          color: "text-red-500",
          bg: "bg-red-500/10 border-red-500/20",
        };
      case "draw":
        return {
          icon: <Minus className="h-5 w-5 text-yellow-500" />,
          text: "It's a Draw!",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/20",
        };
      default:
        return null;
    }
  };

  const resultInfo = getResultInfo();

  // Fallback message so the bot message box never disappears
  const displayMessage = botMessage || (
    gameResult 
      ? "Good game! Want to play again?" 
      : isAiThinking 
        ? "Let me think about this..." 
        : "Your turn! I'm waiting for your move."
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top section: Game Result (Turn indicator moved to TurnTimer) */}
      <div className="grid w-full min-h-[96px]">
        <AnimatePresence>
          {resultInfo ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "[grid-area:1/1] flex items-center justify-center gap-3 rounded-xl border p-4 shadow-lg h-full",
                resultInfo.bg
              )}
            >
              <div className="p-2 rounded-full bg-background/50">
                {resultInfo.icon}
              </div>
              <div className="text-center">
                <div className={cn("font-bold text-lg", resultInfo.color)}>
                  {resultInfo.text}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="[grid-area:1/1] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm flex items-center justify-between h-full overflow-hidden relative"
            >
              {/* Background decorative elements */}
              <div className="absolute -right-4 -top-4 opacity-10">
                <BrainCircuit className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="absolute -left-4 -bottom-4 opacity-10">
                <Target className="w-16 h-16 text-purple-500" />
              </div>

              {/* Content */}
              <div className="flex items-center gap-4 relative z-10 w-full">
                <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Swords className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {difficulty === "easy" ? "Casual Match" : 
                     difficulty === "medium" ? "Competitive Match" : "Intense Battle"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Target className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Goal: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{gridSize === "3x3" ? "3" : gridSize === "4x4" ? "4" : "5"}</span> in a row
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bot message */}
      <div className="grid w-full min-h-[76px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayMessage}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="[grid-area:1/1] flex items-start gap-3 rounded-xl bg-muted/50 backdrop-blur-sm p-4 border border-border/30 overflow-hidden h-full"
          >
            <div className="p-1.5 rounded-full bg-background/50 shrink-0 mt-0.5">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-2">{displayMessage}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game/store";
import { Bot, Loader2, Trophy, Frown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameInfo() {
  const { gameResult, botMessage, isAiThinking, currentTurn, humanPlayer } =
    useGameStore();

  const getResultInfo = () => {
    switch (gameResult) {
      case "win":
        return {
          icon: <Trophy className="h-5 w-5 text-yellow-500" />,
          text: "You Win! +1 Point",
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

  return (
    <div className="space-y-3 w-full max-w-[380px] mx-auto">
      {/* Turn indicator */}
      <AnimatePresence mode="wait">
        {!gameResult && (
          <motion.div
            key="turn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              {isAiThinking ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Bot is thinking...
                </span>
              ) : (
                <span>
                  {currentTurn === humanPlayer ? "Your turn" : "Bot's turn"}
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game result */}
      <AnimatePresence>
        {resultInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border p-3",
              resultInfo.bg
            )}
          >
            {resultInfo.icon}
            <span className={cn("font-semibold", resultInfo.color)}>
              {resultInfo.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot message */}
      <AnimatePresence mode="wait">
        {botMessage && (
          <motion.div
            key={botMessage}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-start gap-2 rounded-lg bg-muted/50 p-3"
          >
            <Bot className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground italic">{botMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

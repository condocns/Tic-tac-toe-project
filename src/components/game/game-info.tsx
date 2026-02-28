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
    <div className="space-y-4 w-full">
      {/* Turn indicator */}
      <AnimatePresence mode="wait">
        {!gameResult && (
          <motion.div
            key="turn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
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
            <div className="text-lg font-semibold">
              {currentTurn === humanPlayer ? (
                <span className="text-blue-500">You ({humanPlayer})</span>
              ) : (
                <span className="text-red-500">Bot</span>
              )}
            </div>
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
              "flex items-center justify-center gap-3 rounded-xl border p-4 shadow-lg",
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
            className="flex items-start gap-3 rounded-xl bg-muted/50 backdrop-blur-sm p-4 border border-border/30"
          >
            <div className="p-1.5 rounded-full bg-background/50 shrink-0">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed">{botMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

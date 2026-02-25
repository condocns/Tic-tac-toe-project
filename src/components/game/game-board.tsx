"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function GameBoard() {
  const { board, winningLine, isAiThinking, gameResult, humanPlayer } = useGameStore();

  const handleCellClick = async (index: number) => {
    if (board[index] !== null || isAiThinking || gameResult !== null) return;

    const response = await fetch("/api/game/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cellIndex: index }),
    });

    if (!response.ok) return;

    const data = await response.json();
    const store = useGameStore.getState();

    store.addMove(index);
    store.setBoard(data.boardAfterPlayer);
    store.setBotMessage(data.botMessage || "");

    if (data.gameResult) {
      store.setGameResult(data.gameResult);
      store.setWinningLine(data.winningLine);
      store.endGame();
      return;
    }

    // AI move
    store.setIsAiThinking(true);
    store.setCurrentTurn(store.aiPlayer);

    await new Promise((resolve) => setTimeout(resolve, 600));

    store.addMove(data.aiMove);
    store.setBoard(data.boardAfterAI);
    store.setBotMessage(data.botMessageAfterAI || "");
    store.setIsAiThinking(false);
    store.setCurrentTurn(store.humanPlayer);

    if (data.gameResultAfterAI) {
      store.setGameResult(data.gameResultAfterAI);
      store.setWinningLine(data.winningLineAfterAI);
      store.endGame();
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[320px] sm:max-w-[380px] mx-auto aspect-square">
        {board.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index);

          return (
            <motion.button
              key={index}
              className={cn(
                "relative flex items-center justify-center rounded-xl border-2 bg-card text-card-foreground",
                "text-3xl sm:text-4xl md:text-5xl font-bold",
                "transition-colors duration-200",
                cell === null && !isAiThinking && !gameResult
                  ? "hover:bg-accent hover:border-primary/50 cursor-pointer"
                  : "cursor-default",
                isWinningCell && "border-primary bg-primary/10",
                !isWinningCell && "border-border"
              )}
              onClick={() => handleCellClick(index)}
              whileHover={
                cell === null && !isAiThinking && !gameResult
                  ? { scale: 1.05 }
                  : {}
              }
              whileTap={
                cell === null && !isAiThinking && !gameResult
                  ? { scale: 0.95 }
                  : {}
              }
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    key={`${index}-${cell}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={cn(
                      cell === humanPlayer ? "text-blue-500" : "text-red-500",
                      isWinningCell && "drop-shadow-lg"
                    )}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Winning line overlay */}
      <AnimatePresence>
        {winningLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <WinLine cells={winningLine} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WinLine({ cells }: { cells: number[] }) {
  const getLineStyle = (cells: number[]): React.CSSProperties => {
    const positions: Record<string, React.CSSProperties> = {
      "0,1,2": { top: "16.6%", left: "5%", width: "90%", height: "3px", transform: "translateY(-50%)" },
      "3,4,5": { top: "50%", left: "5%", width: "90%", height: "3px", transform: "translateY(-50%)" },
      "6,7,8": { top: "83.3%", left: "5%", width: "90%", height: "3px", transform: "translateY(-50%)" },
      "0,3,6": { top: "5%", left: "16.6%", width: "3px", height: "90%", transform: "translateX(-50%)" },
      "1,4,7": { top: "5%", left: "50%", width: "3px", height: "90%", transform: "translateX(-50%)" },
      "2,5,8": { top: "5%", left: "83.3%", width: "3px", height: "90%", transform: "translateX(-50%)" },
      "0,4,8": { top: "5%", left: "5%", width: "127%", height: "3px", transform: "rotate(45deg)", transformOrigin: "top left" },
      "2,4,6": { top: "5%", right: "5%", width: "127%", height: "3px", transform: "rotate(-45deg)", transformOrigin: "top right" },
    };

    const key = cells.join(",");
    return positions[key] || {};
  };

  return (
    <motion.div
      className="absolute bg-primary rounded-full"
      style={getLineStyle(cells)}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  );
}

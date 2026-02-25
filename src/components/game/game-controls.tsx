"use client";

import { useGameStore } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import { RotateCcw, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBotMessage } from "@/lib/game/bot-messages";

export function GameControls() {
  const { difficulty, setDifficulty, resetGame, gameResult, setBotMessage, startGame } =
    useGameStore();

  const handleNewGame = () => {
    resetGame();
    startGame();
    setBotMessage(getBotMessage("game_start"));
  };

  const handleDifficultyChange = (diff: "easy" | "hard") => {
    setDifficulty(diff);
    handleNewGame();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[380px] mx-auto">
      {/* Difficulty selector */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-sm font-medium text-muted-foreground mr-1">Difficulty:</span>
        <Button
          variant={difficulty === "easy" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDifficultyChange("easy")}
          className={cn("flex-1")}
        >
          Easy
        </Button>
        <Button
          variant={difficulty === "hard" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDifficultyChange("hard")}
          className={cn("flex-1")}
        >
          Hard
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full">
        {gameResult ? (
          <Button onClick={handleNewGame} className="flex-1" size="lg">
            <Swords className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        ) : (
          <Button variant="outline" onClick={handleNewGame} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        )}
      </div>
    </div>
  );
}

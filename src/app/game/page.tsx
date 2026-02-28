"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { GameBoard } from "@/components/game/game-board";
import { GameInfo } from "@/components/game/game-info";
import { GameControls } from "@/components/game/game-controls";
import { TurnTimer } from "@/components/game/turn-timer";
import { useGameStore } from "@/lib/game/store";
import { getBotMessage } from "@/lib/game/bot-messages";

export default function GamePage() {
  const { data: session, status } = useSession();
  const { resetGame, startGame, setBotMessage } = useGameStore();

  useEffect(() => {
    resetGame();
    startGame();
    setBotMessage(getBotMessage("game_start"));
  }, [resetGame, startGame, setBotMessage]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 sm:py-10 space-y-6 min-h-[600px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">
        Tic-Tac-Toe
      </h1>
      <GameInfo />
      <TurnTimer />
      <GameBoard />
      <GameControls />
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2"
          >
            Tic-Tac-Toe
          </motion.h1>
          <p className="text-muted-foreground text-lg">Challenge the AI in this classic game</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Panel - Game Info & Timer */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GameInfo />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TurnTimer />
            </motion.div>
          </div>

          {/* Center Panel - Game Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 flex justify-center"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
              <GameBoard />
            </div>
          </motion.div>

          {/* Right Panel - Game Controls */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GameControls />
            </motion.div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/30">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Wins</div>
          </div>
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/30">
            <div className="text-2xl font-bold text-destructive">0</div>
            <div className="text-sm text-muted-foreground">Losses</div>
          </div>
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/30">
            <div className="text-2xl font-bold text-muted-foreground">0</div>
            <div className="text-sm text-muted-foreground">Draws</div>
          </div>
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/30">
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

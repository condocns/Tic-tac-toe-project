"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, Shield, Zap, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-10"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
      
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <motion.div 
          className="mx-auto max-w-3xl text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-3.5 w-3.5 text-purple-300" />
            </motion.div>
            <span className="text-purple-200">Player vs AI Bot</span>
          </motion.div>

          <motion.h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Tic-Tac-Toe
            </span>
            <span className="block text-primary mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Challenge the AI
            </span>
          </motion.h1>

          <motion.p 
            className="mx-auto max-w-xl text-purple-100/80 text-base sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Sign in, pick your difficulty, and battle the AI. Win streaks earn bonus points.
            Climb the leaderboard and prove you are the best!
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/25">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Start Playing
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/leaderboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-400/30 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 backdrop-blur-sm">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="bg-purple-500/10 border-purple-400/20 backdrop-blur-sm hover:bg-purple-500/20 transition-colors">
              <CardHeader>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Gamepad2 className="h-8 w-8 text-purple-300 mb-2" />
                </motion.div>
                <CardTitle className="text-lg text-purple-100">Play vs AI</CardTitle>
                <CardDescription className="text-purple-200/70">
                  Choose Easy or Hard difficulty. The AI adapts to your skill level.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="bg-purple-500/10 border-purple-400/20 backdrop-blur-sm hover:bg-purple-500/20 transition-colors">
              <CardHeader>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
                >
                  <Trophy className="h-8 w-8 text-purple-300 mb-2" />
                </motion.div>
                <CardTitle className="text-lg text-purple-100">Score & Streaks</CardTitle>
                <CardDescription className="text-purple-200/70">
                  Win +1, Lose -1. Get 3 wins in a row for a bonus +1 point!
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div 
            className="sm:col-span-2 lg:col-span-1"
            whileHover={{ y: -5, scale: 1.02 }} 
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-purple-500/10 border-purple-400/20 backdrop-blur-sm hover:bg-purple-500/20 transition-colors">
              <CardHeader>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
                >
                  <Shield className="h-8 w-8 text-purple-300 mb-2" />
                </motion.div>
                <CardTitle className="text-lg text-purple-100">Leaderboard</CardTitle>
                <CardDescription className="text-purple-200/70">
                  Compete with other players and climb to the top of the rankings.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Floating stars decoration */}
        <motion.div
          className="absolute top-20 left-10"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Star className="h-6 w-6 text-yellow-400/30" />
        </motion.div>
        <motion.div
          className="absolute top-32 right-20"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <Star className="h-4 w-4 text-yellow-400/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20"
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 90, -90, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          <Star className="h-5 w-5 text-yellow-400/25" />
        </motion.div>
      </div>
    </div>
  );
}

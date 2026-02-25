import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 md:py-24">
      <div className="mx-auto max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
          <Zap className="h-3.5 w-3.5" />
          Player vs AI Bot
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Tic-Tac-Toe
          <span className="block text-primary">Challenge the AI</span>
        </h1>

        <p className="mx-auto max-w-xl text-muted-foreground text-base sm:text-lg">
          Sign in, pick your difficulty, and battle the AI. Win streaks earn bonus points.
          Climb the leaderboard and prove you are the best!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Start Playing
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Gamepad2 className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Play vs AI</CardTitle>
            <CardDescription>
              Choose Easy or Hard difficulty. The AI adapts to your skill level.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Trophy className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Score & Streaks</CardTitle>
            <CardDescription>
              Win +1, Lose -1. Get 3 wins in a row for a bonus +1 point!
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Leaderboard</CardTitle>
            <CardDescription>
              Compete with other players and climb to the top of the rankings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

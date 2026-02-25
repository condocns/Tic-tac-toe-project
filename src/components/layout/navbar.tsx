"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Gamepad2, Trophy, History, Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Gamepad2 className="h-5 w-5" />
            <span className="hidden sm:inline">Tic-Tac-Toe</span>
          </Link>

          {session && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/game" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Play
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
              {session.user.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {session ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                  <AvatarFallback>{session.user.name?.charAt(0) ?? "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden lg:inline">{session.user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          {session && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {mobileMenuOpen && session && (
        <div className="md:hidden border-t p-4 space-y-2 bg-background">
          <Link
            href="/game"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Gamepad2 className="h-4 w-4" />
            Play Game
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            <History className="h-4 w-4" />
            Match History
          </Link>
          {session.user.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

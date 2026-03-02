import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { auth } from "@/lib/auth";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tic-Tac-Toe | Player vs AI",
  description: "Challenge the AI in a game of Tic-Tac-Toe. Login, play, and climb the leaderboard!",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-purple-200 via-purple-400 to-purple-200 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900`}>
        <QueryProvider>
          <SessionProvider session={session}>
            <div className="relative flex min-h-screen flex-col">
              {/* Background elements for all pages */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white rounded-full opacity-5"
                    style={{
                      width: Math.random() * 3 + 1 + 'px',
                      height: Math.random() * 3 + 1 + 'px',
                      left: Math.random() * 100 + '%',
                      top: Math.random() * 100 + '%',
                    }}
                  />
                ))}
              </div>
              
              <Navbar />
              <main className="relative z-10 flex-1">{children}</main>
            </div>
            <Toaster richColors position="top-right" />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

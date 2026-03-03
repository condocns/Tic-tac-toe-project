"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

// Hook to check session validity and auto-logout if revoked
export function useSessionValidator() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const checkSessionValidity = async () => {
      if (!session?.user?.id) return;

      try {
        // Check if session is still valid
        const response = await fetch("/api/health", {
          credentials: "include",
        });

        if (response.status === 401) {
          // Session revoked, force logout
          console.log("Session revoked, logging out...");
          await signOut({ redirect: false });
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Session validation error:", error);
      }
    };

    // Check immediately
    checkSessionValidity();

    // Check every 30 seconds
    const interval = setInterval(checkSessionValidity, 30000);

    return () => clearInterval(interval);
  }, [session, status]);
}

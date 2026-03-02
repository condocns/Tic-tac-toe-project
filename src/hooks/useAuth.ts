"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  };

  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    requireAuth,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isSessionBlacklistedSafe } from "@/lib/session-blacklist";
import { getRequiredEnv } from "@/lib/env";

// Middleware to check session blacklist on every API request
export async function checkSessionValidity(req: NextRequest) {
  try {
    // Only check for API routes and protected pages
    if (req.nextUrl.pathname.startsWith('/api/') || 
        req.nextUrl.pathname.startsWith('/admin') ||
        req.nextUrl.pathname.startsWith('/game') ||
        req.nextUrl.pathname.startsWith('/history') ||
        req.nextUrl.pathname.startsWith('/leaderboard')) {
      
      const token = await getToken({ 
        req, 
        secret: getRequiredEnv("AUTH_SECRET"),
        secureCookie: process.env.NODE_ENV === "production"
      });
      
      if (token?.sub) {
        const isBlacklisted = await isSessionBlacklistedSafe(token.sub);
        if (isBlacklisted) {
          // Clear the session cookie and redirect to login
          const response = NextResponse.redirect(new URL("/login", req.url));
          response.cookies.delete("next-auth.session-token");
          response.cookies.delete("next-auth.csrf-token");
          response.cookies.delete("__Secure-next-auth.session-token");
          return response;
        }
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Session validity check error:", error);
    return NextResponse.next();
  }
}

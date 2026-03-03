import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getRequiredEnv } from "@/lib/env";
import { isSessionBlacklistedSafe } from "@/lib/session-blacklist";

export default async function proxy(req: NextRequest) {
  const isPublicRoute = ["/", "/login", "/api/health"].some(route => 
    req.nextUrl.pathname === route
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check session validity first
  const token = await getToken({ req, secret: getRequiredEnv("AUTH_SECRET") });
  
  if (token?.sub) {
    // const isBlacklisted = await isSessionBlacklistedSafe(token.sub, 75, token.email || undefined);
    // if (isBlacklisted) {
    //   // Clear session cookies and redirect to login
    //   const response = NextResponse.redirect(new URL("/login", req.url));
    //   response.cookies.delete("next-auth.session-token");
    //   response.cookies.delete("next-auth.csrf-token");
    //   response.cookies.delete("__Secure-next-auth.session-token");
    //   return response;
    // }
  }

  const isLoggedIn = !!token;
  
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (token?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

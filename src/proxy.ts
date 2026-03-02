import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getRequiredEnv } from "@/lib/env";

export default async function proxy(req: NextRequest) {
  const isPublicRoute = ["/", "/login", "/api/health"].some(route => 
    req.nextUrl.pathname === route
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: getRequiredEnv("AUTH_SECRET") });
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

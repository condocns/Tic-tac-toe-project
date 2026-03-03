import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { getRequiredEnv } from "@/lib/env";
import { UserRole } from "@prisma/client";
import { blacklistSession } from "@/lib/session-blacklist";

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const clientIP = getClientIP(req);
  const rateLimiter = rateLimiters.admin;
  const { success, limit, remaining, reset } = await rateLimiter.limit(clientIP);
  
  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { 
      endpoint: "/api/admin/revoke-session",
      limit,
      remaining,
      reset 
    });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  try {
    // 2. Authentication
    const token = await getToken({ req, secret: getRequiredEnv("AUTH_SECRET") });
    if (!token?.sub) {
      logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/admin/revoke-session" });
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 3. RBAC (Role-Based Access Control)
    const tokenEmail = typeof token.email === "string" ? token.email : undefined;
    
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.sub },
          ...(tokenEmail ? [{ email: tokenEmail }] : []),
        ],
      },
      select: { role: true },
    });

    if (adminUser?.role !== UserRole.ADMIN) {
      logSecurityEvent.unauthorizedAccess(req, { 
        endpoint: "/api/admin/revoke-session", 
        userId: token.sub,
        reason: "Insufficient permissions" 
      });
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 4. Parse request body
    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid request: userId is required" },
        { status: 400 }
      );
    }

    // 5. Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 6. Revoke session
    await blacklistSession(userId, targetUser.email || undefined);

    // 7. Log security event
    logSecurityEvent.sessionRevoked(req, {
      revokedBy: token.sub,
      revokedUserId: userId,
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
      targetUserRole: targetUser.role
    });

    return NextResponse.json({
      success: true,
      message: `Session revoked for ${targetUser.role === UserRole.ADMIN ? 'admin' : 'user'}: ${targetUser.name || targetUser.email}`,
      revokedAt: new Date().toISOString(),
      targetUserRole: targetUser.role
    });

  } catch (error) {
    console.error("[Revoke Session API Error]:", error);
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

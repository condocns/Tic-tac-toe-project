import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIP = getClientIP(req);
    const { success, limit, remaining, reset } = await rateLimiters.auth.limit(`register_${clientIP}`);
    
    if (!success) {
      logSecurityEvent.rateLimitExceeded(req, { endpoint: "/api/auth/register", limit, remaining, reset });
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

    const body = await req.json();

    // 2. Validate Input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Optional: generate a default avatar based on name
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    // Don't send password back in response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "Registration successful", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}

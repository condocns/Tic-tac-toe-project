import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  try {
    // Check database connection
    await prisma.$queryRawUnsafe("SELECT 1");
    const dbLatency = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: "ok", latencyMs: dbLatency },
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: "error" },
        },
      },
      { status: 503 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getRequiredEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  
  // Disable registration when using OAuth only
  // Enable by setting CREDENTIALS_ENABLED=true in environment
  const credentialsEnabled = process.env.CREDENTIALS_ENABLED === "true";
  
  if (!credentialsEnabled) {
    return NextResponse.json(
      { error: "Registration is disabled. Please use OAuth login." },
      { status: 403 }
    );
  }
  
  // If credentials are enabled, import and use the full implementation
  // This is a placeholder - in production, implement proper registration
  return NextResponse.json(
    { error: "Registration not implemented for OAuth mode" },
    { status: 501 }
  );
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "matchpulse",
    environment: process.env.NODE_ENV ?? "unknown",
  });
}

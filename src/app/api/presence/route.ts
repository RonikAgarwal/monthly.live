import { NextRequest, NextResponse } from "next/server";
import { registerPresence } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

const SESSION_ID = /^[A-Za-z0-9_-]{16,128}$/;

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = (await request.json()) as { sessionId?: unknown };
    if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) {
      return NextResponse.json({ error: "Invalid presence session" }, { status: 400 });
    }
    const watchingHere = await registerPresence(sessionId);
    return NextResponse.json({ watchingHere }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Presence unavailable" }, { status: 503 });
  }
}

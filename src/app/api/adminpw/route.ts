import { NextResponse } from "next/server";
import { lockGateWithPassword, openGate } from "@/lib/gate";

export const dynamic = "force-dynamic";

function newPasswordError(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password } = body as { action?: unknown; password?: unknown };

    if (action === "open") {
      await openGate();
      return NextResponse.json({ ok: true, mode: "open" }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "setPassword") {
      if (typeof password !== "string") return newPasswordError("password is required");
      const trimmed = password.trim();
      if (trimmed.length < 1) return newPasswordError("password cannot be empty");
      if (trimmed.length > 64) return newPasswordError("password is too long (max 64 characters)");
      await lockGateWithPassword(trimmed);
      return NextResponse.json({ ok: true, mode: "locked" }, { headers: { "Cache-Control": "no-store" } });
    }

    return newPasswordError("unknown action");
  } catch {
    return NextResponse.json({ ok: false, error: "admin storage unavailable" }, { status: 503 });
  }
}

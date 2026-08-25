import { NextResponse } from "next/server";
import { getPublicBroadcastState } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getPublicBroadcastState(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ status: "OFFLINE", watchingHere: 0, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  }
}

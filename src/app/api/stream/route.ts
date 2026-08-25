import { NextResponse } from "next/server";
import { getPublicBroadcastState } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getPublicBroadcastState();
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}

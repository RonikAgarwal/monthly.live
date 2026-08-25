import { NextResponse } from "next/server";
import { getHistory } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getHistory(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}

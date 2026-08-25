import { NextRequest, NextResponse } from "next/server";
import { getData, updateBroadcast } from "@/lib/data";

export async function GET() {
  const data = getData();
  return NextResponse.json(data.broadcast);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = updateBroadcast(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

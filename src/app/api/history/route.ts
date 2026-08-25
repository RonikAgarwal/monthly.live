import { NextRequest, NextResponse } from "next/server";
import { getData, addHistoryEntry, removeHistoryEntry } from "@/lib/data";

export async function GET() {
  const data = getData();
  return NextResponse.json(data.history);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = addHistoryEntry(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const updated = removeHistoryEntry(id);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

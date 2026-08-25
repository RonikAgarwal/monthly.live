import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const sitePassword = process.env.MONTHLY_LIVE_PASSWORD;
    if (!sitePassword) {
      return NextResponse.json({ success: false, error: "Site password is not configured" }, { status: 503 });
    }
    const body = await request.json();
    const { password } = body;

    if (typeof password === "string" && password === sitePassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

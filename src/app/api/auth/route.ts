import { NextRequest, NextResponse } from "next/server";

// In production, use bcrypt or similar for password hashing
// The password should be set via environment variable
const SITE_PASSWORD = process.env.MONTHLY_LIVE_PASSWORD || "monthly";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === SITE_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

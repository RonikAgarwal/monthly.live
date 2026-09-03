import { NextResponse } from "next/server";
import { getGateMode, verifyGateAccess } from "@/lib/gate";

export const dynamic = "force-dynamic";

/** Public gate config — tells the gate page whether it must ask for a password. */
export async function GET() {
  const mode = await getGateMode();
  return NextResponse.json({ mode }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body as { password?: unknown };

    const allowed =
      typeof password === "string" ? await verifyGateAccess(password) : await verifyGateAccess("");

    if (!allowed) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "monthly-live-auth",
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

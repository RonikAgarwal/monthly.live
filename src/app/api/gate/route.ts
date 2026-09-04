import { NextResponse } from "next/server";
import { getGateGeneration, getGateMode, verifyGateAccess } from "@/lib/gate";

export const dynamic = "force-dynamic";

/** Public gate config — mode plus the current session generation for stale-session checks. */
export async function GET() {
  const [mode, generation] = await Promise.all([getGateMode(), getGateGeneration()]);
  return NextResponse.json(
    { mode, generation },
    { headers: { "Cache-Control": "no-store" } }
  );
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

    // The cookie carries the session generation it was issued at; middleware
    // rejects it once the password changes and the generation is bumped.
    const generation = await getGateGeneration();
    const response = NextResponse.json({ success: true, generation });
    response.cookies.set({
      name: "monthly-live-auth",
      value: String(generation),
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

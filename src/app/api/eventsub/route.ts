import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { claimEvent, markLive, markOffline, streamFromOnlineEvent } from "@/lib/broadcast";
import { getChannelStream } from "@/lib/twitch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSignature(request: NextRequest, body: string) {
  const secret = process.env.TWITCH_EVENTSUB_SECRET;
  const id = request.headers.get("twitch-eventsub-message-id");
  const timestamp = request.headers.get("twitch-eventsub-message-timestamp");
  const signature = request.headers.get("twitch-eventsub-message-signature");
  if (!secret || !id || !timestamp || !signature) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(id + timestamp + body).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!validSignature(request, body)) return NextResponse.json({ error: "Invalid EventSub signature" }, { status: 403 });

  let message: { challenge?: string; subscription?: { type?: string }; event?: Record<string, unknown> };
  try {
    message = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Malformed EventSub payload" }, { status: 400 });
  }

  if (message.challenge) return new NextResponse(message.challenge, { status: 200, headers: { "Content-Type": "text/plain" } });

  const messageId = request.headers.get("twitch-eventsub-message-id");
  if (!messageId) return NextResponse.json({ error: "Missing message id" }, { status: 400 });
  try {
    if (!(await claimEvent(messageId))) return NextResponse.json({ ok: true, duplicate: true });
    if (message.subscription?.type === "stream.online") {
      const stream = await getChannelStream().catch(() => null);
      const fallback = message.event ? streamFromOnlineEvent(message.event) : null;
      if (!stream && !fallback) return NextResponse.json({ error: "Invalid stream.online event" }, { status: 400 });
      await markLive(stream ?? fallback!);
    } else if (message.subscription?.type === "stream.offline") {
      await markOffline();
    }
  } catch {
    // Return non-2xx so Twitch retries a transient Redis/API failure.
    return NextResponse.json({ error: "Unable to process EventSub event" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}

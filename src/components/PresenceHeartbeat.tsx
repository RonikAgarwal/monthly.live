"use client";

import { useEffect } from "react";

const STORAGE_KEY = "monthly_live_presence_id";
const HEARTBEAT_MS = Number(process.env.NEXT_PUBLIC_PRESENCE_HEARTBEAT_SECONDS ?? 30) * 1000;

function sessionId() {
  let value = sessionStorage.getItem(STORAGE_KEY);
  if (!value) {
    value = crypto.randomUUID().replace(/-/g, "");
    sessionStorage.setItem(STORAGE_KEY, value);
  }
  return value;
}

export default function PresenceHeartbeat({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const id = sessionId();
    const send = () => {
      if (!document.hidden) void fetch("/api/presence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: id }), keepalive: true });
    };
    send();
    const timer = window.setInterval(send, Math.max(10_000, HEARTBEAT_MS));
    document.addEventListener("visibilitychange", send);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", send);
    };
  }, [active]);

  return null;
}

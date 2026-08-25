"use client";

import { useEffect, useMemo, useState } from "react";

interface StreamPlayerProps {
  isLive: boolean;
  channelLogin?: string;
}

export default function StreamPlayer({ isLive, channelLogin }: StreamPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const parent = typeof window === "undefined" ? "localhost" : window.location.hostname;
  const source = useMemo(() => {
    if (!isLive || !channelLogin) return null;
    const query = new URLSearchParams({ channel: channelLogin, parent, autoplay: "false", muted: "true" });
    return `https://player.twitch.tv/?${query}`;
  }, [channelLogin, isLive, parent]);

  useEffect(() => {
    if (!source) {
      setLoaded(false);
      setError(false);
      return;
    }
    if (loaded) return;

    const timeout = window.setTimeout(() => setError(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, [source, loaded]);

  return (
    <div style={{ position: "relative", width: "100%", background: "#000", aspectRatio: "16/9" }}>
      {source ? (
        <iframe key={source} title="MONTHLY.LIVE Twitch broadcast" src={source} allowFullScreen allow="autoplay; fullscreen; picture-in-picture" onLoad={() => { setError(false); setLoaded(true); }} style={{ width: "100%", height: "100%", display: "block", border: 0, background: "#000" }} />
      ) : (
        <img src="/assets/static.gif" alt="TV static" style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }} />
      )}
      {source && !loaded && !error && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontFamily: '"Courier New", monospace', fontSize: "11px", color: "#555" }}>connecting to twitch...</div>}
      {source && error && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", fontFamily: '"Courier New", monospace', fontSize: "12px", color: "#cc0000", textAlign: "center" }}>twitch player unavailable</div>}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

interface TwitchPlayer {
  play(): void;
  pause(): void;
  getMuted(): boolean;
  setMuted(muted: boolean): void;
  getVolume(): number;
  setVolume(volume: number): void;
  getStatus(): string;
  dispose(): void;
}

interface StreamPlayerProps {
  isLive: boolean;
  channelLogin?: string;
}

let scriptLoaded = false;
let scriptLoading = false;

function loadTwitchScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (scriptLoaded) { clearInterval(check); resolve(); }
      }, 100);
    });
  }
  scriptLoading = true;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://embed.twitch.tv/embed/v1.js";
    script.async = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => { scriptLoading = false; reject(new Error("Failed to load Twitch embed script")); };
    document.head.appendChild(script);
  });
}

export default function StreamPlayer({ isLive, channelLogin }: StreamPlayerProps) {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwitchPlayer | null>(null);

  useEffect(() => {
    if (!isLive || !channelLogin || !containerRef.current) return;

    let disposed = false;
    let unmountFns: (() => void)[] = [];

    const setup = async () => {
      try {
        await loadTwitchScript();
        if (disposed || !containerRef.current) return;

        // Clear previous content
        containerRef.current.innerHTML = "";

        const tw = (window as unknown as { Twitch?: { Player: new (target: string, options: Record<string, unknown>) => TwitchPlayer } }).Twitch;
        if (!tw?.Player) return;

        const embedId = `twitch-embed-${Math.random().toString(36).slice(2)}`;
        const embedDiv = document.createElement("div");
        embedDiv.id = embedId;
        embedDiv.style.width = "100%";
        embedDiv.style.height = "100%";
        containerRef.current.appendChild(embedDiv);

        // Start muted so browser autoplay works
        const player = new tw.Player(embedId, {
          channel: channelLogin,
          parent: [window.location.hostname],
          autoplay: true,
          muted: true,
          width: "100%",
          height: "100%",
        });

        playerRef.current = player;

        // Poll for player ready, then unmute
        const readyCheck = setInterval(() => {
          if (disposed) { clearInterval(readyCheck); return; }
          try {
            const status = player.getStatus();
            if (status === "playing" || status === "ready" || status === "idle") {
              clearInterval(readyCheck);
              if (!disposed) {
                setReady(true);
                // Unmute after a short delay to bypass browser autoplay policy
                setTimeout(() => {
                  if (!disposed) {
                    try { player.setMuted(false); } catch { /* ignore */ }
                  }
                }, 500);
              }
            }
          } catch { /* not ready yet */ }
        }, 300);

        unmountFns.push(() => clearInterval(readyCheck));
      } catch { /* script load failed */ }
    };

    setup();

    return () => {
      disposed = true;
      unmountFns.forEach(fn => fn());
      playerRef.current?.dispose();
      playerRef.current = null;
      setReady(false);
    };
  }, [isLive, channelLogin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLive && channelLogin) {
    return (
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#000" }} />
    );
  }

  return (
    <img
      src="/assets/static.gif"
      alt="TV static"
      style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
    />
  );
}

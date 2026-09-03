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

interface TwitchWindow {
  Twitch?: {
    Player: new (target: string, options: Record<string, unknown>) => TwitchPlayer;
  };
}

interface StreamPlayerProps {
  isLive: boolean;
  channelLogin?: string;
  onPlayerReady?: (player: TwitchPlayer) => void;
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

export default function StreamPlayer({ isLive, channelLogin, onPlayerReady }: StreamPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwitchPlayer | null>(null);
  const embedIdRef = useRef(`twitch-embed-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!isLive || !channelLogin || !containerRef.current) {
      setLoaded(false);
      setError(false);
      return;
    }

    let disposed = false;

    const setup = async () => {
      try {
        await loadTwitchScript();
        if (disposed || !containerRef.current) return;

        // Clean previous embed content
        containerRef.current.innerHTML = "";

        const tw = (window as unknown as TwitchWindow).Twitch;
        if (!tw?.Player) {
          setError(true);
          return;
        }

        const embedId = embedIdRef.current;
        const embedDiv = document.createElement("div");
        embedDiv.id = embedId;
        embedDiv.style.width = "100%";
        embedDiv.style.height = "100%";
        containerRef.current.appendChild(embedDiv);

        const player = new tw.Player(embedId, {
          channel: channelLogin,
          parent: [window.location.hostname],
          autoplay: false,
          muted: true,
          width: "100%",
          height: "100%",
        });

        playerRef.current = player;

        // Wait for player to be ready
        const checkReady = setInterval(() => {
          if (disposed) { clearInterval(checkReady); return; }
          try {
            const status = player.getStatus();
            if (status === "playing" || status === "idle" || status === "ready") {
              clearInterval(checkReady);
              setLoaded(true);
              setError(false);
              onPlayerReady?.(player);
            }
          } catch {
            // Player not ready yet
          }
        }, 500);

        // Timeout after 15s
        const timeout = setTimeout(() => {
          if (!disposed && !loaded) {
            clearInterval(checkReady);
            setError(true);
          }
        }, 15_000);

        return () => { clearInterval(checkReady); clearTimeout(timeout); };
      } catch {
        if (!disposed) setError(true);
      }
    };

    const cleanup = setup();

    return () => {
      disposed = true;
      playerRef.current?.dispose();
      playerRef.current = null;
      cleanup?.then((fn) => fn?.());
    };
  }, [isLive, channelLogin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle mute/unmute from parent
  const prevMutedRef = useRef(true);
  const handleMuteChange = (muted: boolean) => {
    if (playerRef.current && muted !== prevMutedRef.current) {
      prevMutedRef.current = muted;
      try { playerRef.current.setMuted(muted); } catch { /* ignore */ }
    }
  };

  // Expose mute handler via a data attribute trick (parent reads it)
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    (el as HTMLDivElement & { _handleMuteChange?: (m: boolean) => void })._handleMuteChange = handleMuteChange;
  });

  return (
    <div style={{ position: "relative", width: "100%", background: "#000", aspectRatio: "16/9" }}>
      {isLive && channelLogin ? (
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <img src="/assets/static.gif" alt="TV static" style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }} />
      )}
      {isLive && channelLogin && !loaded && !error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontFamily: '"Courier New", monospace', fontSize: "11px", color: "#555" }}>
          connecting to twitch...
        </div>
      )}
      {isLive && channelLogin && error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", fontFamily: '"Courier New", monospace', fontSize: "12px", color: "#cc0000", textAlign: "center" }}>
          twitch player unavailable
        </div>
      )}
    </div>
  );
}

export type { TwitchPlayer };

"use client";

import React, { useEffect, useState } from "react";
import { WindowInstance } from "@/context/WindowManagerContext";
import { useBroadcastState } from "@/context/BroadcastContext";
import StreamPlayer from "../StreamPlayer";

export default function MediaPlayerApp({ windowInstance }: { windowInstance: WindowInstance }) {
  const { broadcast } = useBroadcastState();
  const [uptime, setUptime] = useState("00:00:00");
  const [activeTab, setActiveTab] = useState("Now Playing");

  useEffect(() => {
    if (broadcast.status !== "LIVE" || !broadcast.startedAt) return;
    const update = () => {
      const start = new Date(broadcast.startedAt!).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      if (diff < 0) return;
      const h = Math.floor(diff / 3600).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      setUptime(`${h}:${m}:${s}`);
    };
    update();
    const int = setInterval(update, 1000);
    return () => clearInterval(int);
  }, [broadcast.status, broadcast.startedAt]);

  const tabs = ["Now Playing", "Library", "Rip", "Burn", "Sync"];

  return (
    <div className="wmp-container">
      {/* Tab bar */}
      <div className="wmp-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`wmp-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header info bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 16px",
        background: "rgba(0,0,0,0.2)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>MONTHLY.LIVE</span>
          {broadcast.status === "LIVE" && (
            <span style={{
              background: "#cc0000",
              color: "#fff",
              padding: "1px 8px",
              borderRadius: "3px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}>
              LIVE
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "#8899aa" }}>
          {broadcast.status === "LIVE" && (
            <>
              <span>VIEWERS</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>
                👥 {broadcast.watchingHere > 0 ? (broadcast.watchingHere >= 1000 ? `${(broadcast.watchingHere / 1000).toFixed(1)}K` : broadcast.watchingHere) : "—"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stream area */}
      <div style={{ flex: 1, position: "relative", minHeight: 0, background: "#000" }}>
        {broadcast.status === "LIVE" ? (
          <StreamPlayer isLive={true} channelLogin={broadcast.channelLogin} />
        ) : (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Courier New", monospace',
            background: "radial-gradient(ellipse, #0a1520 0%, #000 100%)",
          }}>
            <div style={{ fontSize: "28px", color: "#2a4060", marginBottom: "8px", letterSpacing: "6px" }}>NO SIGNAL</div>
            <div style={{ fontSize: "11px", color: "#1a3050" }}>NEXT TRANSMISSION: TBD</div>
          </div>
        )}
      </div>

      {/* Now Playing info */}
      <div style={{
        padding: "8px 16px",
        background: "rgba(0,0,0,0.3)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#667788", marginBottom: "2px" }}>NOW PLAYING</div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#ddd" }}>
            {broadcast.status === "LIVE" ? (broadcast.title || "CHERRY NETWORK RADIO") : "—"}
          </div>
          <div style={{ fontSize: "10px", color: "#667788" }}>
            {broadcast.status === "LIVE" ? "LIVE FROM SRM CAMPUS" : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: "13px", color: "#aabbcc" }}>
            {broadcast.status === "LIVE" ? uptime : "00:00:00"}
          </div>
          <div style={{ fontSize: "10px", color: broadcast.status === "LIVE" ? "#ff4444" : "#445566", fontWeight: 700 }}>
            {broadcast.status === "LIVE" ? "/ LIVE" : "/ OFFLINE"}
          </div>
        </div>
      </div>

      {/* Transport controls */}
      <div className="wmp-controls">
        <button className="wmp-ctrl-btn" title="Previous">⏮</button>
        <button className="wmp-ctrl-btn" title="Rewind">⏪</button>
        <button className="wmp-ctrl-btn play" title="Play/Pause">
          {broadcast.status === "LIVE" ? "⏸" : "▶"}
        </button>
        <button className="wmp-ctrl-btn" title="Forward">⏩</button>
        <button className="wmp-ctrl-btn" title="Next">⏭</button>

        {/* Volume slider */}
        <div style={{ marginLeft: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: "#8899aa" }}>🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="75"
            style={{ width: "80px", accentColor: "#3090e0" }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useBroadcastState } from "@/context/BroadcastContext";

export default function SystemStatusGadget() {
  const { broadcast } = useBroadcastState();
  const [uptime, setUptime] = useState("00:00:00");
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (broadcast.status !== "LIVE" || !broadcast.startedAt) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(broadcast.startedAt!).getTime()) / 1000);
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

  if (closed || !mounted) return null;

  return (
    <Rnd
      default={{
        x: typeof window !== "undefined" ? window.innerWidth - 240 : 800,
        y: 60,
        width: 210,
        height: 220,
      }}
      enableResizing={false}
      bounds="parent"
      style={{ zIndex: 9000 }}
      dragHandleClassName="gadget-drag-handle"
    >
      <div className="system-gadget" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          className="gadget-drag-handle"
          style={{
            height: "28px",
            background: "linear-gradient(to bottom, rgba(60,90,140,0.6), rgba(30,50,90,0.6))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 10px",
            cursor: "grab",
            borderBottom: "1px solid rgba(80,120,180,0.3)",
          }}
        >
          <div style={{ fontSize: "10px", color: "#8899bb", letterSpacing: "1px", fontWeight: 600 }}>System Status</div>
          <button
            onClick={() => setClosed(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#8899bb",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: "1",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
          {/* Big LIVE / OFFLINE text */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "36px",
              fontWeight: "bold",
              letterSpacing: "4px",
              color: broadcast.status === "LIVE" ? "#ff3333" : "#334455",
              textShadow: broadcast.status === "LIVE"
                ? "0 0 20px rgba(255,50,50,0.5), 0 0 40px rgba(255,50,50,0.2)"
                : "none",
              lineHeight: 1,
            }}>
              {broadcast.status === "LIVE" ? "LIVE" : "OFF"}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#667788", letterSpacing: "1px" }}>BROADCAST STATUS</span>
              <span style={{
                color: broadcast.status === "LIVE" ? "#44cc44" : "#556677",
                fontWeight: 600,
              }}>
                {broadcast.status === "LIVE" ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#667788", letterSpacing: "1px" }}>VIEWERS</span>
              <span style={{
                color: broadcast.status === "LIVE" ? "#44bbff" : "#556677",
                fontWeight: 600,
                fontFamily: '"Courier New", monospace',
              }}>
                {broadcast.status === "LIVE"
                  ? (broadcast.watchingHere >= 1000
                    ? `${(broadcast.watchingHere / 1000).toFixed(1)}K`
                    : broadcast.watchingHere || "—")
                  : "—"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#667788", letterSpacing: "1px" }}>UPTIME</span>
              <span style={{
                color: broadcast.status === "LIVE" ? "#44bbff" : "#556677",
                fontWeight: 600,
                fontFamily: '"Courier New", monospace',
              }}>
                {broadcast.status === "LIVE" ? uptime : "--:--:--"}
              </span>
            </div>
          </div>

          {/* Cherry logo */}
          <div style={{ textAlign: "center", marginTop: "auto" }}>
            <span style={{ fontSize: "24px" }}>🍒</span>
          </div>
        </div>
      </div>
    </Rnd>
  );
}

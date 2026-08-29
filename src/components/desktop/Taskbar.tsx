"use client";

import React, { useState, useEffect } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import { useBroadcastState } from "@/context/BroadcastContext";
import StartMenu from "./StartMenu";

export default function Taskbar() {
  const { windows, focusWindow, minimizeWindow } = useWindowManager();
  const { broadcast } = useBroadcastState();
  const [showStart, setShowStart] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }));
    };
    update();
    const int = setInterval(update, 1000);
    return () => clearInterval(int);
  }, []);

  const maxZIndex = windows.length > 0 ? Math.max(...windows.map((w) => w.zIndex)) : -1;

  const handleAppClick = (id: string, isMinimized: boolean, zIndex: number) => {
    if (isMinimized) {
      focusWindow(id);
    } else if (zIndex === maxZIndex) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <>
      <div className="win7-taskbar">
        {/* Start Button */}
        <button
          className="win7-start-btn"
          onClick={() => setShowStart(!showStart)}
          title="Start"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="1" fill="#f25022" />
            <rect x="11" y="1" width="8" height="8" rx="1" fill="#7fba00" />
            <rect x="1" y="11" width="8" height="8" rx="1" fill="#00a4ef" />
            <rect x="11" y="11" width="8" height="8" rx="1" fill="#ffb900" />
          </svg>
        </button>

        {/* Pinned / Active apps */}
        <div style={{ display: "flex", gap: "2px", flex: 1, overflow: "hidden" }}>
          {windows.map((w) => (
            <button
              key={w.id}
              className={`taskbar-app-btn ${w.zIndex === maxZIndex && !w.isMinimized ? "active" : ""}`}
              onClick={() => handleAppClick(w.id, w.isMinimized, w.zIndex)}
              title={w.title}
            >
              <span style={{ fontSize: "14px" }}>
                {w.appId === "media-player" ? "🎵" :
                 w.appId === "retro-deck" ? "🎛️" :
                 w.appId === "file-explorer" ? "📁" :
                 w.appId === "notepad" ? "📝" :
                 w.appId === "recycle-bin" ? "🗑️" : "📄"}
              </span>
              <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "11px",
              }}>
                {w.title}
              </span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="sys-tray">
          {broadcast.status === "LIVE" && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#ff4444",
              fontWeight: "bold",
              fontSize: "10px",
            }}>
              <span className="live-pulse">●</span> LIVE
            </div>
          )}
          <span style={{ fontSize: "13px", opacity: 0.7 }}>🔊</span>
          <span style={{ fontSize: "13px", opacity: 0.7 }}>📶</span>
          <div style={{ textAlign: "right", lineHeight: 1.3 }}>
            <div style={{ fontSize: "11px" }}>{time}</div>
            <div style={{ fontSize: "10px", opacity: 0.7 }}>{date}</div>
          </div>
        </div>
      </div>

      {showStart && <StartMenu onClose={() => setShowStart(false)} />}
    </>
  );
}

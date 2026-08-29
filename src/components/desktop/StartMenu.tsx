"use client";

import React, { useRef, useEffect } from "react";
import { useWindowManager, WindowInstance } from "@/context/WindowManagerContext";

export default function StartMenu({ onClose }: { onClose: () => void }) {
  const { openWindow } = useWindowManager();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest(".win7-start-btn")) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const launch = (appId: string, options: Partial<WindowInstance> = {}) => {
    openWindow(appId, options);
    onClose();
  };

  return (
    <div ref={menuRef} className="win7-start-menu">
      {/* Left Panel — Programs */}
      <div className="start-menu-left">
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #ddd", marginBottom: "4px" }}>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "#222" }}>MONTHLY.LIVE</div>
          <div style={{ fontSize: "10px", color: "#888" }}>one room. one signal.</div>
        </div>

        <button className="start-menu-item left-item" onClick={() => launch("media-player", { title: "Windows Media Player", id: "media-player" })}>
          <span style={{ fontSize: "20px" }}>🎵</span>
          <div>
            <div style={{ fontWeight: 600 }}>Windows Media Player</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Watch the live stream</div>
          </div>
        </button>

        <button className="start-menu-item left-item" onClick={() => launch("retro-deck", { title: "Retro Deck", id: "retro-deck", size: { width: 700, height: 590 } })}>
          <span style={{ fontSize: "20px" }}>🎛️</span>
          <div>
            <div style={{ fontWeight: 600 }}>Retro Deck</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Webamp player with selectable skins</div>
          </div>
        </button>

        <button className="start-menu-item left-item" onClick={() => launch("file-explorer", { title: "Cherry Network", props: { folderId: "cherry" } })}>
          <span style={{ fontSize: "20px" }}>🍒</span>
          <div>
            <div style={{ fontWeight: 600 }}>Cherry Network</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Browse the network</div>
          </div>
        </button>

        <button className="start-menu-item left-item" onClick={() => launch("notepad", { title: "Notepad" })}>
          <span style={{ fontSize: "20px" }}>📝</span>
          <div>
            <div style={{ fontWeight: 600 }}>Notepad</div>
          </div>
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: "1px solid #ddd", padding: "6px 16px", fontSize: "11px", color: "#888" }}>
          All Programs ▸
        </div>
      </div>

      {/* Right Panel — Folders */}
      <div className="start-menu-right">
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Computer", props: { folderId: "root" } })}>
          <span style={{ fontSize: "16px" }}>🖥️</span> Computer
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Documents", props: { folderId: "cherry" } })}>
          <span style={{ fontSize: "16px" }}>📄</span> Documents
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Pictures", props: { folderId: "gallery" } })}>
          <span style={{ fontSize: "16px" }}>🖼️</span> Pictures
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Music", props: { folderId: "cherry" } })}>
          <span style={{ fontSize: "16px" }}>🎵</span> Music
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Events", props: { folderId: "events" } })}>
          <span style={{ fontSize: "16px" }}>📅</span> Events
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "6px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#c0c8d0" }}>
          <span>🔒</span> Log off
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

const DESKTOP_THRESHOLD = 900;

export default function ResizePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      setVisible(window.innerWidth < DESKTOP_THRESHOLD);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "340px",
          textAlign: "center",
        }}
      >
        {/* Landscape icon */}
        <div style={{ marginBottom: "24px" }}>
          <svg width="64" height="44" viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="60" height="40" rx="4" stroke="#555" strokeWidth="2" />
            <rect x="8" y="8" width="48" height="28" rx="2" fill="#1a1a2e" />
            <path d="M24 18 L28 22 L24 26" stroke="#666" strokeWidth="1.5" fill="none" />
            <path d="M40 18 L36 22 L40 26" stroke="#666" strokeWidth="1.5" fill="none" />
            <rect x="26" y="38" width="12" height="2" rx="1" fill="#444" />
          </svg>
        </div>

        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "14px",
            color: "#888",
            marginBottom: "12px",
            letterSpacing: "2px",
            fontWeight: "bold",
          }}
        >
          DESKTOP VIEW
        </div>

        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            color: "#555",
            lineHeight: "1.8",
            marginBottom: "24px",
          }}
        >
          <div>This experience is designed for</div>
          <div style={{ color: "#888" }}>landscape / fullscreen viewing.</div>
          <div style={{ marginTop: "8px" }}>Please rotate your device or</div>
          <div>open in a desktop browser.</div>
        </div>

        <button
          onClick={() => {
            // Try to lock to landscape
            try { (screen.orientation as { lock?: (o: string) => Promise<void> }).lock?.("landscape"); } catch { /* ignore */ }
          }}
          style={{
            background: "transparent",
            border: "1px solid #444",
            color: "#888",
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            padding: "8px 24px",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cc0000";
            e.currentTarget.style.color = "#cc0000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#444";
            e.currentTarget.style.color = "#888";
          }}
        >
          ROTATE DEVICE
        </button>
      </div>
    </div>
  );
}

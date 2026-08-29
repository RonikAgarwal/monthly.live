"use client";

import React from "react";
import { WindowInstance } from "@/context/WindowManagerContext";

export default function NotepadApp({ windowInstance }: { windowInstance: WindowInstance }) {
  const content = (windowInstance.props?.content as string) || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff" }}>
      {/* Menu bar */}
      <div style={{
        display: "flex",
        gap: "0",
        borderBottom: "1px solid #d0d0d0",
        background: "#f0f0f0",
        fontSize: "12px",
        flexShrink: 0,
      }}>
        {["File", "Edit", "Format", "View", "Help"].map((item) => (
          <button
            key={item}
            style={{
              padding: "3px 10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              color: "#222",
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: '"Lucida Console", "Courier New", monospace',
          fontSize: "13px",
          padding: "8px",
          width: "100%",
          lineHeight: 1.6,
          color: "#000",
          background: "#fff",
        }}
        readOnly
        defaultValue={content}
      />
    </div>
  );
}

"use client";
import React from "react";
import { WindowInstance } from "@/context/WindowManagerContext";

export default function RecycleBinApp({ windowInstance }: { windowInstance: WindowInstance }) {
  return (
    <div style={{ padding: "20px", fontFamily: '"Courier New", monospace', fontSize: "12px", background: "#fff", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px", border: "1px dotted #ccc" }}>
        <div style={{ fontSize: "24px" }}>📄</div>
        <div>secrets.txt</div>
        <div style={{ color: "#888" }}>"we are always watching."</div>
      </div>
    </div>
  );
}

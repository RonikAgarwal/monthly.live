"use client";
import React from "react";
import { WindowInstance } from "@/context/WindowManagerContext";
import AssetIcon from "../ui/AssetIcon";

export default function RecycleBinApp({ windowInstance: _windowInstance }: { windowInstance: WindowInstance }) {
  void _windowInstance;
  return (
    <div style={{ padding: "20px", fontFamily: '"Courier New", monospace', fontSize: "12px", background: "#fff", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px", border: "1px dotted #ccc" }}>
        <AssetIcon name="textFile" size={24} alt="" />
        <div>secrets.txt</div>
        <div style={{ color: "#888" }}>&quot;we are always watching.&quot;</div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useBroadcastState } from "@/context/BroadcastContext";
import AssetIcon from "../ui/AssetIcon";

export default function NotificationToast() {
  const { broadcast } = useBroadcastState();
  const [show, setShow] = useState(false);
  const prevStatusRef = useRef(broadcast.status);

  useEffect(() => {
    if (prevStatusRef.current === "OFFLINE" && broadcast.status === "LIVE") {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = broadcast.status;
  }, [broadcast.status]);

  if (!show) return null;

  return (
    <div className="win7-toast">
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #cc0000, #880000)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        flexShrink: 0,
      }}>
        <AssetIcon name="cherry" size={26} alt="" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px" }}>MONTHLY.LIVE</div>
        <div style={{ fontSize: "11px", color: "#b0c0d8", lineHeight: 1.4 }}>
          We are LIVE right now!<br />
          Tap in and vibe with us.
        </div>
      </div>
      <button
        onClick={() => setShow(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "#8899bb",
          cursor: "pointer",
          fontSize: "16px",
          alignSelf: "flex-start",
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

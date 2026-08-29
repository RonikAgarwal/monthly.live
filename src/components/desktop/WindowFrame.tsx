"use client";

import React, { useRef, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { useWindowManager, WindowInstance } from "@/context/WindowManagerContext";

interface WindowFrameProps {
  windowInstance: WindowInstance;
  children: React.ReactNode;
}

export default function WindowFrame({ windowInstance, children }: WindowFrameProps) {
  const { id, title, position, size, zIndex, isMinimized, isMaximized, isResizable } = windowInstance;
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } = useWindowManager();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMinimized) return null;

  const handleDragStop = (_e: any, d: any) => moveWindow(id, { x: d.x, y: d.y });
  const handleResizeStop = (_e: any, _dir: any, ref: any, _delta: any, pos: any) => {
    resizeWindow(id, { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
    moveWindow(id, pos);
  };

  const currentSize = isMaximized || isMobile ? { width: "100%" as any, height: "calc(100% - 40px)" as any } : size;
  const currentPosition = isMaximized || isMobile ? { x: 0, y: 0 } : position;

  return (
    <Rnd
      size={currentSize}
      position={currentPosition}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={isMaximized || isMobile}
      enableResizing={isResizable && !isMaximized && !isMobile}
      minWidth={350}
      minHeight={250}
      bounds="parent"
      style={{
        zIndex,
        display: "flex",
        flexDirection: "column",
        position: isMaximized || isMobile ? "fixed" : "absolute",
      }}
      onMouseDown={() => focusWindow(id)}
      dragHandleClassName="win7-title-bar"
    >
      <div className="win7-window" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f0f0f0" }}>
        {/* Title bar */}
        <div
          className="win7-title-bar"
          style={{
            height: "30px",
            background: "linear-gradient(to bottom, rgba(60,100,160,0.95), rgba(35,70,120,0.95))",
            borderBottom: "1px solid rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            padding: "0 6px",
            cursor: "grab",
            borderRadius: "6px 6px 0 0",
            backdropFilter: "blur(8px)",
            flexShrink: 0,
          }}
          onDoubleClick={() => toggleMaximize(id)}
        >
          <div style={{
            flex: 1,
            color: "#fff",
            fontSize: "12px",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            paddingLeft: "4px",
            fontWeight: 400,
          }}>
            {title}
          </div>

          <div style={{ display: "flex", gap: "2px" }}>
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
              style={{
                width: "26px", height: "18px", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "2px", background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                color: "#fff", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0,
              }}
              title="Minimize"
            >
              ─
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
              style={{
                width: "26px", height: "18px", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "2px", background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                color: "#fff", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0,
              }}
              title="Maximize"
            >
              □
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
              style={{
                width: "26px", height: "18px", border: "1px solid rgba(200,50,50,0.5)",
                borderRadius: "2px", background: "linear-gradient(to bottom, #e04040, #c02020)",
                color: "#fff", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0,
              }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Window body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </Rnd>
  );
}

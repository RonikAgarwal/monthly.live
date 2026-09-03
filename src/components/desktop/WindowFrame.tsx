"use client";

import React, { useEffect, useState } from "react";
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
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);
  const [localSize, setLocalSize] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clear local overrides when context state changes (e.g. cascaded, restored)
  useEffect(() => {
    setLocalPos(null);
    setLocalSize(null);
  }, [position, size]);

  if (isMinimized) return null;

  const handleDragStart = () => {
    setIsDragging(true);
    focusWindow(id);
  };
  
  const handleDrag = (_e: unknown, d: { x: number; y: number }) => {
    setLocalPos({ x: d.x, y: d.y });
  };

  const handleDragStop = (_e: unknown, d: { x: number; y: number }) => {
    setIsDragging(false);
    moveWindow(id, { x: d.x, y: d.y });
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    focusWindow(id);
  };

  const handleResize = (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, pos: { x: number; y: number }) => {
    setLocalSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
    setLocalPos(pos);
  };

  const handleResizeStop = (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, pos: { x: number; y: number }) => {
    setIsResizing(false);
    resizeWindow(id, { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
    moveWindow(id, pos);
  };

  const currentSize = isMaximized || isMobile ? { width: "100%", height: "calc(100% - 40px)" } : (localSize || size);
  const currentPosition = isMaximized || isMobile ? { x: 0, y: 0 } : (localPos || position);

  return (
    <Rnd
      size={currentSize}
      position={currentPosition}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      disableDragging={isMaximized || isMobile}
      enableResizing={isResizable && !isMaximized && !isMobile}
      minWidth={350}
      minHeight={250}
      bounds=".desktop-windows-container"
      style={{
        zIndex,
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
      }}
      onMouseDown={() => focusWindow(id)}
      dragHandleClassName="title-bar"
    >
      <div className={`window glass active win7-window`} style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
        <div
          className="title-bar"
          onDoubleClick={() => toggleMaximize(id)}
        >
          <div className="title-bar-text">
            {title}
          </div>

          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }} />
            <button aria-label="Maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} />
            <button aria-label="Close" onClick={(e) => { e.stopPropagation(); closeWindow(id); }} />
          </div>
        </div>

        <div className="window-body win7-window-body" style={{ position: "relative" }}>
          {children}
          {(isDragging || isResizing) && (
            <div style={{ position: "absolute", inset: 0, zIndex: 9999, cursor: isDragging ? "grabbing" : "nwse-resize" }} />
          )}
        </div>
      </div>
    </Rnd>
  );
}

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  // Use refs for drag/resize position to avoid re-renders on every frame
  const posRef = useRef(position);
  const sizeRef = useRef(size);
  const [renderPos, setRenderPos] = useState(position);
  const [renderSize, setRenderSize] = useState(size);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync render position when context position changes (e.g. window restored)
  useEffect(() => {
    posRef.current = position;
    setRenderPos(position);
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
    setRenderSize(size);
  }, [size]);

  if (isMinimized) return null;

  const handleDragStart = () => {
    document.body.classList.add("rnd-dragging");
    focusWindow(id);
  };

  const handleDrag = (_e: unknown, d: { x: number; y: number }) => {
    posRef.current = { x: d.x, y: d.y };
    setRenderPos({ x: d.x, y: d.y });
  };

  const handleDragStop = (_e: unknown, d: { x: number; y: number }) => {
    document.body.classList.remove("rnd-dragging");
    const finalPos = { x: d.x, y: d.y };
    posRef.current = finalPos;
    setRenderPos(finalPos);
    moveWindow(id, finalPos);
  };

  const handleResizeStart = () => {
    document.body.classList.add("rnd-resizing");
    focusWindow(id);
  };

  const handleResize = (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, pos: { x: number; y: number }) => {
    const newSize = { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) };
    sizeRef.current = newSize;
    posRef.current = pos;
    setRenderSize(newSize);
    setRenderPos(pos);
  };

  const handleResizeStop = (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, pos: { x: number; y: number }) => {
    document.body.classList.remove("rnd-resizing");
    const finalSize = { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) };
    const finalPos = pos;
    sizeRef.current = finalSize;
    posRef.current = finalPos;
    setRenderSize(finalSize);
    setRenderPos(finalPos);
    resizeWindow(id, finalSize);
    moveWindow(id, finalPos);
  };

  const currentSize = isMaximized || isMobile ? { width: "100%", height: "calc(100% - 40px)" } : renderSize;
  const currentPosition = isMaximized || isMobile ? { x: 0, y: 0 } : renderPos;

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
            {/* [REVERT] New custom SVG buttons — uncomment to restore:
            <button className="wcb-btn wcb-minimize" aria-label="Minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}>
              <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>
            </button>
            <button className="wcb-btn wcb-maximize" aria-label="Maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}>
              <svg width="9" height="9" viewBox="0 0 9 9"><rect x="0.5" y="0.5" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
            </button>
            <button className="wcb-btn wcb-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); closeWindow(id); }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2"/></svg>
            </button>
            */}
            <button aria-label="Minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }} />
            <button aria-label="Maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} />
            <button aria-label="Close" onClick={(e) => { e.stopPropagation(); closeWindow(id); }} />
          </div>
        </div>

        <div className="window-body win7-window-body" style={{ position: "relative" }}>
          {children}
        </div>
      </div>
    </Rnd>
  );
}

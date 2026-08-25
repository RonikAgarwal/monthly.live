"use client";

import { useEffect, useState } from "react";

export default function Transition({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"line" | "expand" | "static" | "done">("line");

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: horizontal line appears
    timers.push(setTimeout(() => setPhase("expand"), 100));

    // Phase 2: expands to full screen
    timers.push(setTimeout(() => setPhase("static"), 300));

    // Phase 3: brief static
    timers.push(setTimeout(() => setPhase("done"), 600));

    // Phase 4: done
    timers.push(setTimeout(() => onComplete(), 800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {phase === "line" && (
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #fff, transparent)",
            boxShadow: "0 0 20px rgba(255,255,255,0.3)",
          }}
        />
      )}

      {phase === "expand" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#fff",
            animation: "none",
            opacity: 0.1,
            transform: "scaleY(0.02)",
          }}
        />
      )}

      {phase === "static" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent 2px
              )
            `,
          }}
        >
          {/* Random static dots */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

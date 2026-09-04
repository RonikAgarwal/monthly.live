"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const ERROR_MESSAGES = [
  "no",
  "wrong signal",
  "access denied",
  ".",
  "denied",
  "null",
  "信号错误",
  "try again",
  "■",
];

export default function PasswordGate({ onComplete }: { onComplete: () => void }) {
  const { authenticate } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // A kicked mobile visitor is flagged in sessionStorage by the auth poller
  const [kicked, setKicked] = useState(() => {
    try {
      return sessionStorage.getItem("monthly:gate-kicked") === "1";
    } catch {
      return false;
    }
  });
  const [phase, setPhase] = useState<"input" | "checking" | "connecting" | "done">("input");
  const [statusText, setStatusText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      sessionStorage.removeItem("monthly:gate-kicked");
    } catch {
      // Ignore storage failures
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setPhase("checking");
    setStatusText("checking...");

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const success = await authenticate(password);

    if (!success) {
      setPhase("input");
      setError(ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]);
      setPassword("");
      inputRef.current?.focus();
      return;
    }

    setPhase("connecting");
    setStatusText("connecting...");

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
    setStatusText("...");

    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

    setPhase("done");
    onComplete();
  };

  if (phase === "checking" || phase === "connecting") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "13px",
            color: "#666",
            textAlign: "center",
          }}
        >
          <span style={{ animation: "blink 1s step-end infinite" }}>{statusText}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
        padding:
          "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
      }}
    >
      {/* Subtle noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        }}
      />

      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "12px",
            color: "#555",
            marginBottom: "8px",
            letterSpacing: "2px",
          }}
        >
          password:
        </div>

        {kicked && (
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "10px",
              color: "#FFFD99",
              letterSpacing: "1px",
              marginBottom: "10px",
              maxWidth: "220px",
              lineHeight: "1.5",
            }}
          >
            session expired — enter the current password to continue
          </div>
        )}

        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setKicked(false);
            }}
            style={{
              width: "200px",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #333",
              color: "#888",
              fontFamily: '"Courier New", monospace',
              // 16px minimum so iOS Safari doesn't auto-zoom when focused
              fontSize: "16px",
              padding: "4px 0",
              outline: "none",
              letterSpacing: "3px",
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          style={{
            background: "transparent",
            border: "1px solid #333",
            color: "#555",
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            padding: "3px 16px",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "lowercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cc0000";
            e.currentTarget.style.color = "#cc0000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#333";
            e.currentTarget.style.color = "#555";
          }}
        >
          enter
        </button>

        {error && (
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "11px",
              color: "#cc0000",
              marginTop: "12px",
              opacity: 0.8,
              letterSpacing: "1px",
            }}
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

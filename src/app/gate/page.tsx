"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

const BOOT_LINES = [
  "CHERRY+ NETWORK OS v3.2.1",
  "BIOS POST... OK",
  "Memory check: 256MB... OK",
  "Initializing display adapter...",
  "Loading kernel modules...",
  "Mounting file system...",
  "Starting network services...",
  "Authenticating user session...",
  "Loading desktop environment...",
  "System ready.",
];

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"input" | "checking" | "connecting" | "booting" | "done">("input");
  const [statusText, setStatusText] = useState("");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootLineIndex, setBootLineIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Boot sequence animation
  useEffect(() => {
    if (phase !== "booting") return;

    // Show logo first
    setShowLogo(true);

    // Start boot lines after logo appears
    const logoDelay = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < BOOT_LINES.length) {
          setBootLines((prev) => [...prev, BOOT_LINES[idx]]);
          setBootLineIndex(idx);
          idx++;
        } else {
          clearInterval(interval);
          // After all lines, navigate to desktop
          setTimeout(() => setPhase("done"), 600);
        }
      }, 200 + Math.random() * 150);

      return () => clearInterval(interval);
    }, 1200);

    return () => clearTimeout(logoDelay);
  }, [phase]);

  // Navigate when done
  useEffect(() => {
    if (phase === "done") {
      router.push("/");
    }
  }, [phase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setPhase("checking");
    setStatusText("checking...");

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Invalid password");
      }

      setPhase("connecting");
      setStatusText("connecting...");

      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
      setStatusText("...");

      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

      // Start boot sequence
      setPhase("booting");
    } catch {
      setPhase("input");
      setError(ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  // Boot screen
  if (phase === "booting") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          overflow: "hidden",
        }}
      >
        {/* Scanline overlay */}
        <div className="boot-scanlines" />

        {/* Logo */}
        <div
          className={`boot-logo ${showLogo ? "boot-logo-visible" : ""}`}
          style={{
            width: "min(80vw, 500px)",
            marginBottom: "40px",
          }}
        >
          <img
            src="/assets/icons/cherry-plus-logo.svg"
            alt="Cherry+ Network"
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        {/* Boot text console */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "40px",
            right: "40px",
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            color: "#0f0",
            lineHeight: "1.6",
            opacity: showLogo ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {bootLines.map((line, i) => (
            <div key={i} className="boot-line" style={{ animationDelay: `${i * 0.05}s` }}>
              <span style={{ color: "#0a0" }}>{"> "}</span>
              {line}
            </div>
          ))}
          {bootLines.length < BOOT_LINES.length && (
            <span className="boot-cursor" style={{ color: "#0f0" }}>
              █
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "40px",
            right: "40px",
            height: "2px",
            background: "#111",
            opacity: showLogo ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <div
            className="boot-progress"
            style={{
              height: "100%",
              background: "#0f0",
              width: `${(bootLines.length / BOOT_LINES.length) * 100}%`,
              boxShadow: "0 0 8px #0f0",
            }}
          />
        </div>
      </div>
    );
  }

  // Checking / connecting screen
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
        padding: "20px",
      }}
    >
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

        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            style={{
              width: "200px",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #333",
              color: "#888",
              fontFamily: '"Courier New", monospace',
              fontSize: "13px",
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

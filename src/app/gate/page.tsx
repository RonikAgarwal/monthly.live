"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { writeGateSessionGeneration } from "@/lib/gateSession";

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

const TAGLINE = "presents MONTHLY.LIVE - first live DJ stream, on-campus experience";

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showDenied, setShowDenied] = useState(false);
  const [phase, setPhase] = useState<"input" | "checking" | "connecting" | "booting" | "done">("input");
  // [REVERT] New simplified phase:
  // const [phase, setPhase] = useState<"input" | "checking" | "connecting" | "done">("input");
  const [statusText, setStatusText] = useState("");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [typedChars, setTypedChars] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gateMode, setGateMode] = useState<"open" | "locked" | null>(null);
  // A kicked visitor arrives at /gate?expired=1
  const [kicked, setKicked] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("expired")
  );
  // The logo is visible whenever the boot screen is showing (kept through
  // "done" so nothing flashes away before the fade overlay covers the swap)
  const showLogo = phase === "booting" || phase === "done";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clean the ?expired=1 flag out of the URL so a refresh doesn't repeat it
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("expired")) {
      window.history.replaceState(null, "", "/gate");
    }
  }, []);

  // Ask the backend whether the site is open or password locked.
  // When open, skip the password form and boot straight through.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gate", { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data?.mode === "open") {
          setBootLines([]);
          setTypedChars(0);
          setProgress(0);
          setPhase("booting");
        } else {
          setGateMode("locked");
        }
      } catch {
        if (!cancelled) setGateMode("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Boot sequence animation — one requestAnimationFrame timeline drives the
  // console lines, the tagline typing, and the progress bar together, so the
  // bar flows continuously and letters stream in one-by-one instead of
  // jumping in steps. (CSS transitions are globally disabled in this project,
  // so per-frame updates are what make this smooth.)
  useEffect(() => {
    if (phase !== "booting") return;

    const LINE_MS = 480; // one console line every 480ms
    const HOLD_MS = 800; // pause on "System ready." before navigating
    const TOTAL_MS = BOOT_LINES.length * LINE_MS;
    let raf = 0;
    let start = 0;

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const elapsed = now - start;

      // Console lines at a steady cadence (no random jitter)
      const lineCount = Math.min(BOOT_LINES.length, Math.floor(elapsed / LINE_MS) + 1);
      setBootLines((prev) =>
        prev.length === lineCount ? prev : BOOT_LINES.slice(0, lineCount)
      );

      // Tagline + progress bar: continuous, eased, and in sync
      const eased = easeInOut(Math.min(1, elapsed / TOTAL_MS));
      setProgress(Math.min(100, Math.round(eased * 100)));
      setTypedChars(Math.min(TAGLINE.length, Math.floor(eased * TAGLINE.length)));

      if (elapsed < TOTAL_MS + HOLD_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTypedChars(TAGLINE.length);
        setPhase("done");
      }
    };

    // Start the timeline after the logo has had a moment to appear
    const logoDelay = setTimeout(() => {
      start = performance.now();
      raf = requestAnimationFrame(tick);
    }, 1400);

    return () => {
      clearTimeout(logoDelay);
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  // Navigate when done — silently sign in first when the site is open
  useEffect(() => {
    if (phase !== "done") return;
    let cancelled = false;
    (async () => {
      try {
        // Open-mode boot never entered a password, so silently sign in now.
        if (gateMode !== "locked") {
          const res = await fetch("/api/gate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: "" }),
          });
          if (!res.ok) throw new Error("Open sign-in failed");
          const data = await res.json();
          writeGateSessionGeneration(typeof data?.generation === "number" ? data.generation : null);
        }
        if (cancelled) return;
        // Raise the fade overlay first so the swap to the desktop is hidden,
        // then navigate once the overlay has painted.
        window.dispatchEvent(new CustomEvent("cherry:fade-from-boot"));
        await new Promise((r) => setTimeout(r, 140));
        if (!cancelled) router.push("/");
      } catch {
        if (!cancelled) router.replace("/gate");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, router, gateMode]);

  // [REVERT] New simplified navigation (uncomment this, comment out the useEffect above):
  // const handleSubmit = async (e: React.FormEvent) => {
  //   ...
  //   setPhase("done");
  //   router.push("/");
  //   ...
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setShowDenied(false);
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

      // Remember which session generation this login belongs to, so stale
      // sessions can be detected after the password changes.
      const data = await res.json();
      writeGateSessionGeneration(typeof data?.generation === "number" ? data.generation : null);

      setPhase("connecting");
      setStatusText("connecting...");

      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
      setStatusText("...");

      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

      // Start boot sequence (fresh animation state)
      setBootLines([]);
      setTypedChars(0);
      setProgress(0);
      setPhase("booting");
    } catch {
      setPhase("input");
      setPassword("");
      setShowDenied(true);
    }
  };

  // Waiting on gate config from the backend (before it resolves to locked/open)
  if (gateMode === null && phase === "input") {
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
        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "13px",
            color: "#333",
          }}
        >
          ...
        </span>
      </div>
    );
  }

  // Boot screen — also stays visible while the silent open sign-in finishes
  // after the lines complete (phase "done"), so the password form never flashes.
  if (phase === "booting" || phase === "done") {
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
            textAlign: "center",
          }}
        >
          <img
            src="/assets/icons/cherry-plus-logo.svg"
            alt="Cherry+ Network"
            style={{ width: "100%", height: "auto" }}
          />

          {/* Tagline — typed out letter-by-letter as the progress bar fills */}
          <div
            style={{
              marginTop: "14px",
              fontFamily: '"Courier New", monospace',
              fontSize: "11px",
              letterSpacing: "2px",
              color: "#FC0162",
              textShadow: "0 0 8px rgba(252,1,98,0.55), 0 0 20px rgba(252,1,98,0.25)",
              textAlign: "center",
              minHeight: "18px",
              lineHeight: "1.6",
              opacity: showLogo ? 1 : 0,
              transition: "opacity 0.8s ease 0.5s",
            }}
          >
            {TAGLINE.slice(0, typedChars)}
            {typedChars < TAGLINE.length && (
              <span className="boot-cursor" style={{ color: "#FC0162" }}>█</span>
            )}
          </div>
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
            color: "#FFFD99",
            lineHeight: "1.6",
            opacity: showLogo ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {bootLines.map((line, i) => (
            <div key={i} className="boot-line" style={{ animationDelay: `${i * 0.05}s` }}>
              <span style={{ color: "#999900" }}>{"> "}</span>
              {line}
            </div>
          ))}
          {bootLines.length < BOOT_LINES.length && (
            <span className="boot-cursor" style={{ color: "#FFFD99" }}>
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
              background: "#FFFD99",
              width: `${progress}%`,
              boxShadow: "0 0 8px #FFFD99",
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
        padding:
          "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
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
      </form>

      {showDenied && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Access denied"
          onClick={() => {
            setShowDenied(false);
            inputRef.current?.focus();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(90vw, 420px)",
              background: "#0a0505",
              border: "1px solid #cc0000",
              boxShadow: "0 0 24px rgba(204, 0, 0, 0.35), inset 0 0 18px rgba(204, 0, 0, 0.07)",
              padding: "26px 24px 20px",
              textAlign: "center",
              cursor: "default",
            }}
          >
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "4px",
                color: "#cc0000",
                textShadow: "0 0 12px rgba(204, 0, 0, 0.6)",
              }}
            >
              ACCESS DENIED
            </div>
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                marginTop: "16px",
                fontSize: "13px",
                letterSpacing: "2px",
                color: "#FFFD99",
              }}
            >
              DJ IS LIVE<span className="boot-cursor">_</span>
            </div>
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                marginTop: "10px",
                fontSize: "11px",
                lineHeight: "1.7",
                color: "#888",
              }}
            >
              wrong password — the correct one is on the story ·{" "}
              <a
                href="https://instagram.com/cherry.network"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#cc5555" }}
              >
                instagram @cherry.network
              </a>
            </div>
            <button
              autoFocus
              type="button"
              onClick={() => {
                setShowDenied(false);
                inputRef.current?.focus();
              }}
              style={{
                marginTop: "20px",
                background: "transparent",
                border: "1px solid #cc0000",
                color: "#cc5555",
                fontFamily: '"Courier New", monospace',
                fontSize: "11px",
                padding: "3px 24px",
                cursor: "pointer",
                letterSpacing: "2px",
                textTransform: "lowercase",
              }}
            >
              ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

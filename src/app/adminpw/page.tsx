"use client";

import { useCallback, useEffect, useState } from "react";

type Mode = "open" | "locked";
type Notice = { kind: "ok" | "err"; text: string } | null;

export default function AdminPwPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gate", { method: "GET", cache: "no-store" });
        if (cancelled) return;
        const data = await res.json();
        setMode(data?.mode === "open" ? "open" : "locked");
      } catch {
        if (!cancelled) setMode("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const act = useCallback(
    async (action: "open" | "setPassword", password?: string) => {
      setBusy(true);
      setNotice(null);
      try {
        const res = await fetch("/api/adminpw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, password }),
        });
        const data = await res.json();
        if (res.ok && data?.ok) {
          setMode(data.mode === "open" ? "open" : "locked");
          setNotice({
            kind: "ok",
            text:
              data.mode === "open"
                ? "site is OPEN — visitors boot straight through, no password asked."
                : "site is LOCKED — visitors must enter the new password.",
          });
        } else {
          setNotice({ kind: "err", text: data?.error || "request failed" });
        }
      } catch {
        setNotice({ kind: "err", text: "request failed" });
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const handleKeepOpen = () => act("open");
  const handleLock = () => {
    const password = newPassword.trim();
    if (!password) {
      setNotice({ kind: "err", text: "enter the new password first" });
      return;
    }
    act("setPassword", password).then(() => {
      setNewPassword("");
      setShowPasswordForm(false);
    });
  };

  const mono: React.CSSProperties = { fontFamily: '"Courier New", monospace' };
  const dim = "#777";
  const yellow = "#FFFD99";
  const red = "#cc0000";

  return (
    <div
      className="adminpw-console"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: "#000",
        color: "#888",
        fontFamily: mono.fontFamily,
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
        zIndex: 10000,
        padding:
          "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(28px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
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

      <div style={{ position: "relative", width: "min(92vw, 480px)", margin: "auto" }}>
        <div style={{ letterSpacing: "3px", fontSize: "12px", color: "#999", marginBottom: "6px" }}>
          CHERRY+ NETWORK
        </div>
        <div style={{ letterSpacing: "4px", fontSize: "20px", fontWeight: 700, color: "#e0e0e0", marginBottom: "22px" }}>
          ADMIN
        </div>

        {/* Status line */}
        <div style={{ fontSize: "11px", color: "#999", marginBottom: "26px" }}>
          GATE STATUS:{" "}
          {mode === null ? (
            <span style={{ color: "#666" }}>...</span>
          ) : mode === "open" ? (
            <span style={{ color: yellow }}>OPEN — NO PASSWORD ASKED</span>
          ) : (
            <span style={{ color: red }}>LOCKED — PASSWORD REQUIRED</span>
          )}
        </div>

        {/* Option 1 — keep site open */}          <button
            type="button"
            disabled={busy}
            className="adminpw-option"
            onClick={handleKeepOpen}
            style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            background: "#0a0a0a",
            backgroundImage: "none",
            boxShadow: "none",
            appearance: "none",
            WebkitAppearance: "none",
            WebkitTapHighlightColor: "transparent",
            border: "1px solid #888",
            padding: "14px 16px",
            cursor: busy ? "default" : "pointer",
            color: "#ffffff",
            fontFamily: mono.fontFamily,
            outline: "none",
            opacity: busy ? 0.5 : 1,
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>1 · KEEP THE SITE OPEN</div>
          <div style={{ fontSize: "12px", color: "#d6d6d6", marginTop: "7px", letterSpacing: "0.3px" }}>
            everyone who visits boots straight through — no password asked
          </div>
        </button>

        {/* Option 2 — set a new password */}
        {!showPasswordForm ? (
          <button
            type="button"
            disabled={busy}
            className="adminpw-option"
            onClick={() => setShowPasswordForm(true)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "#0a0a0a",
              backgroundImage: "none",
              boxShadow: "none",
              appearance: "none",
              WebkitAppearance: "none",
              WebkitTapHighlightColor: "transparent",
              border: "1px solid #888",
              padding: "14px 16px",
              cursor: busy ? "default" : "pointer",
              color: "#ffffff",
              fontFamily: mono.fontFamily,
              outline: "none",
              opacity: busy ? 0.5 : 1,
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>2 · SET A PASSWORD</div>
            <div style={{ fontSize: "12px", color: "#d6d6d6", marginTop: "7px", letterSpacing: "0.3px" }}>
              lock the site — visitors must enter the new password
            </div>
          </button>
        ) : (
          <div style={{ border: "1px solid #333", padding: "16px" }}>
            <div style={{ fontSize: "11px", color: dim, marginBottom: "10px", letterSpacing: "1px" }}>
              NEW PASSWORD:
            </div>
            <input
              autoFocus
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLock();
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid #333",
                color: "#bbb",
                fontFamily: mono.fontFamily,
                // 16px minimum so iOS Safari doesn't auto-zoom when focused
                fontSize: "16px",
                padding: "4px 0",
                outline: "none",
                letterSpacing: "2px",
                boxSizing: "border-box",
              }}
              autoComplete="new-password"
              spellCheck={false}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                type="button"
                disabled={busy}
                onClick={handleLock}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid " + red,
                  color: "#dd7777",
                  fontFamily: mono.fontFamily,
                  fontSize: "11px",
                  padding: "6px 0",
                  cursor: busy ? "default" : "pointer",
                  letterSpacing: "2px",
                  textTransform: "lowercase",
                }}
              >
                lock it
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setShowPasswordForm(false);
                  setNewPassword("");
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#666",
                  fontFamily: mono.fontFamily,
                  fontSize: "11px",
                  padding: "6px 14px",
                  cursor: busy ? "default" : "pointer",
                  letterSpacing: "2px",
                  textTransform: "lowercase",
                }}
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div
            style={{
              marginTop: "16px",
              fontSize: "11px",
              lineHeight: "1.6",
              letterSpacing: "0.5px",
              color: notice.kind === "ok" ? yellow : red,
            }}
          >
            {notice.kind === "ok" ? "✓ " : "✗ "}
            {notice.text}
          </div>
        )}

        <div style={{ marginTop: "26px", fontSize: "10px", color: "#666", letterSpacing: "0.5px" }}>
          /adminpw is a secret url — only this control panel lives here. don&apos;t share it.
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { readGateSessionGeneration, writeGateSessionGeneration } from "@/lib/gateSession";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "monthly_live_auth";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const authenticate = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            authenticated: true,
            expiresAt: Date.now() + SESSION_DURATION,
          })
        );
        writeGateSessionGeneration(typeof data?.generation === "number" ? data.generation : null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Restore an existing session; with no session, silently sign in when the
  // site is set to OPEN via /adminpw. isLoading only clears once this settles,
  // so the password screen never flashes for open-site visitors.
  useEffect(() => {
    let cancelled = false;
    const restore = window.setTimeout(async () => {
      let authed = false;
      try {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.authenticated && data.expiresAt > Date.now()) {
            authed = true;
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(AUTH_KEY);
          }
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }

      if (!authed && !cancelled) {
        try {
          const res = await fetch("/api/gate", { method: "GET", cache: "no-store" });
          const data = await res.json();
          if (!cancelled && data?.mode === "open") {
            authed = await authenticate("");
          }
        } catch {
          // Gate state unavailable — fall through to locked behaviour
        }
      }
      if (!cancelled) setIsLoading(false);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(restore);
    };
  }, [authenticate]);

  // Kick stale sessions: when the gate password changes, the session generation
  // bumps, so a signed-in mobile client drops back to the password screen.
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/gate", { method: "GET", cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const stored = readGateSessionGeneration();
        if (data?.mode === "locked" && stored !== null && stored !== Number(data.generation)) {
          setIsAuthenticated(false);
          try {
            localStorage.removeItem(AUTH_KEY);
            sessionStorage.setItem("monthly:gate-kicked", "1");
          } catch {
            // Ignore storage failures
          }
        }
      } catch {
        // Offline or gate unavailable — keep the current view
      }
    };
    check();
    const interval = window.setInterval(check, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

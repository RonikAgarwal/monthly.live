"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

  useEffect(() => {
    const restoreSession = window.setTimeout(() => {
    // Check existing session
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.authenticated && data.expiresAt > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    setIsLoading(false);
    }, 0);
    return () => window.clearTimeout(restoreSession);
  }, []);

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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // When the site is set to OPEN via /adminpw, visitors get in without a password
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gate", { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (cancelled || data?.mode !== "open") return;
        await authenticate("");
      } catch {
        // Leave locked behaviour untouched
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticate]);

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

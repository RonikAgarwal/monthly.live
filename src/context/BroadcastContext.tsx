"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface BroadcastState {
  status: "LIVE" | "OFFLINE";
  startedAt?: string;
  title?: string;
  twitchViewers?: number;
  watchingHere: number;
  channelLogin?: string;
}

interface BroadcastContextType {
  broadcast: BroadcastState;
  refresh: () => Promise<void>;
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export function BroadcastProvider({ children }: { children: ReactNode }) {
  const [broadcast, setBroadcast] = useState<BroadcastState>({
    status: "OFFLINE",
    watchingHere: 0,
  });

  const fetchBroadcast = useCallback(async () => {
    try {
      const res = await fetch("/api/stream");
      if (res.ok) {
        const data = await res.json();
        setBroadcast(data);
      }
    } catch {
      // Keep defaults
    }
  }, []);

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchBroadcast, 0);
    const interval = setInterval(fetchBroadcast, 30_000);
    return () => {
      window.clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchBroadcast]);

  return (
    <BroadcastContext.Provider value={{ broadcast, refresh: fetchBroadcast }}>
      {children}
    </BroadcastContext.Provider>
  );
}

export function useBroadcastState() {
  const context = useContext(BroadcastContext);
  if (context === undefined) {
    throw new Error("useBroadcastState must be used within a BroadcastProvider");
  }
  return context;
}

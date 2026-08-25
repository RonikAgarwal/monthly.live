"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import PasswordGate from "@/components/PasswordGate";
import Transition from "@/components/Transition";
import Navigation from "@/components/Navigation";
import StreamPlayer from "@/components/StreamPlayer";

interface BroadcastState {
  isLive: boolean;
  djName: string;
  setName: string;
  streamUrl: string;
  listeners: number;
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showTransition, setShowTransition] = useState(false);
  const [showSite, setShowSite] = useState(false);
  const [broadcast, setBroadcast] = useState<BroadcastState>({
    isLive: false,
    djName: "HOST",
    setName: "",
    streamUrl: "",
    listeners: 0,
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

  // Poll broadcast state
  useEffect(() => {
    if (!showSite) return;
    fetchBroadcast();
    const interval = setInterval(fetchBroadcast, 5000);
    return () => clearInterval(interval);
  }, [showSite, fetchBroadcast]);

  const handlePasswordComplete = useCallback(() => {
    setShowTransition(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    setShowSite(true);
    fetchBroadcast();
  }, [fetchBroadcast]);

  if (isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            color: "#333",
          }}
        >
          ...
        </span>
      </div>
    );
  }

  if (!isAuthenticated && !showSite) {
    return (
      <>
        <PasswordGate onComplete={handlePasswordComplete} />
        {showTransition && <Transition onComplete={handleTransitionComplete} />}
      </>
    );
  }

  return (
    <div className="page-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navigation />

      <main
        style={{
          flex: 1,
          padding: "16px",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "16px" }}>
          <h1
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "18px",
              fontWeight: "bold",
              color: "#888",
              letterSpacing: "4px",
              margin: 0,
            }}
          >
            MONTHLY<span style={{ color: "#cc0000" }}>.</span>LIVE
          </h1>
        </div>

        {/* Live status */}
        {broadcast.isLive && (
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "12px",
              color: "#cc0000",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="live-pulse" style={{ fontSize: "8px" }}>
              ●
            </span>
            LIVE
            {broadcast.listeners > 0 && (
              <span style={{ color: "#444", fontSize: "11px" }}>
                {broadcast.listeners} listening
              </span>
            )}
          </div>
        )}

        {!broadcast.isLive && (
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "11px",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            offline
          </div>
        )}

        {/* Stream player */}
        <div style={{ border: "1px solid #1a1a1a", marginBottom: "16px" }}>
          <StreamPlayer
            isLive={broadcast.isLive}
            streamUrl={broadcast.streamUrl}
          />
        </div>

        {/* Set info */}
        {broadcast.isLive && (
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "12px",
              color: "#666",
              lineHeight: "2",
            }}
          >
            <div>
              DJ: <span style={{ color: "#999" }}>{broadcast.djName}</span>
            </div>
            {broadcast.setName && (
              <div>
                SET: <span style={{ color: "#999" }}>{broadcast.setName}</span>
              </div>
            )}
          </div>
        )}

        {!broadcast.isLive && (
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "11px",
              color: "#333",
              marginTop: "24px",
              lineHeight: "2",
            }}
          >
            <div>no active broadcast</div>
            <div style={{ color: "#222" }}>
              check schedule for next transmission
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #1a1a1a",
          fontFamily: '"Courier New", monospace',
          fontSize: "10px",
          color: "#222",
          textAlign: "center",
        }}
      >
        MONTHLY.LIVE
      </footer>
    </div>
  );
}

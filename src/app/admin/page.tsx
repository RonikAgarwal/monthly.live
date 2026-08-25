"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import PasswordGate from "@/components/PasswordGate";
import Transition from "@/components/Transition";

interface BroadcastState {
  isLive: boolean;
  djName: string;
  setName: string;
  streamUrl: string;
  listeners: number;
}

interface HistoryEntry {
  id: string;
  number: number;
  title: string;
  date: string;
  wentLiveAt: string;
  duration: string;
}

export default function AdminPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [showTransition, setShowTransition] = useState(false);
  const [showSite, setShowSite] = useState(false);

  // Broadcast state
  const [broadcast, setBroadcast] = useState<BroadcastState>({
    isLive: false,
    djName: "HOST",
    setName: "",
    streamUrl: "",
    listeners: 0,
  });

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // New history form
  const [newHistory, setNewHistory] = useState({
    date: "",
    wentLiveAt: "",
    duration: "",
  });

  // Load data
  useEffect(() => {
    if (!showSite) return;

    fetch("/api/stream")
      .then((res) => res.json())
      .then((data) => setBroadcast(data))
      .catch(() => {});

    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(() => {});
  }, [showSite]);

  // Save broadcast state
  const saveBroadcast = async () => {
    await fetch("/api/stream", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(broadcast),
    });
  };

  // Add history entry
  const addHistory = async () => {
    if (!newHistory.date || !newHistory.wentLiveAt) return;

    // Auto-generate title from time + date: HHMM_DDMMYYYY
    const timePart = newHistory.wentLiveAt.replace(":", "");
    const dateParts = newHistory.date.split(".");
    const datePart = dateParts.length === 3
      ? `${dateParts[0]}${dateParts[1]}${dateParts[2].length === 2 ? "20" + dateParts[2] : dateParts[2]}`
      : newHistory.date.replace(/\./g, "");
    const autoTitle = `${timePart}_${datePart}`;

    const maxNum = history.reduce((max, e) => Math.max(max, e.number), 0);

    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: maxNum + 1,
        title: autoTitle,
        date: newHistory.date,
        wentLiveAt: newHistory.wentLiveAt,
        duration: newHistory.duration,
      }),
    });

    // Reload history
    const res = await fetch("/api/history");
    const data = await res.json();
    setHistory(data);

    setNewHistory({ date: "", wentLiveAt: "", duration: "" });
  };

  // Delete history entry
  const deleteHistory = async (id: string) => {
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    const res = await fetch("/api/history");
    const data = await res.json();
    setHistory(data);
  };

  const handlePasswordComplete = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setShowSite(true);
  };

  if (isLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: '"Courier New", monospace', fontSize: "11px", color: "#333" }}>...</span>
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

  const inputStyle: React.CSSProperties = {
    background: "#0a0a0a",
    border: "1px solid #222",
    color: "#888",
    fontFamily: '"Courier New", monospace',
    fontSize: "12px",
    padding: "4px 8px",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: '"Courier New", monospace',
    fontSize: "11px",
    color: "#444",
    marginBottom: "4px",
    display: "block",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "32px",
    padding: "16px",
    border: "1px solid #111",
  };

  return (
    <div className="page-in" style={{ minHeight: "100vh", padding: "16px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "14px",
              fontWeight: "bold",
              color: "#666",
              letterSpacing: "3px",
            }}
          >
            ADMIN
          </h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href="/"
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: "11px",
                color: "#444",
                textDecoration: "none",
              }}
            >
              [ site ]
            </a>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #222",
                color: "#444",
                fontFamily: '"Courier New", monospace',
                fontSize: "11px",
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              [ logout ]
            </button>
          </div>
        </div>

        {/* Broadcast Control */}
        <div style={sectionStyle}>
          <h2 style={{ fontFamily: '"Courier New", monospace', fontSize: "12px", color: "#555", letterSpacing: "2px", marginBottom: "16px" }}>
            BROADCAST
          </h2>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>status</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() => {
                  // Auto-generate set name from current time + date
                  const now = new Date();
                  const hh = String(now.getHours()).padStart(2, "0");
                  const mm = String(now.getMinutes()).padStart(2, "0");
                  const dd = String(now.getDate()).padStart(2, "0");
                  const mo = String(now.getMonth() + 1).padStart(2, "0");
                  const yyyy = now.getFullYear();
                  const autoName = `${hh}${mm}_${dd}${mo}${yyyy}`;
                  setBroadcast({ ...broadcast, isLive: true, setName: broadcast.setName || autoName });
                }}
                style={{
                  background: broadcast.isLive ? "#cc0000" : "transparent",
                  border: "1px solid #cc0000",
                  color: broadcast.isLive ? "#000" : "#cc0000",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "11px",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                LIVE
              </button>
              <button
                onClick={() => setBroadcast({ ...broadcast, isLive: false })}
                style={{
                  background: !broadcast.isLive ? "#333" : "transparent",
                  border: "1px solid #333",
                  color: !broadcast.isLive ? "#888" : "#444",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "11px",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                OFFLINE
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>dj name</label>
            <input
              type="text"
              value={broadcast.djName}
              onChange={(e) => setBroadcast({ ...broadcast, djName: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>set name (auto-generated if empty)</label>
            <input
              type="text"
              value={broadcast.setName}
              onChange={(e) => setBroadcast({ ...broadcast, setName: e.target.value })}
              style={inputStyle}
              placeholder="HHMM_DDMMYYYY (auto on go live)"
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>stream url (HLS)</label>
            <input
              type="text"
              value={broadcast.streamUrl}
              onChange={(e) => setBroadcast({ ...broadcast, streamUrl: e.target.value })}
              style={inputStyle}
              placeholder="https://your-streaming-service/live/stream.m3u8"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>listeners</label>
            <input
              type="number"
              value={broadcast.listeners}
              onChange={(e) => setBroadcast({ ...broadcast, listeners: parseInt(e.target.value) || 0 })}
              style={{ ...inputStyle, width: "100px" }}
            />
          </div>

          <button
            onClick={saveBroadcast}
            style={{
              background: "#0a0a0a",
              border: "1px solid #333",
              color: "#666",
              fontFamily: '"Courier New", monospace',
              fontSize: "11px",
              padding: "6px 16px",
              cursor: "pointer",
            }}
          >
            [ save ]
          </button>
        </div>

        {/* History Control */}
        <div style={sectionStyle}>
          <h2 style={{ fontFamily: '"Courier New", monospace', fontSize: "12px", color: "#555", letterSpacing: "2px", marginBottom: "16px" }}>
            HISTORY
          </h2>

          {/* Existing entries */}
          {history.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid #111",
                fontFamily: '"Courier New", monospace',
                fontSize: "11px",
                color: "#555",
              }}
            >
              <span>
                {String(entry.number).padStart(3, "0")} / {entry.title} / {entry.date} / live {entry.wentLiveAt} / {entry.duration}
              </span>
              <button
                onClick={() => deleteHistory(entry.id)}
                style={{
                  background: "transparent",
                  border: "1px solid #222",
                  color: "#444",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "10px",
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}

          {/* Add new entry */}
          <div style={{ marginTop: "16px", padding: "12px", border: "1px dashed #222" }}>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: "10px", color: "#333", marginBottom: "8px" }}>
              add session:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                value={newHistory.date}
                onChange={(e) => setNewHistory({ ...newHistory, date: e.target.value })}
                style={inputStyle}
                placeholder="DD.MM.YY"
              />
              <input
                type="text"
                value={newHistory.wentLiveAt}
                onChange={(e) => setNewHistory({ ...newHistory, wentLiveAt: e.target.value })}
                style={inputStyle}
                placeholder="went live at (e.g. 21:00)"
              />
              <input
                type="text"
                value={newHistory.duration}
                onChange={(e) => setNewHistory({ ...newHistory, duration: e.target.value })}
                style={inputStyle}
                placeholder="duration (e.g. 1:30:00)"
              />
            </div>
            <button
              onClick={addHistory}
              style={{
                background: "#0a0a0a",
                border: "1px solid #333",
                color: "#666",
                fontFamily: '"Courier New", monospace',
                fontSize: "11px",
                padding: "4px 16px",
                cursor: "pointer",
              }}
            >
              [ add ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

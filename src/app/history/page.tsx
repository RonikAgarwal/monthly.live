"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

interface HistoryEntry {
  id: string;
  number: number;
  title: string;
  date: string;
  wentLiveAt: string;
  duration: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(() => {});
  }, []);

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
        <h2
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: "14px",
            fontWeight: "bold",
            color: "#666",
            letterSpacing: "3px",
            marginBottom: "24px",
          }}
        >
          HISTORY
        </h2>

        <div style={{ fontFamily: '"Courier New", monospace', fontSize: "12px" }}>
          {history.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #111",
                color: "#555",
                display: "flex",
                gap: "16px",
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#333", minWidth: "24px" }}>
                {String(entry.number).padStart(3, "0")}
              </span>
              <span style={{ letterSpacing: "2px", color: "#777" }}>
                {entry.title}
              </span>
              <span style={{ color: "#333", fontSize: "11px" }}>
                {entry.date}
              </span>
              <span style={{ color: "#444", fontSize: "11px" }}>
                live {entry.wentLiveAt}
              </span>
              <span style={{ color: "#333", fontSize: "11px" }}>
                {entry.duration}
              </span>
            </div>
          ))}

          {history.length === 0 && (
            <div style={{ color: "#333", padding: "24px 0" }}>
              no broadcasts yet
            </div>
          )}
        </div>
      </main>

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

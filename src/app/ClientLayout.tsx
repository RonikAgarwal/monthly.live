"use client";

import { useEffect, useState } from "react";

const DESKTOP_THRESHOLD = 900;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < DESKTOP_THRESHOLD);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        overflow: isMobile === false ? "hidden" : "auto",
        fontFamily: isMobile
          ? '"Courier New", "Lucida Console", Monaco, monospace'
          : '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: "12px",
        background: "#000",
        color: isMobile ? "#b0b0b0" : "inherit",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      className={isMobile ? "crt-flicker" : ""}
    >
      {children}
      {isMobile && (
        <>
          <div className="crt-overlay" />
          <div className="crt-vignette" />
        </>
      )}
    </div>
  );
}

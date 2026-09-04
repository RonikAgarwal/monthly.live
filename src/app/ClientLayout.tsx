"use client";

import { useEffect, useState } from "react";

const DESKTOP_THRESHOLD = 900;
// Overlay stays opaque while the desktop paints underneath, then fades out.
const OVERLAY_REMOVE_MS = 1700;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [bootFade, setBootFade] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < DESKTOP_THRESHOLD);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // The gate page dispatches this right before navigating to the desktop, so the
  // hard page swap happens underneath an opaque black overlay that then fades.
  useEffect(() => {
    let hideTimer: number | undefined;
    const onBootFade = () => {
      setBootFade(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setBootFade(false), OVERLAY_REMOVE_MS);
    };
    window.addEventListener("cherry:fade-from-boot", onBootFade);
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener("cherry:fade-from-boot", onBootFade);
    };
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

      {bootFade && (
        <div
          className="cherry-boot-fade"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const DESKTOP_THRESHOLD = 900;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [bootFade, setBootFade] = useState(false);
  const [bootFadeFading, setBootFadeFading] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < DESKTOP_THRESHOLD);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // The gate dispatches this right before navigating to the desktop. The
  // overlay stays fully opaque until the desktop page reports it has painted
  // ("cherry:desktop-ready"), then fades — so the swap is never visible,
  // no matter how slow the navigation round-trip is.
  useEffect(() => {
    let hideTimer: number | undefined;
    const onBootFade = () => {
      setBootFade(true);
      setBootFadeFading(false);
      window.clearTimeout(hideTimer);
      // Safety net: if the desktop never reports ready, fade anyway.
      hideTimer = window.setTimeout(() => {
        setBootFadeFading(true);
        hideTimer = window.setTimeout(() => setBootFade(false), 700);
      }, 3000);
    };
    const onDesktopReady = () => {
      if (!document.querySelector(".cherry-boot-fade")) return;
      window.clearTimeout(hideTimer);
      setBootFadeFading(true);
      hideTimer = window.setTimeout(() => setBootFade(false), 700);
    };
    window.addEventListener("cherry:fade-from-boot", onBootFade);
    window.addEventListener("cherry:desktop-ready", onDesktopReady);
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener("cherry:fade-from-boot", onBootFade);
      window.removeEventListener("cherry:desktop-ready", onDesktopReady);
    };
  }, []);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        overflow: isMobile === false ? "hidden" : "auto",
        // On mobile the wrapper is exactly the visible viewport height and
        // scrolls internally. html/body have overflow:hidden, so a wrapper
        // that merely grows to its content would get clipped (footer
        // unreachable, page not scrollable).
        height: isMobile === false ? undefined : "100dvh",
        minHeight: isMobile === false ? "100vh" : undefined,
        fontFamily: isMobile
          ? '"Courier New", "Lucida Console", Monaco, monospace'
          : '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: "12px",
        background: "#000",
        color: isMobile ? "#b0b0b0" : "inherit",
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
          className={bootFadeFading ? "cherry-boot-fade fading" : "cherry-boot-fade"}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

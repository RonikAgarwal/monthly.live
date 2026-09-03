"use client";

import { useState, useEffect } from "react";
import { BroadcastProvider } from "@/context/BroadcastContext";
import { WindowManagerProvider } from "@/context/WindowManagerContext";
import { AuthProvider } from "@/context/AuthContext";
import Desktop from "@/components/desktop/Desktop";
import MobileApp from "@/components/MobileApp";
import ResizePopup from "@/components/ResizePopup";

const DESKTOP_THRESHOLD = 900;

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < DESKTOP_THRESHOLD);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // SSR / initial render — show nothing to avoid flash
  if (isMobile === null) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000" }} />
    );
  }

  if (isMobile) {
    return (
      <AuthProvider>
        <MobileApp />
      </AuthProvider>
    );
  }

  return (
    <BroadcastProvider>
      <WindowManagerProvider>
        <Desktop />
        <ResizePopup />
      </WindowManagerProvider>
    </BroadcastProvider>
  );
}

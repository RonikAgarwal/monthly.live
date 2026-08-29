"use client";

import { BroadcastProvider } from "@/context/BroadcastContext";
import { WindowManagerProvider } from "@/context/WindowManagerContext";
import Desktop from "@/components/desktop/Desktop";

export default function Home() {
  return (
    <BroadcastProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </BroadcastProvider>
  );
}

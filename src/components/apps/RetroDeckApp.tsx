"use client";

import React, { useEffect, useRef } from "react";
import type Webamp from "webamp";

const SKINS = [
  { name: "Winamp Classic", url: "/webamp/skins/base-2.91.wsz" },
  { name: "Green Dimension V2", url: "/webamp/skins/Green-Dimension-V2.wsz" },
  { name: "Internet Archive", url: "/webamp/skins/Internet-Archive.wsz" },
  { name: "Mac OSX v1.5 (Aqua)", url: "/webamp/skins/MacOSXAqua1-5.wsz" },
  { name: "TopazAmp", url: "/webamp/skins/TopazAmp1-2.wsz" },
  { name: "Vizor", url: "/webamp/skins/Vizor1-01.wsz" },
  { name: "XMMS Turquoise", url: "/webamp/skins/XMMS-Turquoise.wsz" },
  { name: "Zaxon Remake", url: "/webamp/skins/ZaxonRemake1-0.wsz" },
];

// Free CC-licensed tracks from the Internet Archive
const DEMO_TRACKS = [
  { url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3", defaultName: "Shipping Lanes", artistName: "Chad Crouch", duration: 170 },
  { url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Enthusiast/Chad_Crouch_-_Enthusiast.mp3", defaultName: "Enthusiast", artistName: "Chad Crouch", duration: 145 },
  { url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Ketsa/Raising_Energy/Ketsa_-_06_-_Raising_Energy.mp3", defaultName: "Raising Energy", artistName: "Ketsa", duration: 234 },
  { url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Decompress/Chad_Crouch_-_City_Glitch.mp3", defaultName: "City Glitch", artistName: "Chad Crouch", duration: 112 },
];

export default function RetroDeckApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Webamp | null>(null);

  useEffect(() => {
    let disposed = false;
    let player: Webamp | null = null;

    const onSkinChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ skinUrl?: string }>;
      if (customEvent.detail?.skinUrl) {
        playerRef.current?.setSkinFromUrl(customEvent.detail.skinUrl);
      }
    };

    window.addEventListener("retro-deck-skin-change", onSkinChange as EventListener);

    const mount = async () => {
      const { default: WebampPlayer } = await import("webamp");
      if (disposed || !hostRef.current || !WebampPlayer.browserIsSupported()) return;

      player = new WebampPlayer({
        initialTracks: DEMO_TRACKS,
        initialSkin: { url: SKINS[0].url },
        availableSkins: SKINS,
        windowLayout: {
          main: { position: { left: 12, top: 10 } },
          equalizer: { position: { left: 12, top: 126 } },
          playlist: { position: { left: 12, top: 242 }, size: { extraHeight: 4, extraWidth: 0 } },
        },
      });

      playerRef.current = player;
      await player.renderInto(hostRef.current);
    };

    mount().catch(() => {});

    return () => {
      window.removeEventListener("retro-deck-skin-change", onSkinChange as EventListener);
      disposed = true;
      player?.dispose();
      playerRef.current = null;
    };
  }, []);

  return (
    <div className="webamp-deck-player" ref={hostRef} aria-label="Retro Deck Webamp player" />
  );
}

"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { useWindowManager } from "@/context/WindowManagerContext";
import AppRegistry from "./AppRegistry";
import Taskbar from "./Taskbar";
import SystemStatusGadget from "./SystemStatusGadget";
import NotificationToast from "./NotificationToast";
import RetroDeckApp from "../apps/RetroDeckApp";

const DESKTOP_ICONS = [
  { id: "computer", label: "Computer", appId: "file-explorer", emoji: "🖥️", props: { folderId: "root" } },
  { id: "cherry", label: "Cherry\nNetwork", appId: "file-explorer", emoji: "🍒", props: { folderId: "cherry" } },
  { id: "monthly-live", label: "MONTHLY\n.LIVE", appId: "media-player", emoji: "📺", props: {} },
  { id: "events", label: "Events", appId: "file-explorer", emoji: "📅", props: { folderId: "events" } },
  { id: "retro-deck", label: "Retro Deck", appId: "retro-deck", emoji: "🎛️", props: {}, size: { width: 700, height: 590 } },
  { id: "notepad", label: "Notepad", appId: "notepad", emoji: "📝", props: { content: "CHERRY NETWORK\nSRM CAMPUS\n\nWE ARE A COLLECTIVE OF\nMUSIC LOVERS, CREATORS,\nAND DREAMERS.\n\nUNITED BY SOUND.\nDRIVEN BY PASSION.\n\nTHIS IS MORE THAN A CLUB.\nTHIS IS A MOVEMENT.\n\nWELCOME TO THE NETWORK.\n\nSTAY TUNED.\nSTAY CONNECTED.\nSTAY CHERRY.\n\n#CherryNetwork #SRM #MonthlyLive" } },
  { id: "recycle-bin", label: "Recycle Bin", appId: "recycle-bin", emoji: "🗑️", props: {} },
];

export default function Desktop() {
  const { windows, openWindow } = useWindowManager();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [retroDeckVisible, setRetroDeckVisible] = useState(true);
  const [retroDeckPosition, setRetroDeckPosition] = useState({ x: 220, y: 100 });
  const [skinWidgetPosition, setSkinWidgetPosition] = useState({ x: 1120, y: 74 });
  const [skinUrl, setSkinUrl] = useState("/webamp/skins/base-2.91.wsz");

  const handleIconClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIcon(id);
  };

  const handleIconDoubleClick = (iconData: typeof DESKTOP_ICONS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (iconData.id === "retro-deck") {
      setRetroDeckVisible((visible) => !visible);
      return;
    }
    openWindow(iconData.appId, {
      title: iconData.label.replace("\n", ""),
      props: iconData.props,
      size: iconData.size,
    });
    setSelectedIcon(null);
  };

  const selectSkin = (nextSkinUrl: string) => {
    setSkinUrl(nextSkinUrl);
    window.dispatchEvent(new CustomEvent("retro-deck-skin-change", { detail: { skinUrl: nextSkinUrl } }));
  };

  const handleDesktopClick = () => {
    setSelectedIcon(null);
  };

  return (
    <div
      className="desktop-environment"
      onClick={handleDesktopClick}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a1628 0%, #0d2040 25%, #102848 50%, #0a1e38 75%, #060e1c 100%)",
      }}
    >
      {/* Wallpaper text overlay — matching the reference */}
      <div
        style={{
          position: "absolute",
          right: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "right",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.08,
        }}
      >
        <div style={{ fontFamily: '"Courier New", monospace', fontSize: "72px", fontWeight: "bold", color: "#fff", letterSpacing: "6px", lineHeight: 1.1 }}>
          MONTHLY.LIVE
        </div>
        <div style={{ fontFamily: '"Courier New", monospace', fontSize: "28px", color: "#fff", letterSpacing: "4px", marginTop: "8px" }}>
          CHERRY NETWORK
        </div>
        <div style={{ fontFamily: '"Courier New", monospace', fontSize: "18px", color: "#fff", letterSpacing: "3px", marginTop: "4px" }}>
          SRM CAMPUS
        </div>
      </div>

      {/* Subtle decorative glow */}
      <div style={{
        position: "absolute",
        top: "30%",
        right: "10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,30,30,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Desktop Icons */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px",
          alignItems: "flex-start",
          height: "calc(100vh - 40px)",
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}
      >
        {DESKTOP_ICONS.map((icon) => (
          <div
            key={icon.id}
            className={`desktop-icon ${selectedIcon === icon.id ? "selected" : ""}`}
            onClick={(e) => handleIconClick(icon.id, e)}
            onDoubleClick={(e) => handleIconDoubleClick(icon, e)}
          >
            <div style={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}>
              {icon.emoji}
            </div>
            <div className="desktop-icon-label">
              {icon.label}
            </div>
          </div>
        ))}
      </div>

      {/* Open windows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
          {windows.map((w) => (
            <div key={w.id} style={{ pointerEvents: "auto" }}>
              <AppRegistry windowInstance={w} />
            </div>
          ))}
        </div>
      </div>

      {retroDeckVisible && (
        <Rnd
          size={{ width: 520, height: 620 }}
          position={retroDeckPosition}
          onDragStop={(_e, d) => setRetroDeckPosition({ x: d.x, y: d.y })}
          bounds="parent"
          enableResizing={false}
          style={{ zIndex: 3, position: "absolute" }}
        >
          <div className="retro-deck-stage">
            <RetroDeckApp />
          </div>
        </Rnd>
      )}

      <Rnd
        size={{ width: 260, height: 56 }}
        position={skinWidgetPosition}
        onDragStop={(_e, d) => setSkinWidgetPosition({ x: d.x, y: d.y })}
        bounds="parent"
        enableResizing={false}
        style={{ zIndex: 4, position: "absolute" }}
      >
        <div className="retro-skin-widget">
          <div className="retro-skin-widget-label">SKIN</div>
          <select value={skinUrl} onChange={(event) => selectSkin(event.target.value)} aria-label="Webamp skin">
            {[
              { name: "Winamp Classic", url: "/webamp/skins/base-2.91.wsz" },
              { name: "Green Dimension V2", url: "/webamp/skins/Green-Dimension-V2.wsz" },
              { name: "Internet Archive", url: "/webamp/skins/Internet-Archive.wsz" },
              { name: "Mac OSX v1.5 (Aqua)", url: "/webamp/skins/MacOSXAqua1-5.wsz" },
              { name: "TopazAmp", url: "/webamp/skins/TopazAmp1-2.wsz" },
              { name: "Vizor", url: "/webamp/skins/Vizor1-01.wsz" },
              { name: "XMMS Turquoise", url: "/webamp/skins/XMMS-Turquoise.wsz" },
              { name: "Zaxon Remake", url: "/webamp/skins/ZaxonRemake1-0.wsz" },
            ].map((skin) => (
              <option key={skin.url} value={skin.url}>{skin.name}</option>
            ))}
          </select>
        </div>
      </Rnd>

      {/* Gadgets */}
      <SystemStatusGadget />
      <NotificationToast />

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useWindowManager } from "@/context/WindowManagerContext";
import AppRegistry from "./AppRegistry";
import Taskbar from "./Taskbar";
import SystemStatusGadget from "./SystemStatusGadget";
import NotificationToast from "./NotificationToast";
import RetroDeckApp from "../apps/RetroDeckApp";
import AssetIcon, { IconName } from "../ui/AssetIcon";

const DESKTOP_ICONS = [
  { id: "computer", label: "Computer", appId: "file-explorer", icon: "computer" as IconName, props: { folderId: "root" } },
  { id: "cherry", label: "Cherry\nNetwork", appId: "file-explorer", icon: "cherry" as IconName, props: { folderId: "cherry" } },
  { id: "monthly-live", label: "MONTHLY\n.LIVE", appId: "media-player", icon: "monthlyLive" as IconName, props: {} },
  { id: "events", label: "Events", appId: "file-explorer", icon: "folderDocuments" as IconName, props: { folderId: "events" } },
  { id: "retro-deck", label: "Retro Deck", appId: "retro-deck", icon: "retroDeck" as IconName, props: {}, size: { width: 700, height: 590 } },
  { id: "notepad", label: "Notepad", appId: "notepad", icon: "notepad" as IconName, props: { content: "CHERRY NETWORK\nSRM CAMPUS\n\nWE ARE A COLLECTIVE OF\nMUSIC LOVERS, CREATORS,\nAND DREAMERS.\n\nUNITED BY SOUND.\nDRIVEN BY PASSION.\n\nTHIS IS MORE THAN A CLUB.\nTHIS IS A MOVEMENT.\n\nWELCOME TO THE NETWORK.\n\nSTAY TUNED.\nSTAY CONNECTED.\nSTAY CHERRY.\n\n#CherryNetwork #SRM #MonthlyLive" } },
  { id: "recycle-bin", label: "Recycle Bin", appId: "recycle-bin", icon: "trash" as IconName, props: {} },
];

export default function Desktop() {
  const { windows, openWindow } = useWindowManager();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [retroDeckVisible, setRetroDeckVisible] = useState(true);
  const [retroDeckPosition, setRetroDeckPosition] = useState({ x: 680, y: 140 });
  const [skinWidgetPosition, setSkinWidgetPosition] = useState({ x: 1100, y: 60 });
  const [skinUrl, setSkinUrl] = useState("/webamp/skins/base-2.91.wsz");

  // Auto-open Media Player on first load
  useEffect(() => {
    openWindow("media-player", {
      title: "Windows Media Player",
      id: "media-player",
      position: { x: 80, y: 60 },
      size: { width: 700, height: 560 },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      }}
    >
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
            <div className="desktop-icon-art">
              <AssetIcon name={icon.icon} size={48} alt="" />
            </div>
            <div className="desktop-icon-label">
              {icon.label}
            </div>
          </div>
        ))}
      </div>

      {/* Open windows */}
      <div className="desktop-windows-container" style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}>
          {windows.map((w) => (
              <AppRegistry key={w.id} windowInstance={w} />
          ))}
      </div>

      {retroDeckVisible && (
        <Rnd
          size={{ width: 520, height: 620 }}
          position={retroDeckPosition}
          onDragStop={(_e, d) => setRetroDeckPosition({ x: d.x, y: d.y })}
          bounds=".desktop-environment"
          enableResizing={false}
          style={{ zIndex: 3, position: "absolute" }}
          dragHandleClassName="retro-deck-drag-handle"
        >
          <div className="retro-deck-stage">
            <div className="retro-deck-drag-handle" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, cursor: "grab", zIndex: 10 }} />
            <RetroDeckApp />
          </div>
        </Rnd>
      )}

      <Rnd
        size={{ width: 260, height: 56 }}
        position={skinWidgetPosition}
        onDragStop={(_e, d) => setSkinWidgetPosition({ x: d.x, y: d.y })}
        bounds=".desktop-environment"
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
      <Taskbar onToggleRetroDeck={() => setRetroDeckVisible((visible) => !visible)} />
    </div>
  );
}

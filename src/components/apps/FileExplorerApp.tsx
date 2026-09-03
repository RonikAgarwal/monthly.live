"use client";

import React, { useState } from "react";
import { WindowInstance, useWindowManager } from "@/context/WindowManagerContext";
import AssetIcon, { IconName } from "../ui/AssetIcon";

const FILE_SYSTEM: Record<string, { title: string; breadcrumb: string; items: { id: string; label: string; type: "folder" | "file" | "shortcut"; target?: string }[] }> = {
  root: {
    title: "Computer",
    breadcrumb: "Computer",
    items: [
      { id: "cherry", label: "CHERRY_NETWORK (C:)", type: "folder" },
    ],
  },
  cherry: {
    title: "Cherry Network",
    breadcrumb: "Computer > CHERRY_NETWORK (C:) > Cherry Network",
    items: [
      { id: "about", label: "About Us", type: "file" },
      { id: "team", label: "Our Team", type: "file" },
      { id: "events", label: "Events", type: "folder" },
      { id: "communities", label: "Communities", type: "folder" },
      { id: "projects", label: "Projects", type: "folder" },
      { id: "gallery", label: "Gallery", type: "folder" },
      { id: "contact", label: "Contact", type: "file" },
      { id: "monthly-live", label: "MONTHLY.LIVE", type: "shortcut", target: "media-player" },
      { id: "readme", label: "README.txt", type: "file" },
    ],
  },
  events: {
    title: "Events",
    breadcrumb: "Computer > CHERRY_NETWORK (C:) > Events",
    items: [
      { id: "elysian", label: "Elysian '25", type: "file" },
      { id: "robofest", label: "Robofest '25", type: "file" },
      { id: "ataraxia", label: "Ataraxia 2.0", type: "file" },
    ],
  },
  communities: {
    title: "Communities",
    breadcrumb: "Computer > CHERRY_NETWORK (C:) > Communities",
    items: [
      { id: "techverse", label: "Techverse", type: "file" },
      { id: "endeavour", label: "Endeavour", type: "file" },
    ],
  },
  projects: {
    title: "Projects",
    breadcrumb: "Computer > CHERRY_NETWORK (C:) > Projects",
    items: [
      { id: "monthly-live-proj", label: "MONTHLY.LIVE", type: "shortcut", target: "media-player" },
    ],
  },
  gallery: {
    title: "Gallery",
    breadcrumb: "Computer > CHERRY_NETWORK (C:) > Gallery",
    items: [
      { id: "img1", label: "Photo 1.jpg", type: "file" },
      { id: "img2", label: "Photo 2.jpg", type: "file" },
    ],
  },
};

const FILE_CONTENT: Record<string, string> = {
  about: "CHERRY NETWORK\nSRM CAMPUS\n\nWE ARE A COLLECTIVE OF\nMUSIC LOVERS, CREATORS,\nAND DREAMERS.\n\nUNITED BY SOUND.\nDRIVEN BY PASSION.\n\nTHIS IS MORE THAN A CLUB.\nTHIS IS A MOVEMENT.\n\nWELCOME TO THE NETWORK.\n\nSTAY TUNED.\nSTAY CONNECTED.\nSTAY CHERRY.\n\n#CherryNetwork #SRM #MonthlyLive",
  team: "Founders:\n- Aditya Krishnan\n- Siddhant Vashistha\n\nMentors: (7 people)\n\nDirectors:\n- Executive Director\n- COO\n\nExecutives, Managers, Associates",
  techverse: "Technology-led. Ignite your technical prowess!\nShowcase skills, explore tech fields, and join a community of techies.\nSub-areas: Web Development, App Development, UI/UX Design.",
  endeavour: "Leadership-led. Endeavour is the heart of Cherry Network.\nHelping members lead, create, execute, and grow through real experiences.\nSub-areas: Events, Design, Corporate.",
  contact: "+91 88260 22445\ntechverse@cherrynetwork.in\nInstagram @cherry.network\nX @network_cherry\nLinkedIn /company/cherry-network",
  elysian: "Elysian '25\nDate: 7 Aug 2025",
  robofest: "Robofest '25\nDates: 10-11 Sep 2025\nRobofest DJ Night: 11 Sep 2025",
  ataraxia: "Ataraxia 2.0\nDates: 11-14 Feb 2026\n(Flagship festival)",
  readme: "Welcome to the Cherry Network file system.\n\nThis is a simulated Windows 7 desktop\nfor MONTHLY.LIVE — the live streaming platform\nby Cherry Network, SRM Campus.\n\nDouble-click MONTHLY.LIVE to watch the stream.",
  img1: "[Gallery Image Placeholder]",
  img2: "[Gallery Image Placeholder]",
};

export default function FileExplorerApp({ windowInstance }: { windowInstance: WindowInstance }) {
  const { openWindow } = useWindowManager();
  const folderId = (windowInstance.props?.folderId as string) || "root";
  const folder = FILE_SYSTEM[folderId] || FILE_SYSTEM.root;

  const [selected, setSelected] = useState<string | null>(null);

  const handleDoubleClick = (item: typeof folder.items[0]) => {
    if (item.type === "folder") {
      openWindow("file-explorer", { title: item.label, props: { folderId: item.id } });
    } else if (item.type === "file") {
      openWindow("notepad", { title: `${item.label} - Notepad`, props: { content: FILE_CONTENT[item.id] || "Empty file." } });
    } else if (item.type === "shortcut" && item.target) {
      openWindow(item.target, { title: item.label, id: item.target });
    }
  };

  const sidebarNavigate = (fid: string) => {
    openWindow("file-explorer", { title: FILE_SYSTEM[fid]?.title || fid, props: { folderId: fid } });
  };

  const getFileIcon = (item: typeof folder.items[0]): IconName => {
    if (item.type === "folder") return "folder";
    if (item.target === "media-player") return "monthlyLive";
    if (item.label.endsWith(".jpg")) return "imageFile";
    return "textFile";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        background: "linear-gradient(to bottom, #f8f8f8, #e8e8e8)",
        borderBottom: "1px solid #ccc",
        fontSize: "11px",
      }}>
        <button style={{ padding: "2px 8px", background: "#e0e0e0", border: "1px solid #bbb", borderRadius: "2px", cursor: "pointer", fontSize: "11px", color: "#333" }}>← Back</button>
        <button style={{ padding: "2px 8px", background: "#e0e0e0", border: "1px solid #bbb", borderRadius: "2px", cursor: "pointer", fontSize: "11px", color: "#333" }}>→</button>

        {/* Breadcrumb */}
        <div style={{
          flex: 1,
          padding: "3px 8px",
          background: "#fff",
          border: "1px solid #b0b8c0",
          borderRadius: "2px",
          fontSize: "11px",
          color: "#333",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <span>▸</span>
          {folder.breadcrumb.split(" > ").map((part, i, arr) => (
            <React.Fragment key={i}>
              <span style={{ color: i === arr.length - 1 ? "#000" : "#4488cc" }}>{part}</span>
              {i < arr.length - 1 && <span style={{ color: "#999" }}>▸</span>}
            </React.Fragment>
          ))}
        </div>

        <div style={{
          padding: "3px 8px",
          background: "#fff",
          border: "1px solid #b0b8c0",
          borderRadius: "2px",
          fontSize: "11px",
          color: "#999",
          width: "140px",
        }}>
          Search Cherry Network
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div className="explorer-sidebar">
          <div className="explorer-sidebar-header">▾ Favorites</div>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")}>
            <AssetIcon name="computer" size={16} alt="" /> Desktop
          </button>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")}>
            <AssetIcon name="folderDownloads" size={16} alt="" /> Downloads
          </button>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")}>
            <AssetIcon name="folderOpen" size={16} alt="" /> Recent Places
          </button>

          <div className="explorer-sidebar-header" style={{ marginTop: "8px" }}>▾ Libraries</div>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")}>
            <AssetIcon name="folderDocuments" size={16} alt="" /> Documents
          </button>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")}>
            <AssetIcon name="folderMusic" size={16} alt="" /> Music
          </button>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("gallery")}>
            <AssetIcon name="folderPictures" size={16} alt="" /> Pictures
          </button>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")}>
            <AssetIcon name="folderVideos" size={16} alt="" /> Videos
          </button>

          <div className="explorer-sidebar-header" style={{ marginTop: "8px" }}>▾ Computer</div>
          <button className="explorer-sidebar-item" onClick={() => sidebarNavigate("cherry")} style={{ fontWeight: 600 }}>
            <AssetIcon name="computer" size={16} alt="" /> CHERRY_NETWORK (C:)
          </button>

          <div className="explorer-sidebar-header" style={{ marginTop: "8px" }}>▸ Network</div>
        </div>

        {/* File area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Arrange bar */}
          <div style={{
            padding: "4px 12px",
            background: "#f0f0f0",
            borderBottom: "1px solid #ddd",
            fontSize: "11px",
            color: "#555",
            display: "flex",
            justifyContent: "space-between",
          }}>
            <div>
              <strong>Documents library</strong>
              <span style={{ marginLeft: "12px", color: "#888" }}>{folder.title}</span>
            </div>
            <div>
              Arrange by: <span style={{ color: "#4488cc" }}>Folder ▾</span>
            </div>
          </div>

          {/* Files grid */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignContent: "flex-start",
              overflow: "auto",
              background: "#fff",
            }}
            onClick={() => setSelected(null)}
          >
            {folder.items.map((item) => (
              <div
                key={item.id}
                onClick={(e) => { e.stopPropagation(); setSelected(item.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(item); }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  padding: "6px",
                  width: "80px",
                  backgroundColor: selected === item.id ? "rgba(51,153,255,0.15)" : "transparent",
                  border: selected === item.id ? "1px solid rgba(51,153,255,0.4)" : "1px solid transparent",
                  borderRadius: "3px",
                }}
              >
                <div className="explorer-file-icon">
                  <AssetIcon name={getFileIcon(item)} size={42} alt="" />
                  {item.type === "shortcut" && <AssetIcon name="shortcut" size={15} alt="" className="explorer-shortcut-badge" />}
                </div>
                <div style={{ fontSize: "11px", textAlign: "center", wordBreak: "break-word", color: "#222", lineHeight: 1.3 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status bar */}
          <div style={{
            padding: "3px 12px",
            borderTop: "1px solid #ddd",
            background: "#f0f0f0",
            fontSize: "11px",
            color: "#666",
            flexShrink: 0,
          }}>
            {folder.items.length} items
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWindowManager, WindowInstance } from "@/context/WindowManagerContext";
import AssetIcon from "../ui/AssetIcon";

export default function StartMenu({ onClose, onToggleRetroDeck }: { onClose: () => void; onToggleRetroDeck: () => void }) {
  const router = useRouter();
  const { openWindow } = useWindowManager();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest(".win7-start-btn")) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const launch = (appId: string, options: Partial<WindowInstance> = {}) => {
    openWindow(appId, options);
    onClose();
  };

  const toggleRetroDeck = () => {
    onToggleRetroDeck();
    onClose();
  };

  return (
    <div ref={menuRef} className="win7-start-menu">
      {/* [REVERT] Simple Start Menu — uncomment to restore:
      <div className="start-menu-left">
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #ddd", marginBottom: "4px" }}>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "#222" }}>MONTHLY.LIVE</div>
          <div style={{ fontSize: "10px", color: "#888" }}>one room. one signal.</div>
        </div>
        <button className="start-menu-item left-item" onClick={() => launch("media-player", { title: "Windows Media Player", id: "media-player" })}>
          <AssetIcon name="mediaPlayer" size={22} alt="" />
          <div>
            <div style={{ fontWeight: 600 }}>Windows Media Player</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Watch the live stream</div>
          </div>
        </button>
        <button className="start-menu-item left-item" onClick={toggleRetroDeck}>
          <AssetIcon name="retroDeck" size={22} alt="" />
          <div>
            <div style={{ fontWeight: 600 }}>Retro Deck</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Webamp player with selectable skins</div>
          </div>
        </button>
        <button className="start-menu-item left-item" onClick={() => launch("file-explorer", { title: "Cherry Network", props: { folderId: "cherry" } })}>
          <AssetIcon name="cherry" size={22} alt="" />
          <div>
            <div style={{ fontWeight: 600 }}>Cherry Network</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Browse the network</div>
          </div>
        </button>
        <button className="start-menu-item left-item" onClick={() => launch("notepad", { title: "Notepad" })}>
          <AssetIcon name="notepad" size={22} alt="" />
          <div>
            <div style={{ fontWeight: 600 }}>Notepad</div>
          </div>
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid #ddd", padding: "6px 16px", fontSize: "11px", color: "#888" }}>
          All Programs ▸
        </div>
      </div>
      <div className="start-menu-right">
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Computer", props: { folderId: "root" } })}>
          <AssetIcon name="computer" size={18} alt="" /> Computer
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Documents", props: { folderId: "cherry" } })}>
          <AssetIcon name="folderDocuments" size={18} alt="" /> Documents
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Pictures", props: { folderId: "gallery" } })}>
          <AssetIcon name="folderPictures" size={18} alt="" /> Pictures
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Music", props: { folderId: "cherry" } })}>
          <AssetIcon name="folderMusic" size={18} alt="" /> Music
        </button>
        <button className="start-menu-item right-item" onClick={() => launch("file-explorer", { title: "Events", props: { folderId: "events" } })}>
          <AssetIcon name="folderDocuments" size={18} alt="" /> Events
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "6px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#c0c8d0" }}>
          <span aria-hidden="true" className="start-menu-lock" /> Log off
        </div>
      </div>
      */}

      {/* Left Panel — Programs (white background) */}
      <div className="sm-left">
        <div className="sm-user-area">
          <div className="sm-user-avatar">
            <img src="/assets/icons/apps/cherry-network.png" alt="" style={{ width: "100%", height: "100%", borderRadius: "3px" }} />
          </div>
          <div className="sm-user-name">MONTHLY.LIVE</div>
        </div>
        <div className="sm-separator" />
        <div className="sm-programs-list">
          <button className="sm-program-item" onClick={() => launch("media-player", { title: "Windows Media Player", id: "media-player" })}>
            <div className="sm-program-icon">
              <AssetIcon name="mediaPlayer" size={28} alt="" />
            </div>
            <div className="sm-program-label">Windows Media Player</div>
          </button>
          <button className="sm-program-item" onClick={toggleRetroDeck}>
            <div className="sm-program-icon">
              <AssetIcon name="retroDeck" size={28} alt="" />
            </div>
            <div className="sm-program-label">Retro Deck</div>
          </button>
          <button className="sm-program-item" onClick={() => launch("file-explorer", { title: "Cherry Network", props: { folderId: "cherry" } })}>
            <div className="sm-program-icon">
              <AssetIcon name="cherry" size={28} alt="" />
            </div>
            <div className="sm-program-label">Cherry Network</div>
          </button>
          <button className="sm-program-item" onClick={() => launch("notepad", { title: "Notepad" })}>
            <div className="sm-program-icon">
              <AssetIcon name="notepad" size={28} alt="" />
            </div>
            <div className="sm-program-label">Notepad</div>
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <div className="sm-separator" />
        <div className="sm-all-programs">
          <span className="sm-all-programs-arrow">▶</span> All Programs
        </div>
        <div className="sm-search-bar">
          <input type="text" placeholder="Search Programs" className="sm-search-input" />
          <div className="sm-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel — Folders & System (dark glass) */}
      <div className="sm-right">
        <div className="sm-right-items">
          <button className="sm-right-item" onClick={() => launch("file-explorer", { title: "Documents", props: { folderId: "cherry" } })}>
            <div className="sm-right-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8e8e8">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v7h6v9H6z"/>
              </svg>
            </div>
            <span>Documents</span>
          </button>
          <button className="sm-right-item" onClick={() => launch("file-explorer", { title: "Pictures", props: { folderId: "gallery" } })}>
            <div className="sm-right-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8e8e8">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <span>Pictures</span>
          </button>
          <button className="sm-right-item" onClick={() => launch("file-explorer", { title: "Music", props: { folderId: "cherry" } })}>
            <div className="sm-right-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8e8e8">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span>Music</span>
          </button>
          <button className="sm-right-item" onClick={() => launch("file-explorer", { title: "Computer", props: { folderId: "root" } })}>
            <div className="sm-right-icon">
              <AssetIcon name="computer" size={20} alt="" />
            </div>
            <span>Computer</span>
          </button>
        </div>
        <div className="sm-right-separator" />
        <div className="sm-right-items">
          <button className="sm-right-item" onClick={() => launch("file-explorer", { title: "Events", props: { folderId: "events" } })}>
            <div className="sm-right-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8e8e8">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <span>Control Panel</span>
          </button>
          <button className="sm-right-item" onClick={() => launch("file-explorer", { title: "Gallery", props: { folderId: "gallery" } })}>
            <div className="sm-right-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8e8e8">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
              </svg>
            </div>
            <span>Default Programs</span>
          </button>
          <button className="sm-right-item sm-help-item">
            <div className="sm-right-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8e8e8">
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
            </div>
            <span>Help and Support</span>
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <div className="sm-shutdown-area">
          <button className="sm-shutdown-btn" onClick={() => router.push("/gate")}>
            <span>Shut down</span>
          </button>
          <button className="sm-shutdown-arrow">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

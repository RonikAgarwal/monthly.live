"use client";

import React from "react";
import { WindowInstance } from "@/context/WindowManagerContext";
import WindowFrame from "./WindowFrame";
import NotepadApp from "../apps/NotepadApp";

import MediaPlayerApp from "../apps/MediaPlayerApp";
import FileExplorerApp from "../apps/FileExplorerApp";
import RecycleBinApp from "../apps/RecycleBinApp";

interface AppRegistryProps {
  windowInstance: WindowInstance;
}

export default function AppRegistry({ windowInstance }: AppRegistryProps) {
  const { appId } = windowInstance;

  let AppContent: React.ReactNode = null;

  switch (appId) {
    case "notepad":
      AppContent = <NotepadApp windowInstance={windowInstance} />;
      break;
    case "media-player":
      AppContent = <MediaPlayerApp windowInstance={windowInstance} />;
      break;
    case "file-explorer":
      AppContent = <FileExplorerApp windowInstance={windowInstance} />;
      break;
    case "retro-deck":
      return null;
    case "recycle-bin":
      AppContent = <RecycleBinApp windowInstance={windowInstance} />;
      break;
    default:
      AppContent = (
        <div style={{ padding: 20, textAlign: "center" }}>
          <p>Unknown Application: {appId}</p>
        </div>
      );
  }

  return <WindowFrame windowInstance={windowInstance}>{AppContent}</WindowFrame>;
}

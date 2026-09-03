"use client";

import Image from "next/image";
import React from "react";

export const ICONS = {
  computer: "/assets/icons/places/computer.svg",
  cherry: "/assets/icons/apps/cherry-network.svg",
  monthlyLive: "/assets/icons/apps/monthly-live.svg",
  retroDeck: "/assets/icons/apps/retro-deck.svg",
  notepad: "/assets/icons/apps/accessories-text-editor.png",
  mediaPlayer: "/assets/icons/apps/applications-multimedia.png",
  folder: "/assets/icons/places/folder.svg",
  folderOpen: "/assets/icons/places/folder-open.svg",
  folderDownloads: "/assets/icons/places/folder-downloads.svg",
  folderDocuments: "/assets/icons/places/folder-documents.svg",
  folderMusic: "/assets/icons/places/folder-music.svg",
  folderPictures: "/assets/icons/places/folder-pictures.svg",
  folderVideos: "/assets/icons/places/folder-videos.svg",
  textFile: "/assets/icons/mimetypes/text-x-generic.png",
  imageFile: "/assets/icons/mimetypes/image-x-generic.png",
  shortcut: "/assets/icons/emblems/emblem-symbolic-link.png",
  trash: "/assets/icons/places/user-trash.svg",
  trashFull: "/assets/icons/places/user-trash-full.svg",
  volumeHigh: "/assets/icons/status/audio-volume-high.png",
  networkWireless: "/assets/icons/status/network-wireless.png",
  playbackStart: "/assets/icons/actions/media-playback-start.png",
  playbackPause: "/assets/icons/actions/media-playback-pause.png",
  skipBackward: "/assets/icons/actions/media-skip-backward.png",
  skipForward: "/assets/icons/actions/media-skip-forward.png",
  seekBackward: "/assets/icons/actions/media-seek-backward.png",
  seekForward: "/assets/icons/actions/media-seek-forward.png",
} as const;

export type IconName = keyof typeof ICONS;

type AssetIconProps = {
  name: IconName;
  alt?: string;
  size?: number;
  className?: string;
};

export default function AssetIcon({ name, alt = "", size = 16, className }: AssetIconProps) {
  return (
    <Image
      src={ICONS[name]}
      alt={alt}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}

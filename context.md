# MONTHLY.LIVE - Project Context

This file serves as a comprehensive record of the current state of the MONTHLY.LIVE project. It outlines the architecture, features, and recent updates to the simulated Windows 7 desktop environment.

## 1. Technology Stack
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Custom CSS (`globals.css`) heavily inspired by Windows 7 Aero glass, combined with `7.css` for base Windows 7 UI elements. Font used is Segoe UI.
*   **Key Libraries:** 
    *   `react-rnd`: Used for draggable and resizable window management.
    *   `lucide-react`: For icons (though many are currently emojis for simplicity).

## 2. Architecture & State Management
The application is built around a provider-based architecture to manage the simulated operating system state.

*   **`WindowManagerContext.tsx`**: The core state controller for the windowing system.
    *   Maintains an array of `WindowInstance` objects (id, title, position, size, zIndex, isMinimized, isMaximized, appId, props).
    *   Provides actions to `openWindow`, `closeWindow`, `minimizeWindow`, `toggleMaximize`, `focusWindow`, `moveWindow`, and `resizeWindow`.
    *   Handles z-index management to ensure the focused window is always on top.
*   **`BroadcastContext.tsx`**: Centralized state for the live stream data.
    *   Polls the `/api/stream` endpoint periodically.
    *   Provides the `broadcast` state (status: LIVE/OFFLINE, title, channelLogin, watchingHere, startedAt) to any component that needs it (MediaPlayer, SystemStatusGadget, Taskbar, etc.).
*   **`PresenceHeartbeat.tsx`**: A silent component that periodically pings `/api/presence` to track active viewers on the site.

## 3. Authentication & Gate
The site is protected by a password gate.
*   **`middleware.ts`**: The primary auth controller. It intercepts requests to the root path (`/`) and checks for an auth cookie. If missing, it redirects to `/gate`.
*   **`app/api/gate/route.ts`**: The API endpoint that validates the submitted password against the server's expected password. Sets the auth cookie upon success.
*   **`app/gate/page.tsx`**: The UI for the password gate (styled to look like a retro login screen).

## 4. Desktop Environment (Core UI)
The main entry point (`app/page.tsx`) renders the `<Desktop />` component wrapped in the necessary providers.

*   **`Desktop.tsx`**: 
    *   Renders the dark aesthetic background with the "MONTHLY.LIVE / CHERRY NETWORK" text overlay.
    *   Renders clickable desktop icons that launch specific applications.
    *   Renders the `Taskbar`, `SystemStatusGadget`, and `NotificationToast`.
    *   Iterates over the open windows in `WindowManagerContext` and renders them via `AppRegistry`.
*   **`AppRegistry.tsx`**: A switch statement that maps an `appId` (e.g., "media-player", "notepad") to its specific React component implementation.
*   **`WindowFrame.tsx`**: The wrapper component for all apps.
    *   Uses `react-rnd` to make the window draggable and resizable.
    *   Provides the Windows 7 Aero glass title bar with minimize, maximize, and close buttons.
    *   Handles responsive behavior (fullscreen on mobile).
*   **`Taskbar.tsx`**: 
    *   The Windows 7 style taskbar at the bottom of the screen.
    *   Features the Start Button (toggles `StartMenu`).
    *   Shows buttons for pinned/active applications, allowing users to minimize/restore them.
    *   Includes a System Tray with a live clock, date, and a red "LIVE" indicator when the broadcast is active.
*   **`StartMenu.tsx`**: 
    *   A simulated Windows 7 start menu with a two-panel layout.
    *   Left panel shows pinned programs (Media Player, Retro Deck, etc.) with descriptions.
    *   Right panel shows quick links to specific folders in the File Explorer.
*   **`SystemStatusGadget.tsx`**: A floating desktop widget (gadget) that displays the current broadcast status, viewer count, and stream uptime in a dark, stylized UI.
*   **`NotificationToast.tsx`**: A slide-in notification that appears in the bottom right corner when the stream transitions from OFFLINE to LIVE.

## 5. Applications (Apps)
These are the simulated programs that can be launched within the OS.

*   **`MediaPlayerApp.tsx`**: 
    *   Simulates Windows Media Player but with a custom dark theme.
    *   Uses `StreamPlayer.tsx` to embed the actual Twitch/Live stream when the status is LIVE. Shows a "NO SIGNAL" screen when offline.
    *   Features transport controls, a volume slider, and "Now Playing" metadata.
*   **`RetroDeckApp.tsx`**: 
    *   An interactive, visual DJ console.
    *   Features dual rotating platters (which can be clicked and dragged), EQ knobs, channel faders, and animated VU meters that react when the stream is live.
*   **`FileExplorerApp.tsx`**: 
    *   A robust simulation of Windows Explorer.
    *   Uses a hardcoded `FILE_SYSTEM` object to define the directory structure and contents (folders, text files, shortcuts).
    *   Features a left sidebar for quick navigation (Favorites, Libraries, Computer), a breadcrumb navigation bar, and a main grid view for icons.
    *   Double-clicking text files opens them in the Notepad app; double-clicking shortcuts launches the respective app.
*   **`NotepadApp.tsx`**: 
    *   A simple text viewer for reading files from the File Explorer.
    *   Includes a simulated menu bar (File, Edit, Format, etc.).
*   **`RecycleBinApp.tsx`**: A basic placeholder app for the recycle bin.

## 6. Recent Overhaul Notes
The entire UI was recently overhauled to strictly match a highly detailed Windows 7 Aero glass reference image. This involved:
*   Adding `7.css` for base styles.
*   Extensive custom CSS in `globals.css` to handle the glass effects, specific gradients, scrollbars, and animations (toast slide-in, live pulse).
*   Removing previous CRT/glitch effects from the desktop view to maintain a clean, polished OS look.
*   Updating all components to use precise styling, flexbox layouts, and color palettes that match the reference.

## 7. Next Steps / Pending Tasks
*   Verify mobile responsiveness and touch interactions for `react-rnd` windows and taskbar elements.
*   Ensure the `PresenceHeartbeat` correctly tracks viewers.
*   Potential addition of a context menu (right-click) for personalization (e.g., changing wallpaper).

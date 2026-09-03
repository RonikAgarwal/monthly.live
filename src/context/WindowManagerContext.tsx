"use client";

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from "react";

export type WindowInstance = {
  id: string;
  appId: string;
  title: string;
  icon: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isResizable: boolean;
  props?: Record<string, unknown>;
};

type WindowManagerContextType = {
  windows: WindowInstance[];
  openWindow: (appId: string, options?: Partial<WindowInstance>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
  resizeWindow: (id: string, size: { width: number; height: number }) => void;
};

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

type Action =
  | { type: "OPEN_WINDOW"; payload: WindowInstance }
  | { type: "CLOSE_WINDOW"; payload: { id: string } }
  | { type: "FOCUS_WINDOW"; payload: { id: string } }
  | { type: "MINIMIZE_WINDOW"; payload: { id: string } }
  | { type: "TOGGLE_MAXIMIZE"; payload: { id: string } }
  | { type: "MOVE_WINDOW"; payload: { id: string; position: { x: number; y: number } } }
  | { type: "RESIZE_WINDOW"; payload: { id: string; size: { width: number; height: number } } };

function windowReducer(state: WindowInstance[], action: Action): WindowInstance[] {
  switch (action.type) {
    case "OPEN_WINDOW": {
      if (state.find(w => w.id === action.payload.id)) {
        return windowReducer(state, { type: "FOCUS_WINDOW", payload: { id: action.payload.id } });
      }
      const maxZIndex = state.reduce((max, w) => Math.max(max, w.zIndex), 0);
      return [...state, { ...action.payload, zIndex: maxZIndex + 1 }];
    }
    case "CLOSE_WINDOW":
      return state.filter(w => w.id !== action.payload.id);
    case "FOCUS_WINDOW": {
      const maxZIndex = state.reduce((max, w) => Math.max(max, w.zIndex), 0);
      return state.map(w =>
        w.id === action.payload.id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w
      );
    }
    case "MINIMIZE_WINDOW":
      return state.map(w =>
        w.id === action.payload.id ? { ...w, isMinimized: true } : w
      );
    case "TOGGLE_MAXIMIZE":
      return state.map(w =>
        w.id === action.payload.id ? { ...w, isMaximized: !w.isMaximized, isMinimized: false } : w
      );
    case "MOVE_WINDOW":
      return state.map(w =>
        w.id === action.payload.id ? { ...w, position: action.payload.position } : w
      );
    case "RESIZE_WINDOW":
      return state.map(w =>
        w.id === action.payload.id ? { ...w, size: action.payload.size } : w
      );
    default:
      return state;
  }
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, dispatch] = useReducer(windowReducer, []);

  const openWindow = useCallback((appId: string, options?: Partial<WindowInstance>) => {
    const id = options?.id || `${appId}-${Date.now()}`;
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id,
        appId,
        title: options?.title || "Application",
        icon: options?.icon || "/assets/icons/app.png",
        position: options?.position || { x: Math.max(0, 100 + Math.random() * 200), y: Math.max(0, 80 + Math.random() * 150) },
        size: options?.size || { width: 600, height: 400 },
        zIndex: 0,
        isMinimized: false,
        isMaximized: false,
        isResizable: options?.isResizable ?? true,
        props: options?.props,
      }
    });
  }, []);

  const closeWindow = useCallback((id: string) => dispatch({ type: "CLOSE_WINDOW", payload: { id } }), []);
  const focusWindow = useCallback((id: string) => dispatch({ type: "FOCUS_WINDOW", payload: { id } }), []);
  const minimizeWindow = useCallback((id: string) => dispatch({ type: "MINIMIZE_WINDOW", payload: { id } }), []);
  const toggleMaximize = useCallback((id: string) => dispatch({ type: "TOGGLE_MAXIMIZE", payload: { id } }), []);
  const moveWindow = useCallback((id: string, position: { x: number; y: number }) => dispatch({ type: "MOVE_WINDOW", payload: { id, position } }), []);
  const resizeWindow = useCallback((id: string, size: { width: number; height: number }) => dispatch({ type: "RESIZE_WINDOW", payload: { id, size } }), []);

  const value = useMemo(() => ({
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
  }), [windows, openWindow, closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow]);

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  return context;
}

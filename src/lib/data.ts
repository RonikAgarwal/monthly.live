/**
 * Broadcast data store.
 *
 * In production, this would connect to a real database.
 * For now, data is stored in a JSON file on the server.
 *
 * The admin interface writes to this store.
 * The public API reads from this store.
 */

export interface BroadcastData {
  isLive: boolean;
  djName: string;
  setName: string;
  streamUrl: string; // HLS stream URL
  listeners: number;
}

export interface HistoryEntry {
  id: string;
  number: number;
  title: string;
  date: string; // e.g. "24.08.26"
  wentLiveAt: string; // e.g. "21:00"
  duration: string; // e.g. "1:42:00"
}

export interface SiteData {
  broadcast: BroadcastData;
  history: HistoryEntry[];
}

const DEFAULT_DATA: SiteData = {
  broadcast: {
    isLive: false,
    djName: "HOST",
    setName: "",
    streamUrl: "",
    listeners: 0,
  },
  history: [],
};

// In-memory store (replaced with file-based in production)
let siteData: SiteData = { ...DEFAULT_DATA };

export function getData(): SiteData {
  return siteData;
}

export function updateBroadcast(broadcast: Partial<BroadcastData>): BroadcastData {
  siteData.broadcast = { ...siteData.broadcast, ...broadcast };
  return siteData.broadcast;
}

export function updateHistory(history: HistoryEntry[]): HistoryEntry[] {
  siteData.history = history;
  return siteData.history;
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id">): HistoryEntry[] {
  const newEntry: HistoryEntry = {
    ...entry,
    id: `h${Date.now()}`,
  };
  siteData.history = [newEntry, ...siteData.history];
  return siteData.history;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  siteData.history = siteData.history.filter((e) => e.id !== id);
  return siteData.history;
}

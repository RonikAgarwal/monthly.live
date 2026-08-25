import { getRedis } from "@/lib/redis";
import { getChannelStream, getTwitchChannelLogin, type TwitchStream } from "@/lib/twitch";

const STATE_KEY = "monthly:broadcast:state";
const ACTIVE_SESSION_KEY = "monthly:broadcast:active-session";
const HISTORY_KEY = "monthly:broadcast:history";
const PRESENCE_KEY = "monthly:presence";
const EVENT_KEY_PREFIX = "monthly:eventsub:event:";
const STATE_MAX_AGE_MS = Number(process.env.TWITCH_STATE_MAX_AGE_SECONDS ?? 120) * 1000;
const PRESENCE_TTL_SECONDS = Number(process.env.PRESENCE_TIMEOUT_SECONDS ?? 90);

export interface BroadcastState {
  status: "LIVE" | "OFFLINE";
  startedAt?: string;
  title?: string;
  twitchStreamId?: string;
  twitchViewers?: number;
  watchingHere: number;
  channelLogin?: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  number: number;
  title: string;
  date: string;
  wentLiveAt: string;
  duration: string;
  startedAt: string;
  endedAt: string;
  twitchStreamId: string;
}

type StoredState = Omit<BroadcastState, "watchingHere" | "channelLogin">;

const offline = (updatedAt = new Date().toISOString()): StoredState => ({ status: "OFFLINE", updatedAt });

function dateParts(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return { date: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`, time: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
}

function formatDuration(startedAt: string, endedAt: string) {
  const seconds = Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000));
  return `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

async function watchingHere() {
  const redis = getRedis();
  if (!redis) return 0;
  const cutoff = Date.now() - PRESENCE_TTL_SECONDS * 1000;
  await redis.zremrangebyscore(PRESENCE_KEY, 0, cutoff);
  return redis.zcard(PRESENCE_KEY);
}

async function readState(): Promise<StoredState> {
  const redis = getRedis();
  if (!redis) return offline();
  return (await redis.get<StoredState>(STATE_KEY)) ?? offline("1970-01-01T00:00:00.000Z");
}

function stateFromStream(stream: TwitchStream): StoredState {
  return { status: "LIVE", startedAt: stream.startedAt, title: stream.title, twitchStreamId: stream.id, twitchViewers: stream.viewerCount, updatedAt: new Date().toISOString() };
}

export async function markLive(stream: TwitchStream) {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured");
  const current = await readState();
  const state = stateFromStream(stream);
  await redis.set(STATE_KEY, state);
  if (current.twitchStreamId === stream.id) return state;

  const id = stream.id;
  const details = dateParts(stream.startedAt);
  const entry: HistoryEntry = { id, number: 0, title: stream.title || `${details.time.replace(":", "")}_${details.date.replace(/\./g, "")}`, date: details.date, wentLiveAt: details.time, duration: "", startedAt: stream.startedAt, endedAt: "", twitchStreamId: stream.id };
  await redis.set(`monthly:broadcast:session:${id}`, entry);
  await redis.zadd(HISTORY_KEY, { score: new Date(stream.startedAt).getTime(), member: id });
  await redis.set(ACTIVE_SESSION_KEY, id);
  return state;
}

export function streamFromOnlineEvent(event: Record<string, unknown>): TwitchStream | null {
  if (typeof event.id !== "string" || typeof event.started_at !== "string") return null;
  return {
    id: event.id,
    userId: typeof event.broadcaster_user_id === "string" ? event.broadcaster_user_id : "",
    userLogin: typeof event.broadcaster_user_login === "string" ? event.broadcaster_user_login : "",
    userName: typeof event.broadcaster_user_name === "string" ? event.broadcaster_user_name : "",
    title: "",
    startedAt: event.started_at,
    viewerCount: 0,
    gameName: "",
  };
}

export async function markOffline() {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured");
  const current = await readState();
  const endedAt = new Date().toISOString();
  const activeId = (await redis.get<string>(ACTIVE_SESSION_KEY)) ?? current.twitchStreamId;
  if (activeId) {
    const key = `monthly:broadcast:session:${activeId}`;
    const entry = await redis.get<HistoryEntry>(key);
    if (entry && !entry.endedAt) await redis.set(key, { ...entry, endedAt, duration: formatDuration(entry.startedAt, endedAt) });
  }
  await redis.del(ACTIVE_SESSION_KEY);
  const state = offline();
  await redis.set(STATE_KEY, state);
  return state;
}

async function reconcileState() {
  const stored = await readState();
  const age = Date.now() - new Date(stored.updatedAt).getTime();
  if (Number.isFinite(age) && age <= STATE_MAX_AGE_MS) return stored;
  try {
    const stream = await getChannelStream();
    if (stream) return await markLive(stream);
    return await markOffline();
  } catch {
    // Never keep a stale LIVE result indefinitely when Twitch cannot be reached.
    return offline();
  }
}

export async function getPublicBroadcastState(): Promise<BroadcastState> {
  const [state, count] = await Promise.all([reconcileState(), watchingHere().catch(() => 0)]);
  return { ...state, watchingHere: count, channelLogin: getTwitchChannelLogin() ?? undefined };
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  const ids = await redis.zrange<string[]>(HISTORY_KEY, 0, -1, { rev: true });
  const entries = await Promise.all(ids.map((id) => redis.get<HistoryEntry>(`monthly:broadcast:session:${id}`)));
  return entries.filter((entry): entry is HistoryEntry => Boolean(entry)).map((entry, index) => ({ ...entry, number: entries.length - index }));
}

export async function registerPresence(sessionId: string) {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured");
  await redis.zadd(PRESENCE_KEY, { score: Date.now(), member: sessionId });
  return watchingHere();
}

export async function claimEvent(eventId: string) {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured");
  return redis.set(`${EVENT_KEY_PREFIX}${eventId}`, "1", { nx: true, ex: 60 * 60 * 24 });
}

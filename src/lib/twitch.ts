export interface TwitchStream {
  id: string;
  userId: string;
  userLogin: string;
  userName: string;
  title: string;
  startedAt: string;
  viewerCount: number;
  gameName: string;
}

interface AppToken {
  value: string;
  expiresAt: number;
}

let cachedToken: AppToken | null = null;

function config() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const channelLogin = process.env.TWITCH_CHANNEL_LOGIN?.trim().toLowerCase();
  return { clientId, clientSecret, channelLogin };
}

export function getTwitchChannelLogin() {
  return config().channelLogin ?? null;
}

export function isTwitchConfigured() {
  const { clientId, clientSecret, channelLogin } = config();
  return Boolean(clientId && clientSecret && channelLogin);
}

async function getAppToken() {
  const { clientId, clientSecret } = config();
  if (!clientId || !clientSecret) throw new Error("Twitch credentials are not configured");
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to authenticate with Twitch");
  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token || !body.expires_in) throw new Error("Malformed Twitch token response");
  cachedToken = { value: body.access_token, expiresAt: Date.now() + Math.max(60, body.expires_in - 60) * 1000 };
  return cachedToken.value;
}

async function helix(path: string, retry = true) {
  const { clientId } = config();
  const token = await getAppToken();
  const response = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Client-Id": clientId! },
    cache: "no-store",
  });
  if (response.status === 401 && retry) {
    cachedToken = null;
    return helix(path, false);
  }
  if (!response.ok) throw new Error(`Twitch API request failed (${response.status})`);
  return response.json() as Promise<{ data?: unknown[] }>;
}

export async function getChannelStream(): Promise<TwitchStream | null> {
  const login = getTwitchChannelLogin();
  if (!login || !isTwitchConfigured()) return null;
  const body = await helix(`/streams?user_login=${encodeURIComponent(login)}`);
  const stream = body.data?.[0] as Record<string, unknown> | undefined;
  if (!stream || typeof stream.id !== "string" || typeof stream.started_at !== "string") return null;
  return {
    id: stream.id,
    userId: String(stream.user_id ?? ""),
    userLogin: String(stream.user_login ?? login),
    userName: String(stream.user_name ?? login),
    title: String(stream.title ?? ""),
    startedAt: stream.started_at,
    viewerCount: typeof stream.viewer_count === "number" ? stream.viewer_count : 0,
    gameName: String(stream.game_name ?? ""),
  };
}

import { getRedis } from "@/lib/redis";

export type GateMode = "open" | "locked";

const MODE_KEY = "monthly:gate:mode";
const PASSWORD_KEY = "monthly:gate:password";

function envPassword(): string {
  return process.env.SITE_ACCESS_PASSWORD || "admin";
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const ea = encoder.encode(a);
  const eb = encoder.encode(b);
  if (ea.length !== eb.length || ea.length === 0) return false;
  let result = 0;
  for (let i = 0; i < ea.length; i++) result |= ea[i] ^ eb[i];
  return result === 0;
}

/** Current gate mode; defaults to "locked" when nothing is stored or Redis is unavailable. */
export async function getGateMode(): Promise<GateMode> {
  const redis = getRedis();
  if (!redis) return "locked";
  const mode = await redis.get<GateMode>(MODE_KEY);
  return mode === "open" ? "open" : "locked";
}

/** Flips the site to open — the gate no longer asks for a password. */
export async function openGate(): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured");
  await redis.set(MODE_KEY, "open");
}

/** Stores a new gate password and locks the site with it. */
export async function lockGateWithPassword(password: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured");
  await redis.set(PASSWORD_KEY, password);
  await redis.set(MODE_KEY, "locked");
}

/**
 * Returns true when the site is open or the attempt matches the configured
 * password (stored one set via /adminpw, else SITE_ACCESS_PASSWORD, else "admin").
 */
export async function verifyGateAccess(attempt: string): Promise<boolean> {
  if ((await getGateMode()) === "open") return true;

  const redis = getRedis();
  let expected = envPassword();
  if (redis) {
    const stored = await redis.get<string>(PASSWORD_KEY);
    if (stored) expected = stored;
  }
  return timingSafeEqual(attempt.trim(), expected);
}

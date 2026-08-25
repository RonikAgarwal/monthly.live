import { Redis } from "@upstash/redis";

let redis: Redis | null | undefined;

/** Returns Redis only when the standard Upstash environment is configured. */
export function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  // Upstash's direct integration uses UPSTASH_REDIS_REST_*, while the Vercel
  // Marketplace installation shown in the dashboard supplies KV_REST_API_*.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

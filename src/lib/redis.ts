import { Redis } from "@upstash/redis";

let redis: Redis | null | undefined;

/** Returns Redis only when the standard Upstash environment is configured. */
export function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

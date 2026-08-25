# MONTHLY.LIVE

one room. one signal.

## Architecture

```
OBS → Twitch → Official Twitch Embed → MONTHLY.LIVE
             ↘ EventSub → Next.js → Upstash Redis → site state/history
```

Twitch is the only streaming provider. The site never plays or proxies a raw HLS stream.

## Setup

Install dependencies, then configure these environment variables locally and in Vercel:

```bash
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_CHANNEL_LOGIN=
TWITCH_EVENTSUB_SECRET=
TWITCH_EVENTSUB_CALLBACK_URL=https://YOUR_DOMAIN/api/eventsub
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: password gate; omit only if you intentionally do not use it.
MONTHLY_LIVE_PASSWORD=

# Optional tuning
TWITCH_STATE_MAX_AGE_SECONDS=120
PRESENCE_TIMEOUT_SECONDS=90
NEXT_PUBLIC_PRESENCE_HEARTBEAT_SECONDS=30
```

`TWITCH_CLIENT_SECRET`, `TWITCH_EVENTSUB_SECRET`, and the Upstash token are server-only. Do not prefix them with `NEXT_PUBLIC_`.

If you installed Upstash through Vercel and see `KV_REST_API_URL` and `KV_REST_API_TOKEN` instead, use those names as supplied; the application supports both naming conventions. Do not use the read-only token.

Run locally:

```bash
npm install
npm run dev
```

## Twitch configuration

1. Create a Twitch developer application and add your production site URL as an OAuth redirect URL if Twitch asks for one. Copy its Client ID and Client Secret into the variables above.
2. Set `TWITCH_CHANNEL_LOGIN` to the broadcaster login (not a display name or URL).
3. Deploy first, then create the two webhook EventSub subscriptions. The included command resolves the broadcaster user ID from `TWITCH_CHANNEL_LOGIN` and creates both `stream.online` and `stream.offline` subscriptions:

   ```
   npm run twitch:subscribe
   ```

   Set `TWITCH_EVENTSUB_CALLBACK_URL` to your public `https://YOUR_DOMAIN/api/eventsub` first. Use the same value for each subscription's webhook secret as `TWITCH_EVENTSUB_SECRET`. Twitch verifies the callback by sending a signed challenge; the route responds with the challenge only after HMAC verification.

4. Deploy over HTTPS. Twitch's official player receives the current browser hostname as its required `parent` parameter.

The backend also performs a bounded Helix `streams` reconciliation when its persisted state gets older than `TWITCH_STATE_MAX_AGE_SECONDS`; EventSub remains the normal live/offline path.

## Upstash Redis

Create an Upstash Redis database (or install the Vercel Marketplace integration) and copy the standard REST URL/token into `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

Redis stores the current broadcast state, completed broadcast sessions, de-duplication keys for EventSub deliveries, and anonymous short-lived presence IDs. It stores no IP addresses.

## Website viewer count

Each live-page browser session creates a random local session ID and posts a heartbeat every 30 seconds while the tab is visible. Redis keeps the last-seen time in a sorted set and expires sessions after 90 seconds by default. `WATCHING HERE` is this site-specific number; `TWITCH VIEWERS`, when available from Helix, is shown separately.

## History

`stream.online` creates exactly one Redis-backed broadcast session keyed by the Twitch stream ID. `stream.offline` finalizes that session with end time and duration. EventSub message IDs are retained for 24 hours to make retries idempotent. `/history` reads the persisted completed/live session records.

## Routes

- `/api/stream` — public, read-only application broadcast state.
- `/api/history` — public, read-only persisted broadcast history.
- `/api/presence` — accepts only a validated anonymous session ID.
- `/api/eventsub` — signed Twitch webhook endpoint.

The previous mutable broadcast/history APIs, manual admin controls, custom HLS player, and `hls.js` dependency have been removed.

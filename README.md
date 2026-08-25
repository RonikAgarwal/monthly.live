# MONTHLY.LIVE

one room. one signal.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` and set your password:

```bash
MONTHLY_LIVE_PASSWORD=your_password_here
```

### 3. Add static video

Place your TV static video at:

```
public/assets/static.mp4
```

This is shown when the broadcast is offline. Use any loop-able TV static video.

### 4. Run development server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Deploy

```bash
npm run build
npm start
```

Or deploy to Vercel/Netlify/any Node.js host.

## Streaming Setup

### OBS Configuration

1. Open OBS
2. Settings → Stream
3. Stream Type: Custom Streaming Server
4. URL: `rtmp://your-streaming-service/live`
5. Stream Key: `your-stream-key`

### Streaming Service Options

- **YouTube Live**: Free, easy, provides HLS URL
- **Twitch**: Free, popular with students
- **Custom RTMP Server**: Most control (e.g., using nginx-rtmp)
- **Cloudflare Stream**: Good performance, paid

### Getting Your HLS URL

After starting your stream, you'll get an HLS URL like:
```
https://youtube.com/live/video_id.m3u8
```
or
```
https://live.cloudflare.com/stream/video_id.m3u8
```

### Configure the Website

1. Go to `/admin`
2. Enter the password
3. Paste your HLS URL in the "stream url" field
4. Set yourself as LIVE
5. Click Save

The website will automatically switch from static to live stream.

## Admin Panel

Access at `/admin`

From there you can:
- Toggle LIVE/OFFLINE status
- Set your DJ name
- Set the current set name
- Update the stream URL
- Manage the broadcast schedule
- Add/remove archive recordings

## Architecture

```
OBS → Streaming Service → HLS URL → MONTHLY.LIVE → Students
```

The website does NOT receive the stream directly.
It connects to an external streaming service via HLS.

## File Structure

```
src/
├── app/
│   ├── page.tsx          # Main live page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # CRT/old-web styles
│   ├── favicon.ico       # Site icon
│   ├── history/          # Broadcast history page
│   │   └── page.tsx
│   ├── admin/            # Admin interface
│   │   └── page.tsx
│   └── api/              # API routes
│       ├── auth/         # Password verification
│       ├── stream/       # Broadcast state
│       └── history/      # History management
├── components/
│   ├── PasswordGate.tsx  # Password entry screen
│   ├── Transition.tsx    # CRT transition effect
│   ├── StreamPlayer.tsx  # HLS video player
│   └── Navigation.tsx    # Minimal nav
├── context/
│   └── AuthContext.tsx   # Authentication state
└── lib/
    └── data.ts           # Data store
```

## Security Notes

- The password is checked server-side via `/api/auth`
- Password is stored in environment variable `MONTHLY_LIVE_PASSWORD`
- Auth session is stored in localStorage (7 days)
- For production, consider:
  - Adding rate limiting to the auth endpoint
  - Using HTTP-only cookies instead of localStorage
  - Adding CSRF protection
  - Using a proper database instead of in-memory store

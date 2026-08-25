const required = [
  "TWITCH_CLIENT_ID",
  "TWITCH_CLIENT_SECRET",
  "TWITCH_CHANNEL_LOGIN",
  "TWITCH_EVENTSUB_SECRET",
  "TWITCH_EVENTSUB_CALLBACK_URL",
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}

const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  }),
});
if (!tokenResponse.ok) throw new Error(`Twitch token request failed: ${tokenResponse.status}`);
const { access_token: accessToken } = await tokenResponse.json();

const headers = { Authorization: `Bearer ${accessToken}`, "Client-Id": process.env.TWITCH_CLIENT_ID };
const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(process.env.TWITCH_CHANNEL_LOGIN)}`, { headers });
if (!userResponse.ok) throw new Error(`Could not resolve Twitch channel: ${userResponse.status}`);
const { data: users } = await userResponse.json();
const broadcasterId = users?.[0]?.id;
if (!broadcasterId) throw new Error("Configured TWITCH_CHANNEL_LOGIN was not found");

for (const type of ["stream.online", "stream.offline"]) {
  const existingResponse = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?type=${encodeURIComponent(type)}`, { headers });
  if (!existingResponse.ok) throw new Error(`Could not list ${type} subscriptions: ${existingResponse.status}`);
  const { data: existing } = await existingResponse.json();
  const alreadySubscribed = existing?.some((subscription) =>
    subscription.status === "enabled" &&
    subscription.condition?.broadcaster_user_id === broadcasterId &&
    subscription.transport?.callback === process.env.TWITCH_EVENTSUB_CALLBACK_URL
  );
  if (alreadySubscribed) {
    console.log(`${type} is already subscribed for ${process.env.TWITCH_CHANNEL_LOGIN}.`);
    continue;
  }
  const response = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      version: "1",
      condition: { broadcaster_user_id: broadcasterId },
      transport: { method: "webhook", callback: process.env.TWITCH_EVENTSUB_CALLBACK_URL, secret: process.env.TWITCH_EVENTSUB_SECRET },
    }),
  });
  if (!response.ok) throw new Error(`${type} subscription failed: ${response.status} ${await response.text()}`);
  console.log(`Created ${type} subscription for ${process.env.TWITCH_CHANNEL_LOGIN}.`);
}

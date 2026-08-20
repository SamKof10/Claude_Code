# Gym Tracker

A mobile-first PWA for tracking a fixed 5-day gym split (Mo–Fr): per-set
checkboxes with weight logging, an auto-computed day status, a week/history
view, day and week streaks, and a **20:00 reminder that fires as a real
background push notification** — Mon–Fri only, and only if that day's
workout isn't already marked done — whether or not the app is open.

Implemented from a [Claude Design](https://claude.ai/design) handoff (see
`chats/chat1.md` for the original design conversation).

## How it's built

- **`public/`** — the static PWA (vanilla HTML/CSS/JS, no build step):
  `index.html`, `styles.css`, `app.js` (state + rendering), `sw.js`
  (service worker: offline app-shell caching + push handling), `manifest.json`,
  icons.
- **`server/`** — a small Node/Express backend. It's required for
  *background* push (a browser tab can't wake itself up to send a
  notification while closed — something has to hold the schedule and call
  the Push API from outside the browser). It:
  - serves `public/` as static files,
  - stores each device's push subscription, timezone and per-day
    completion status in `server/data/db.json`,
  - every 20s, checks whether any registered device has just hit its local
    20:00 on a weekday with today not yet done, and if so sends a Web Push
    notification via VAPID.

Data model, plan, and all UI copy are unchanged from the design — plan is
hardcoded (no editing UI), state is `localStorage` on the client, no login.

## Run it locally

```bash
cd server
npm install
npm run generate-vapid-keys        # prints a VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY pair
cp .env.example .env                # paste the generated keys in
npm start                           # serves the app + API on http://localhost:3000
```

Open `http://localhost:3000`, tap **Aktivieren** on the reminder card to
grant notification permission and subscribe to push.

## Requirements for push to actually work

- **HTTPS in production.** Push subscriptions only work over `https://` (or
  `localhost` for local dev). Deploy behind a reverse proxy / host that
  terminates TLS.
- **The server process must keep running** — it's what fires the reminder,
  not the browser tab. Run it under a process manager (`pm2`, a systemd
  unit, a small always-on VM/container, etc.) if you want reminders every
  weekday evening rather than just while you happen to have `npm start`
  running.
- **Install the PWA** ("Add to Home Screen") on your phone so background
  push delivery works the way a native app's would, especially on iOS
  (Safari only allows Web Push for installed PWAs, iOS 16.4+).
- Each browser/device that taps **Aktivieren** registers itself
  independently (there's no login) — install it on the device(s) you
  actually want reminded.

## Deploying

Any Node host works (a small VPS, Fly.io, Render, a Raspberry Pi on your
network, …) since it's a single `node server.js` process serving both the
app and the API. Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT`, and optionally `PORT` as environment variables (or via
`server/.env`), and make sure the deployment is reachable over HTTPS.

`server/data/db.json` is the entire backend database (subscriptions +
completion status) — back it up if you care about not re-subscribing.

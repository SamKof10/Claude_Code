'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const store = require('./store');

// Minimal .env loader (no extra dependency) — reads server/.env if present.
(function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = (m[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const push = require('./push');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri'];
const WEEKDAY_TO_KEY = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri' };
const DAY_INFO = {
  mon: { name: 'Montag', focus: 'Bein Kraft + Rumpf' },
  tue: { name: 'Dienstag', focus: 'Oberkörper + Kondition' },
  wed: { name: 'Mittwoch', focus: 'Bein Power + Kondition' },
  thu: { name: 'Donnerstag', focus: 'Oberkörper + Rumpf' },
  fri: { name: 'Freitag', focus: 'Zirkel + Kondition' },
};

const app = express();
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get('/api/health', (req, res) => res.json({ ok: true, pushConfigured: push.configured }));

app.get('/api/vapid-public-key', (req, res) => {
  if (!push.configured) return res.status(503).json({ error: 'push not configured' });
  res.json({ publicKey: push.publicKey });
});

app.post('/api/register', (req, res) => {
  const { clientId, timezone, reminderHour } = req.body || {};
  if (!clientId || typeof clientId !== 'string') return res.status(400).json({ error: 'clientId required' });
  const patch = {};
  if (typeof timezone === 'string' && timezone) patch.timezone = timezone;
  if (Number.isFinite(reminderHour)) patch.reminderHour = Math.min(23, Math.max(0, Math.round(reminderHour)));
  store.upsertClient(clientId, patch);
  res.json({ ok: true });
});

app.post('/api/subscribe', (req, res) => {
  const { clientId, subscription } = req.body || {};
  if (!clientId || typeof clientId !== 'string') return res.status(400).json({ error: 'clientId required' });
  if (!subscription || typeof subscription !== 'object' || !subscription.endpoint) {
    return res.status(400).json({ error: 'valid subscription required' });
  }
  store.setSubscription(clientId, subscription);
  res.json({ ok: true });
});

app.post('/api/unsubscribe', (req, res) => {
  const { clientId } = req.body || {};
  if (!clientId || typeof clientId !== 'string') return res.status(400).json({ error: 'clientId required' });
  store.clearSubscription(clientId);
  res.json({ ok: true });
});

app.post('/api/day-status', (req, res) => {
  const { clientId, iso, done } = req.body || {};
  if (!clientId || typeof clientId !== 'string') return res.status(400).json({ error: 'clientId required' });
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return res.status(400).json({ error: 'iso (YYYY-MM-DD) required' });
  store.setDayStatus(clientId, iso, !!done);
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

/* ── reminder scheduler ───────────────────────────────────────────────
   Runs independently of any open tab: every CHECK_INTERVAL_MS it looks
   at each registered client's *local* time (their reported IANA
   timezone) and, once at their reminderHour on a weekday, sends a push
   if today isn't marked done yet. */

function localParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
  });
  const map = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;
  return {
    iso: `${map.year}-${map.month}-${map.day}`,
    hour: parseInt(map.hour, 10) % 24,
    minute: parseInt(map.minute, 10),
    weekday: map.weekday,
  };
}

async function tick() {
  if (!push.configured) return;
  const clients = store.allClients();
  const now = new Date();
  for (const [clientId, c] of Object.entries(clients)) {
    if (!c.subscription) continue;
    let parts;
    try { parts = localParts(now, c.timezone || 'UTC'); } catch (e) { continue; }
    const dayKey = WEEKDAY_TO_KEY[parts.weekday];
    if (!dayKey) continue; // weekend
    const reminderHour = Number.isFinite(c.reminderHour) ? c.reminderHour : 20;
    if (parts.hour !== reminderHour || parts.minute !== 0) continue;
    if (c.lastReminderSentIso === parts.iso) continue;

    const alreadyDone = !!(c.dayStatus && c.dayStatus[parts.iso]);
    if (!alreadyDone) {
      const info = DAY_INFO[dayKey];
      try {
        await push.sendPush(c.subscription, {
          title: 'Training heute noch offen',
          body: `${info.name} – ${info.focus} wartet noch auf dich.`,
        });
        console.log(`[push] reminder sent → ${clientId} (${parts.iso})`);
      } catch (e) {
        console.error(`[push] send failed for ${clientId}:`, e.statusCode || e.message);
        if (e.statusCode === 404 || e.statusCode === 410) store.clearSubscription(clientId);
      }
    }
    store.setLastReminderSent(clientId, parts.iso);
  }
}

const CHECK_INTERVAL_MS = 20000;
setInterval(() => { tick().catch((e) => console.error('[push] tick error', e)); }, CHECK_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`Gym Tracker server running on http://localhost:${PORT}`);
  if (!push.configured) {
    console.warn('Push notifications disabled — run "npm run generate-vapid-keys" and configure server/.env');
  }
});

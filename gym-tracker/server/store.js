'use strict';

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { clients: {} };
  }
}

function writeDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

let db = readDb();

function getClient(clientId) {
  return db.clients[clientId] || null;
}

function upsertClient(clientId, patch) {
  const existing = db.clients[clientId] || {
    timezone: 'UTC',
    reminderHour: 20,
    subscription: null,
    dayStatus: {},
    lastReminderSentIso: null,
  };
  db.clients[clientId] = { ...existing, ...patch };
  writeDb(db);
  return db.clients[clientId];
}

function setSubscription(clientId, subscription) {
  return upsertClient(clientId, { subscription });
}

function clearSubscription(clientId) {
  const c = getClient(clientId);
  if (!c) return;
  return upsertClient(clientId, { subscription: null });
}

function setDayStatus(clientId, iso, done) {
  const c = db.clients[clientId] || upsertClient(clientId, {});
  const dayStatus = { ...c.dayStatus, [iso]: done };
  // keep the map small — only the last ~60 days matter for reminders/debugging
  const isoKeys = Object.keys(dayStatus).sort();
  while (isoKeys.length > 60) {
    delete dayStatus[isoKeys.shift()];
  }
  return upsertClient(clientId, { dayStatus });
}

function setLastReminderSent(clientId, iso) {
  return upsertClient(clientId, { lastReminderSentIso: iso });
}

function allClients() {
  return db.clients;
}

module.exports = {
  getClient,
  upsertClient,
  setSubscription,
  clearSubscription,
  setDayStatus,
  setLastReminderSent,
  allClients,
};

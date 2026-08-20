'use strict';

const webpush = require('web-push');

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

const configured = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (configured) {
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn(
    '[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — push notifications are disabled.\n' +
    '        Run "npm run generate-vapid-keys" and put the values in server/.env (see .env.example).'
  );
}

async function sendPush(subscription, payload) {
  if (!configured) throw new Error('VAPID keys not configured');
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

module.exports = { sendPush, configured, publicKey: VAPID_PUBLIC_KEY };

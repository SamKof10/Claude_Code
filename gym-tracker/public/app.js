'use strict';

/* ── constants ────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'gymTracker5DayLogs_v1';
const CLIENT_ID_KEY = 'gymTrackerClientId_v1';
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri'];
const SHORT = { mon: 'Mo', tue: 'Di', wed: 'Mi', thu: 'Do', fri: 'Fr' };
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const WEIGHT_UNIT = 'kg';
const HISTORY_WEEKS = 6;
const REMINDER_HOUR = 20;

const PLAN = {
  mon: { name: 'Montag', focus: 'Bein Kraft + Rumpf', exercises: [
    { id: 'mon1', name: 'Bulgarian Split Squat', sets: 4, reps: '8/Seite', rest: '90s' },
    { id: 'mon2', name: 'Single Leg Deep Squat', sets: 4, reps: '10/Seite', rest: '90s' },
    { id: 'mon3', name: 'Ausfallschritte', sets: 4, reps: '20 Schritte', rest: '60s' },
    { id: 'mon4', name: 'Wandsitzen', sets: 4, reps: '1 min', rest: '45s' },
    { id: 'mon5', name: 'Pallof Press', sets: 3, reps: '15/Seite', rest: '45s' },
    { id: 'mon6', name: 'Plank', sets: 3, reps: '45s', rest: '30s' },
  ]},
  tue: { name: 'Dienstag', focus: 'Oberkörper + Kondition', exercises: [
    { id: 'tue1', name: 'Brustpresse Kabel', sets: 4, reps: '10', rest: '90s' },
    { id: 'tue2', name: 'Latzug', sets: 4, reps: '10', rest: '90s' },
    { id: 'tue3', name: 'Rudern sitzend Kabel', sets: 4, reps: '10', rest: '75s' },
    { id: 'tue4', name: 'Schulterdrücken Kabel', sets: 4, reps: '10', rest: '90s' },
    { id: 'tue5', name: 'Rudergerät Intervalle', sets: 8, reps: '30s Belastung', rest: '30s' },
  ]},
  wed: { name: 'Mittwoch', focus: 'Bein Power + Kondition', exercises: [
    { id: 'wed1', name: 'Step-ups', sets: 4, reps: '12/Seite', rest: '75s' },
    { id: 'wed2', name: 'Crab Walk mit Thera', sets: 4, reps: '40 Schritte', rest: '60s' },
    { id: 'wed3', name: 'Waden auf Treppe', sets: 4, reps: '20/Seite', rest: '45s' },
    { id: 'wed4', name: 'Crosstrainer', sets: 1, reps: '30 min · Puls 145–155', rest: '–' },
  ]},
  thu: { name: 'Donnerstag', focus: 'Oberkörper + Rumpf', exercises: [
    { id: 'thu1', name: 'Bizeps Kabel', sets: 4, reps: '12', rest: '60s' },
    { id: 'thu2', name: 'Trizeps Kabel', sets: 4, reps: '12', rest: '60s' },
    { id: 'thu3', name: 'Face Pulls', sets: 4, reps: '15', rest: '45s' },
    { id: 'thu4', name: 'Rücken tief Kabel', sets: 4, reps: '15', rest: '60s' },
    { id: 'thu5', name: 'Beinheben', sets: 4, reps: '20', rest: '45s' },
    { id: 'thu6', name: 'Seitplank', sets: 3, reps: '30s/Seite', rest: '30s' },
  ]},
  fri: { name: 'Freitag', focus: 'Zirkel + Kondition', note: '3 Runden im Zirkel, danach die Laufband-Einheit.', exercises: [
    { id: 'fri1', name: 'Kniebeuge einbeinig (Zirkel)', sets: 3, reps: '45s', rest: '15s' },
    { id: 'fri2', name: 'Ausfallschritte (Zirkel)', sets: 3, reps: '45s', rest: '15s' },
    { id: 'fri3', name: 'Liegestütz (Zirkel)', sets: 3, reps: '45s', rest: '15s' },
    { id: 'fri4', name: 'Crunches (Zirkel)', sets: 3, reps: '45s', rest: '15s' },
    { id: 'fri5', name: 'Wandsitzen (Zirkel)', sets: 3, reps: '45s', rest: '60s' },
    { id: 'fri6', name: 'Laufband Grundlage', sets: 1, reps: '25 min', rest: '–' },
    { id: 'fri7', name: 'Sprints', sets: 5, reps: '30s', rest: '90s' },
  ]},
};

const ICONS = {
  flame: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.5-2-1-2 1 4-1 6-3 6-3 0-5-2-5-5 0-4 3-5 3-9 1 1 2 2 2 3z"></path></svg>',
  calendarCheck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 3v3M16 3v3"></path><path d="m8.5 14.5 2 2 4-4"></path></svg>',
  chevronLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>',
  chevronRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>',
  checkSmall: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1c1a19" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  checkTiny: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1a19" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
};

/* ── tiny DOM helpers ─────────────────────────────────────────────────── */

function h(tag, props, ...children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k === 'className') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'disabled') node.disabled = !!v;
      else if (k in node) { try { node[k] = v; } catch { node.setAttribute(k, v); } }
      else node.setAttribute(k, v);
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function icon(name) {
  const t = document.createElement('template');
  t.innerHTML = ICONS[name].trim();
  return t.content.firstElementChild;
}

/* ── date helpers ─────────────────────────────────────────────────────── */

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfWeek(d) { const r = new Date(d); const day = (r.getDay() + 6) % 7; r.setDate(r.getDate() - day); r.setHours(0, 0, 0, 0); return r; }
function stripTime(d) { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; }
function todayKeyOrMon() {
  const dow = new Date().getDay();
  return (dow >= 1 && dow <= 5) ? DAY_ORDER[dow - 1] : 'mon';
}
function weekRangeLabel(ws) {
  const we = addDays(ws, 4);
  const mn1 = MONTHS[ws.getMonth()], mn2 = MONTHS[we.getMonth()];
  return ws.getMonth() === we.getMonth()
    ? ws.getDate() + '.–' + we.getDate() + '. ' + mn2
    : ws.getDate() + '. ' + mn1 + ' – ' + we.getDate() + '. ' + mn2;
}

/* ── local persistence ────────────────────────────────────────────────── */

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { logs: {} };
  } catch (e) { return { logs: {} }; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}
function ensureClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

/* ── app state ────────────────────────────────────────────────────────── */

const state = {
  view: 'today',
  weekOffset: 0,
  selectedDayKey: todayKeyOrMon(),
  data: loadData(),
  notifPermission: (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported',
};

function getSetsArray(iso, exId, setsCount) {
  const log = state.data.logs[iso];
  const arr = log && log.exercises && log.exercises[exId];
  if (arr && arr.length === setsCount) return arr;
  return Array.from({ length: setsCount }, () => ({ done: false, weight: '' }));
}
function mutateSet(iso, exId, setsCount, idx, patch) {
  const data = JSON.parse(JSON.stringify(state.data));
  if (!data.logs[iso]) data.logs[iso] = { exercises: {} };
  const cur = data.logs[iso].exercises[exId];
  if (!cur || cur.length !== setsCount) {
    data.logs[iso].exercises[exId] = Array.from({ length: setsCount }, () => ({ done: false, weight: '' }));
  }
  data.logs[iso].exercises[exId][idx] = { ...data.logs[iso].exercises[exId][idx], ...patch };
  saveData(data);
  state.data = data;
}
function toggleSet(iso, dayKey, exId, setsCount, idx) {
  const cur = getSetsArray(iso, exId, setsCount)[idx];
  mutateSet(iso, exId, setsCount, idx, { done: !cur.done });
  render();
  syncDayStatus(iso, isDayFullyDone(iso, dayKey));
}
function setWeight(iso, exId, setsCount, idx, value) {
  mutateSet(iso, exId, setsCount, idx, { weight: value });
  render();
}

function isDayFullyDone(iso, dayKey) {
  return PLAN[dayKey].exercises.every(ex => getSetsArray(iso, ex.id, ex.sets).every(s => s.done));
}
function isWeekFullyDone(offset) {
  const ws = addDays(startOfWeek(new Date()), offset * 7);
  return DAY_ORDER.every((key, i) => isDayFullyDone(toISO(addDays(ws, i)), key));
}
function computeWeekStreak() {
  let offset = isWeekFullyDone(0) ? 0 : -1;
  let streak = 0;
  while (isWeekFullyDone(offset) && streak < 520) { streak++; offset--; }
  return streak;
}
function computeDayStreak() {
  const today = stripTime(new Date());
  let d = new Date(today);
  let streak = 0, guard = 0;
  while (guard < 1000) {
    guard++;
    const dow = d.getDay();
    if (dow === 0) { d = addDays(d, -2); continue; }
    if (dow === 6) { d = addDays(d, -1); continue; }
    const key = DAY_ORDER[dow - 1];
    const iso = toISO(d);
    const done = isDayFullyDone(iso, key);
    if (iso === toISO(today) && !done) { d = addDays(d, -1); continue; }
    if (!done) break;
    streak++;
    d = addDays(d, -1);
  }
  return streak;
}

/* ── backend sync (push subscriptions + completion status) ──────────────
   Real background push needs a server: it has to know (a) who to notify,
   and (b) whether today's workout is already done, independent of whether
   this tab is open. */

async function registerClientWithServer() {
  const clientId = ensureClientId();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, timezone, reminderHour: REMINDER_HOUR }),
    });
  } catch (e) { /* offline / server unreachable: local tracking still works */ }
}

async function syncDayStatus(iso, done) {
  const clientId = ensureClientId();
  try {
    await fetch('/api/day-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, iso, done }),
    });
  } catch (e) {}
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push wird von diesem Browser nicht unterstützt.');
  }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const res = await fetch('/api/vapid-public-key');
    if (!res.ok) throw new Error('VAPID-Key nicht verfügbar');
    const { publicKey } = await res.json();
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }
  const clientId = ensureClientId();
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, subscription: sub.toJSON() }),
  });
}

const requestNotifPermission = async () => {
  if (typeof Notification === 'undefined') return;
  const p = await Notification.requestPermission();
  state.notifPermission = p;
  render();
  if (p === 'granted') {
    await registerClientWithServer();
    try {
      await subscribeToPush();
      showToast('Erinnerungen aktiviert.');
    } catch (e) {
      console.error(e);
      showToast('Aktivierung fehlgeschlagen – bitte erneut versuchen.');
    }
  }
};

function showToast(msg, ms = 2600) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('is-visible'), ms);
}

/* ── derived view model (mirrors the design's renderVals()) ─────────────── */

function computeVals() {
  const today = stripTime(new Date());
  const viewedWeekStart = addDays(startOfWeek(new Date()), state.weekOffset * 7);

  const weekDates = DAY_ORDER.map((key, i) => {
    const d = addDays(viewedWeekStart, i);
    const iso = toISO(d);
    const done = isDayFullyDone(iso, key);
    const isToday = iso === toISO(today);
    const isFuture = d > today;
    const selected = key === state.selectedDayKey;
    return { key, shortLabel: SHORT[key], dateNum: d.getDate(), iso, done, isToday, isFuture, selected };
  });

  const selWd = weekDates.find(w => w.key === state.selectedDayKey) || weekDates[0];
  const dayPlan = PLAN[selWd.key];
  const exercises = dayPlan.exercises.map(ex => {
    const setsArr = getSetsArray(selWd.iso, ex.id, ex.sets);
    const doneCount = setsArr.filter(s => s.done).length;
    const allDone = doneCount === ex.sets;
    const setCells = setsArr.map((s, idx) => ({
      idx, label: idx + 1, done: s.done, weight: s.weight, disabled: selWd.isFuture,
    }));
    return {
      ...ex, setCells, doneCount, allDone,
      metaLabel: ex.sets + ' × ' + ex.reps,
      restLabel: 'Pause ' + ex.rest,
    };
  });
  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = exercises.reduce((a, e) => a + e.doneCount, 0);
  const dayDone = doneSets === totalSets;
  const selDay = {
    ...selWd, name: dayPlan.name, focus: dayPlan.focus, note: dayPlan.note || '', hasNote: !!dayPlan.note,
    statusLabel: dayDone ? 'Erledigt' : (selWd.isFuture ? 'Geplant' : doneSets + '/' + totalSets + ' Sätze'),
    dayDone,
  };

  const weekLabelText = (state.weekOffset === 0 ? 'Diese Woche' : state.weekOffset === -1 ? 'Letzte Woche' : (-state.weekOffset) + ' Wochen zuvor') + ' · ' + weekRangeLabel(viewedWeekStart);

  const historyWeeks = [];
  for (let off = 0; off > -HISTORY_WEEKS; off--) {
    const ws = addDays(startOfWeek(new Date()), off * 7);
    const days = DAY_ORDER.map((key, i) => {
      const d = addDays(ws, i);
      const iso = toISO(d);
      const isFuture = d > today;
      const isTodayCell = iso === toISO(today);
      const done = !isFuture && isDayFullyDone(iso, key);
      const pending = isTodayCell && !done && !isFuture;
      return {
        key, iso, disabled: isFuture, done, pending,
        title: PLAN[key].name + ' – ' + iso,
      };
    });
    historyWeeks.push({
      off,
      label: off === 0 ? 'Diese Woche' : off === -1 ? 'Letzte Woche' : (-off) + ' Wochen zuvor',
      range: weekRangeLabel(ws),
      days,
    });
  }

  const notifSupported = typeof Notification !== 'undefined';
  const perm = state.notifPermission;

  return {
    weekDates, selDay, exercises, weekLabelText, historyWeeks,
    nextWeekDisabled: state.weekOffset >= 0,
    dayStreak: computeDayStreak(),
    weekStreak: computeWeekStreak(),
    showNotifButton: notifSupported && perm === 'default',
    showNotifActive: notifSupported && perm === 'granted',
    showNotifBlocked: notifSupported && perm === 'denied',
  };
}

/* ── render ───────────────────────────────────────────────────────────── */

function renderHeader(vals) {
  return h('div', { className: 'header' },
    h('div', { className: 'header-kicker' }, 'Trainingsplan'),
    h('h1', { className: 'header-title' }, 'Mein 5-Tage Split'),
    h('div', { className: 'stats-row' },
      h('div', { className: 'stat-card' },
        icon('flame'),
        h('div', {},
          h('div', { className: 'stat-value' }, String(vals.dayStreak)),
          h('div', { className: 'stat-label' }, 'Tage Streak')),
      ),
      h('div', { className: 'stat-card' },
        icon('calendarCheck'),
        h('div', {},
          h('div', { className: 'stat-value' }, String(vals.weekStreak)),
          h('div', { className: 'stat-label' }, 'Wochen Streak')),
      ),
    ),
  );
}

function renderViewToggle() {
  const todayLabel = h('label', { className: 'seg-opt' },
    h('input', { type: 'radio', name: 'viewMode', checked: state.view === 'today', onChange: () => { state.view = 'today'; render(); } }),
    'Heute');
  const historyLabel = h('label', { className: 'seg-opt' },
    h('input', { type: 'radio', name: 'viewMode', checked: state.view === 'history', onChange: () => { state.view = 'history'; render(); } }),
    'Verlauf');
  return h('div', { className: 'view-toggle-wrap' },
    h('div', { className: 'seg' }, todayLabel, historyLabel));
}

function renderWeekDayPill(wd) {
  const classes = ['day-pill'];
  if (wd.selected) classes.push('is-selected');
  if (wd.isToday) classes.push('is-today');
  if (wd.isFuture) classes.push('is-future');
  if (wd.done) classes.push('is-done'); else if (!wd.isFuture) classes.push('is-pending');
  return h('button', {
    type: 'button', className: classes.join(' '),
    onClick: () => { state.selectedDayKey = wd.key; render(); },
  },
    h('span', { className: 'day-pill-label' }, wd.shortLabel),
    h('span', { className: 'day-pill-num' }, String(wd.dateNum)),
    h('span', { className: 'day-pill-dot' }),
  );
}

function renderSetCell(ex, iso, dayKey, cell) {
  return h('div', { className: 'set-cell' },
    h('span', { className: 'set-cell-label' }, 'Satz ' + cell.label),
    h('button', {
      type: 'button',
      className: 'set-toggle' + (cell.done ? ' is-done' : ''),
      disabled: cell.disabled,
      onClick: () => toggleSet(iso, dayKey, ex.id, ex.sets, cell.idx),
    }, cell.done ? icon('checkSmall') : null),
    h('input', {
      className: 'input set-weight', type: 'text', inputMode: 'decimal',
      placeholder: WEIGHT_UNIT, value: cell.weight, disabled: cell.disabled,
      onChange: (e) => setWeight(iso, ex.id, ex.sets, cell.idx, e.target.value),
    }),
  );
}

function renderExerciseCard(ex, iso, dayKey, isFuture) {
  const classes = ['exercise-card'];
  if (ex.allDone) classes.push('is-complete');
  if (isFuture) classes.push('is-future');
  return h('div', { className: classes.join(' ') },
    h('div', { className: 'exercise-head' },
      h('h3', { className: 'exercise-name' }, ex.name),
      h('span', { className: 'exercise-count' + (ex.allDone ? ' is-complete' : '') }, ex.doneCount + '/' + ex.sets),
    ),
    h('div', { className: 'exercise-meta' },
      h('span', {}, ex.metaLabel), h('span', {}, '·'), h('span', {}, ex.restLabel)),
    h('div', { className: 'exercise-sets' },
      ex.setCells.map(cell => renderSetCell(ex, iso, dayKey, cell))),
  );
}

function renderReminderCard(vals) {
  let statusNode = null;
  if (vals.showNotifButton) {
    statusNode = h('button', { type: 'button', className: 'btn btn-primary', style: { fontSize: '12px', padding: '6px 12px', flex: 'none' }, onClick: requestNotifPermission }, 'Aktivieren');
  } else if (vals.showNotifActive) {
    statusNode = h('span', { className: 'reminder-status is-active' }, 'Aktiv');
  } else if (vals.showNotifBlocked) {
    statusNode = h('span', { className: 'reminder-status is-blocked' }, 'Blockiert');
  }
  return h('div', { className: 'reminder-card' },
    icon('bell'),
    h('div', { className: 'reminder-body' },
      h('div', { className: 'reminder-title' }, 'Erinnerung um ' + REMINDER_HOUR + ' Uhr'),
      h('div', { className: 'reminder-sub' }, 'Nur Mo–Fr, wenn das Training noch offen ist · funktioniert auch im Hintergrund'),
    ),
    statusNode,
  );
}

function renderTodayPanel(vals) {
  const selWd = vals.selDay;
  const nodes = [
    h('div', { className: 'week-nav' },
      h('button', { type: 'button', className: 'icon-btn', onClick: () => { state.weekOffset -= 1; render(); } }, icon('chevronLeft')),
      h('span', { className: 'week-nav-label' }, vals.weekLabelText),
      h('button', { type: 'button', className: 'icon-btn', disabled: vals.nextWeekDisabled, onClick: () => { state.weekOffset = Math.min(0, state.weekOffset + 1); render(); } }, icon('chevronRight')),
    ),
    h('div', { className: 'week-days' }, vals.weekDates.map(renderWeekDayPill)),
    h('div', { className: 'day-head' },
      h('div', {},
        h('h2', { className: 'day-head-name' }, selWd.name),
        h('div', { className: 'day-head-focus' }, selWd.focus)),
      h('span', { className: 'day-status' + (selWd.dayDone ? ' is-done' : '') }, selWd.statusLabel),
    ),
  ];
  if (selWd.hasNote) nodes.push(h('p', { className: 'day-note' }, selWd.note));
  vals.exercises.forEach(ex => nodes.push(renderExerciseCard(ex, selWd.iso, selWd.key, selWd.isFuture)));
  nodes.push(renderReminderCard(vals));
  return h('div', { className: 'tab-panel' }, nodes);
}

function renderHistoryDay(dy) {
  const classes = ['history-day'];
  if (dy.done) classes.push('is-done');
  else if (dy.pending) classes.push('is-pending');
  return h('button', {
    type: 'button', className: classes.join(' '), disabled: dy.disabled, title: dy.title,
    onClick: dy.disabled ? null : () => { state.weekOffset = dy._off; state.selectedDayKey = dy.key; state.view = 'today'; render(); },
  }, dy.done ? icon('checkTiny') : (!dy.disabled && !dy.pending ? h('span', { className: 'history-day-dash' }) : null));
}

function renderHistoryWeekRow(wk) {
  wk.days.forEach(d => { d._off = wk.off; });
  return h('div', { className: 'history-week-row' },
    h('div', { className: 'history-week-info' },
      h('div', { className: 'history-week-label' }, wk.label),
      h('div', { className: 'history-week-range' }, wk.range)),
    h('div', { className: 'history-days' }, wk.days.map(renderHistoryDay)),
  );
}

function renderHistoryPanel(vals) {
  return h('div', { className: 'tab-panel' },
    h('div', { className: 'history-hint' }, 'Tippe auf einen Tag, um ihn zu bearbeiten.'),
    vals.historyWeeks.map(renderHistoryWeekRow),
  );
}

function render() {
  const vals = computeVals();
  const root = document.getElementById('app');
  root.replaceChildren(
    renderHeader(vals),
    renderViewToggle(),
    state.view === 'today' ? renderTodayPanel(vals) : renderHistoryPanel(vals),
  );
}

/* ── init ─────────────────────────────────────────────────────────────── */

async function init() {
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch (e) { console.error(e); }
  }
  render();

  registerClientWithServer();
  if (state.notifPermission === 'granted') {
    subscribeToPush().catch(e => console.error('push resubscribe failed', e));
  }
  const dow = new Date().getDay();
  if (dow >= 1 && dow <= 5) {
    const key = DAY_ORDER[dow - 1];
    const iso = toISO(stripTime(new Date()));
    syncDayStatus(iso, isDayFullyDone(iso, key));
  }
}

document.addEventListener('DOMContentLoaded', init);

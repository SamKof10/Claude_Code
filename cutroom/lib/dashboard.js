'use strict';

// Everything the home screen shows, in one request: totals, the latest
// renders with poster frames, projects by last activity, the running job and
// disk usage. Poster frames are made lazily for renders that lack one.

const fs = require('fs');
const os = require('os');
const path = require('path');
const store = require('./store');
const jobs = require('./jobs');
const { probe, poster } = require('./media');

const RECENT = 8;

// Runs fn over items with at most n in flight (ffprobe/ffmpeg are processes).
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// Walking a folder full of videos is cheap but not free; the home screen
// polls, so the result is reused for 30 s.
let sizeCache = { at: 0, value: 0 };
function dirSize(dir) {
  if (Date.now() - sizeCache.at < 30000) return sizeCache.value;
  let total = 0;
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
      if (!e.isFile()) continue;
      try {
        total += fs.statSync(path.join(e.parentPath ?? e.path, e.name)).size;
      } catch {
        // file vanished mid-walk
      }
    }
  } catch {
    // no data yet
  }
  sizeCache = { at: Date.now(), value: total };
  return total;
}

function freeSpace(dir) {
  try {
    const s = fs.statfsSync(dir);
    return s.bavail * s.bsize;
  } catch {
    return null;
  }
}

function displayName() {
  const raw = process.env.CUTROOM_NAME || os.userInfo().username || '';
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
}

async function posterUrl(id, version) {
  const dir = store.dir(id);
  const video = path.join(dir, 'renders', version.file);
  const jpg = video.replace(/\.mp4$/, '.jpg');
  try {
    // A frame about a third in shows content rather than an intro card.
    await poster(video, jpg, Math.min(version.duration * 0.35, 3));
    return `/media/${id}/renders/${path.basename(jpg)}`;
  } catch {
    return null;
  }
}

async function dashboard() {
  const projects = store.list().map((p) => store.get(p.id));
  const runningId = jobs.isRunning();

  const rows = await pool(projects, 2, async (p) => {
    const clipNames = store.clipFiles(p.id);
    const infos = await pool(clipNames, 4, (name) => probe(path.join(store.dir(p.id), 'clips', name)).catch(() => null));
    const last = p.versions[p.versions.length - 1] || null;
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: last?.createdAt || p.createdAt,
      clips: clipNames.length,
      rawSeconds: infos.reduce((sum, i) => sum + (i?.duration || 0), 0),
      versions: p.versions.length,
      last: last && { n: last.n, title: last.title, duration: last.duration, createdAt: last.createdAt },
      running: p.id === runningId,
    };
  });
  rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const recent = projects
    .flatMap((p) => p.versions.map((v) => ({ projectId: p.id, projectName: p.name, ...v })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT);

  const posters = new Map();
  const wanted = [...recent.map((v) => [v.projectId, v]), ...projects.filter((p) => p.versions.length).map((p) => [p.id, p.versions.at(-1)])];
  await pool(wanted, 2, async ([id, v]) => {
    const key = `${id}/${v.n}`;
    if (!posters.has(key)) posters.set(key, await posterUrl(id, v));
  });

  let running = null;
  if (runningId) {
    const snap = jobs.snapshot(runningId);
    running = {
      id: runningId,
      name: projects.find((p) => p.id === runningId)?.name || runningId,
      status: snap.status,
      label: snap.label,
      last: snap.log[snap.log.length - 1]?.text || '',
      progress: snap.progress,
    };
  }

  return {
    name: displayName(),
    running,
    totals: {
      projects: rows.length,
      versions: rows.reduce((s, r) => s + r.versions, 0),
      clips: rows.reduce((s, r) => s + r.clips, 0),
      rawSeconds: rows.reduce((s, r) => s + r.rawSeconds, 0),
      cutSeconds: rows.reduce((s, r) => s + (r.last?.duration || 0), 0),
    },
    storage: { used: dirSize(store.DATA_DIR), free: freeSpace(store.DATA_DIR), dir: store.DATA_DIR },
    recent: recent.map((v) => ({
      projectId: v.projectId,
      projectName: v.projectName,
      n: v.n,
      title: v.title,
      duration: v.duration,
      width: v.width,
      height: v.height,
      createdAt: v.createdAt,
      mode: v.mode,
      request: v.request,
      poster: posters.get(`${v.projectId}/${v.n}`) || null,
    })),
    projects: rows.map((r) => ({ ...r, poster: r.last ? posters.get(`${r.id}/${r.last.n}`) || null : null })),
  };
}

module.exports = { dashboard };

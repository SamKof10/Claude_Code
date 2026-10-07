'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const store = require('./lib/store');
const jobs = require('./lib/jobs');
const media = require('./lib/media');
const agent = require('./lib/agent');
const tools = require('./lib/tools');
const { dashboard } = require('./lib/dashboard');

const PORT = Number(process.env.PORT || 4317);
// Local only: the app drives your personal Claude login, so it must never be
// reachable from other machines.
const HOST = '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
};

const ASPECTS = ['9:16', '16:9', '1:1', '4:5', 'source'];
const AUDIO_MODES = ['original', 'music', 'mix'];
const LOOKS = ['none', 'auto', 'neutral_punch', 'warm_cinematic'];
const CAPTIONS = ['none', 'bold', 'clean'];
const MOTION = ['none', 'titles', 'explain', 'auto'];

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1e6) throw Object.assign(new Error('Anfrage zu groß'), { status: 413 });
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error('Ungültiges JSON'), { status: 400 });
  }
}

// Streams a file with HTTP range support, which <video> needs for seeking.
function serveFile(req, res, file) {
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return send(res, 404, { error: 'Datei nicht gefunden' });
  }
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  if (new URL(req.url, 'http://x').searchParams.has('download')) {
    headers['Content-Disposition'] = `attachment; filename="${path.basename(file)}"`;
  }
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : stat.size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start >= stat.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  fs.createReadStream(file).pipe(res);
}

// Uploads arrive as the raw request body (one file per request), so no
// multipart parser is needed and multi-GB clips stream straight to disk.
function receiveUpload(req, folder, name) {
  return new Promise((resolve, reject) => {
    const target = path.join(folder, store.safeName(name, folder));
    const partial = `${path.dirname(target)}/.${path.basename(target)}.upload`;
    const out = fs.createWriteStream(partial);
    const fail = (err) => {
      out.destroy();
      fs.rmSync(partial, { force: true });
      reject(err);
    };
    req.on('aborted', () => fail(new Error('Upload abgebrochen')));
    req.on('error', fail);
    out.on('error', fail);
    out.on('finish', () => {
      fs.renameSync(partial, target);
      resolve(path.basename(target));
    });
    req.pipe(out);
  });
}

async function clipList(id) {
  const dir = store.dir(id);
  return Promise.all(
    store.clipFiles(id).map(async (name) => {
      try {
        const info = await media.probe(path.join(dir, 'clips', name));
        return { name, ...info, size: fs.statSync(path.join(dir, 'clips', name)).size };
      } catch (err) {
        return { name, error: 'Datei nicht lesbar' };
      }
    }),
  );
}

async function projectView(id) {
  const project = store.get(id);
  const music = store.musicFile(id);
  let musicInfo = null;
  if (music) {
    try {
      musicInfo = { name: music, ...(await media.probe(path.join(store.dir(id), 'music', music))) };
    } catch {
      musicInfo = { name: music, error: 'Datei nicht lesbar' };
    }
  }
  return { ...project, clips: await clipList(id), music: musicInfo, job: jobs.snapshot(id) };
}

function cleanSettings(input = {}) {
  return {
    aspect: ASPECTS.includes(input.aspect) ? input.aspect : '9:16',
    length: Math.max(0, Math.min(900, Math.round(Number(input.length) || 0))),
    audio: AUDIO_MODES.includes(input.audio) ? input.audio : 'original',
    brief: String(input.brief || '').slice(0, 4000),
    look: LOOKS.includes(input.look) ? input.look : 'none',
    captions: CAPTIONS.includes(input.captions) ? input.captions : 'none',
    motion: MOTION.includes(input.motion) ? input.motion : 'none',
    review: Boolean(input.review),
  };
}

let healthCache = null;
async function health() {
  if (healthCache && Date.now() - healthCache.at < 30000) return healthCache.value;
  const [claude, ffmpeg, ffprobe, watch] = await Promise.all([
    agent.authStatus(),
    media.run('ffmpeg', ['-version']).then((o) => o.split('\n')[0].split(' ')[2], () => null),
    media.run('ffprobe', ['-version']).then(() => true, () => false),
    media.run('watch-skill', ['--version']).then((o) => o.trim().split(/\s+/).pop(), () => null),
  ]);
  const value = {
    claude,
    model: agent.MODEL,
    apiKeyIgnored: agent.strippedApiKey(),
    ffmpeg: ffmpeg && ffprobe ? ffmpeg : null,
    watchSkill: watch,
    addons: tools.status(),
    dataDir: store.DATA_DIR,
  };
  // A failed Claude probe is often momentary (update, slow start) — only a
  // healthy answer is cached, so the next poll checks again.
  healthCache = claude.ok ? { at: Date.now(), value } : null;
  return value;
}

const routes = [
  ['GET', /^\/api\/health$/, async (req, res) => send(res, 200, await health())],
  ['GET', /^\/api\/dashboard$/, async (req, res) => send(res, 200, await dashboard())],
  ['GET', /^\/api\/projects$/, async (req, res) => send(res, 200, { projects: store.list(), running: jobs.isRunning() })],
  [
    'POST',
    /^\/api\/projects$/,
    async (req, res) => {
      const { name } = await readJson(req);
      send(res, 201, await projectView(store.create(name).id));
    },
  ],
  ['GET', /^\/api\/projects\/([\w-]+)$/, async (req, res, id) => send(res, 200, await projectView(id))],
  [
    'PATCH',
    /^\/api\/projects\/([\w-]+)$/,
    async (req, res, id) => {
      const body = await readJson(req);
      const project = store.get(id);
      if (typeof body.name === 'string' && body.name.trim()) project.name = body.name.trim().slice(0, 80);
      if (body.settings) project.settings = cleanSettings(body.settings);
      store.save(project);
      send(res, 200, await projectView(id));
    },
  ],
  [
    'DELETE',
    /^\/api\/projects\/([\w-]+)$/,
    async (req, res, id) => {
      if (jobs.isRunning() === id) return send(res, 409, { error: 'Läuft gerade — erst abbrechen.' });
      store.get(id);
      store.remove(id);
      send(res, 200, { ok: true });
    },
  ],
  [
    'PUT',
    /^\/api\/projects\/([\w-]+)\/(clips|music)$/,
    async (req, res, id, kind) => {
      const name = new URL(req.url, 'http://x').searchParams.get('name') || '';
      const ext = path.extname(name).toLowerCase();
      const allowed = kind === 'clips' ? store.VIDEO_EXT : store.AUDIO_EXT;
      if (!allowed.has(ext)) return send(res, 415, { error: `${ext || 'Dateityp'} wird nicht unterstützt` });
      const folder = path.join(store.dir(id), kind);
      store.get(id);
      if (kind === 'music') {
        for (const old of fs.readdirSync(folder)) fs.rmSync(path.join(folder, old), { force: true });
      }
      const saved = await receiveUpload(req, folder, name);
      try {
        await media.probe(path.join(folder, saved));
      } catch {
        fs.rmSync(path.join(folder, saved), { force: true });
        return send(res, 422, { error: `${name} lässt sich nicht lesen — ist das wirklich ein ${kind === 'clips' ? 'Video' : 'Audio'}?` });
      }
      send(res, 201, { name: saved });
    },
  ],
  [
    'DELETE',
    /^\/api\/projects\/([\w-]+)\/(clips|music)\/([^/]+)$/,
    async (req, res, id, kind, file) => {
      const name = path.basename(decodeURIComponent(file));
      fs.rmSync(path.join(store.dir(id), kind, name), { force: true });
      send(res, 200, { ok: true });
    },
  ],
  [
    'POST',
    /^\/api\/projects\/([\w-]+)\/cut$/,
    async (req, res, id) => {
      const settings = cleanSettings(await readJson(req));
      jobs.start(id, { mode: 'cut', settings });
      send(res, 202, { ok: true });
    },
  ],
  [
    'POST',
    /^\/api\/projects\/([\w-]+)\/revise$/,
    async (req, res, id) => {
      const { feedback, from } = await readJson(req);
      if (!String(feedback || '').trim()) return send(res, 400, { error: 'Was soll anders werden?' });
      jobs.start(id, { mode: 'revise', feedback: String(feedback).trim().slice(0, 4000), from: Number(from) || null });
      send(res, 202, { ok: true });
    },
  ],
  ['POST', /^\/api\/projects\/([\w-]+)\/cancel$/, async (req, res, id) => send(res, 200, { ok: jobs.cancel(id) })],
  [
    'GET',
    /^\/api\/projects\/([\w-]+)\/events$/,
    async (req, res, id) => {
      store.get(id);
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      const push = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);
      push({ type: 'snapshot', job: jobs.snapshot(id) });
      const unsubscribe = jobs.subscribe(id, push);
      const ping = setInterval(() => res.write(': ping\n\n'), 20000);
      req.on('close', () => {
        clearInterval(ping);
        unsubscribe();
      });
    },
  ],
  [
    'GET',
    /^\/media\/([\w-]+)\/(clips|music|renders)\/([^/]+)$/,
    async (req, res, id, kind, file) => serveFile(req, res, path.join(store.dir(id), kind, path.basename(decodeURIComponent(file)))),
  ],
];

// Blocks other websites from driving the app through your browser: writes
// need a custom header (which forces a CORS preflight we never answer), and
// the Host check stops DNS-rebinding tricks.
function trusted(req) {
  const host = String(req.headers.host || '').replace(/:\d+$/, '');
  if (!['localhost', '127.0.0.1'].includes(host)) return false;
  return req.method === 'GET' || req.headers['x-cutroom'] === '1';
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  if (!trusted(req)) return send(res, 403, { error: 'Nur lokal aus der Cutroom-Oberfläche erlaubt.' });
  try {
    for (const [method, pattern, handler] of routes) {
      const match = req.method === method && pattern.exec(pathname);
      if (match) return await handler(req, res, ...match.slice(1));
    }
    if (req.method !== 'GET') return send(res, 404, { error: 'Unbekannte Route' });
    const file = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : path.normalize(pathname));
    if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return send(res, 404, { error: 'Nicht gefunden' });
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    if (!res.headersSent) send(res, err.status || 500, { error: err.message });
    else res.end();
  }
});

// Claude runs detached (own process group), so take it down with the app.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    jobs.cancelAll();
    setTimeout(() => process.exit(0), 300);
  });
}

server.listen(PORT, HOST, () => {
  console.log(`\n  Cutroom läuft auf http://localhost:${PORT}`);
  console.log(`  Projekte liegen in ${path.join(store.DATA_DIR, 'projects')}\n`);
  if (agent.strippedApiKey()) {
    console.log('  Hinweis: ANTHROPIC_API_KEY ist gesetzt, wird für Claude aber ignoriert — es läuft über dein Abo.\n');
  }
});

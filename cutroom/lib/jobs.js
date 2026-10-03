'use strict';

const fs = require('fs');
const path = require('path');
const store = require('./store');
const prompts = require('./prompts');
const { validate } = require('./edl');
const { probe, render, killTree } = require('./media');
const { runClaude } = require('./agent');

const AGENT_DIR = path.join(__dirname, '..', 'agent');
const MAX_FIX_ROUNDS = 2;

// One live state per project; only one job runs at a time so parallel cuts
// don't drain the Pro limit twice as fast.
const jobs = new Map();
let runningId = null;

function job(id) {
  if (!jobs.has(id)) jobs.set(id, { status: 'idle', label: '', log: [], progress: null, listeners: new Set(), children: new Set() });
  return jobs.get(id);
}

function snapshot(id) {
  const j = job(id);
  return { status: j.status, label: j.label, log: j.log, progress: j.progress, error: j.error || null };
}

function broadcast(j, event) {
  for (const fn of j.listeners) fn(event);
}

function subscribe(id, fn) {
  const j = job(id);
  j.listeners.add(fn);
  return () => j.listeners.delete(fn);
}

function setStatus(j, status, label = '') {
  j.status = status;
  j.label = label;
  if (status !== 'render') j.progress = null;
  broadcast(j, { type: 'status', status, label });
}

function log(j, entry) {
  // Frame reads arrive in bursts of 20+; fold them into one counting line.
  const last = j.log[j.log.length - 1];
  if (entry.frame && last?.frame) {
    last.count += 1;
    last.text = `Sieht sich ${last.count} Frames an`;
    return broadcast(j, { type: 'log', entry: last });
  }
  const item = { id: j.log.length, t: Date.now(), ...entry };
  if (entry.frame) Object.assign(item, { count: 1, text: 'Sieht sich 1 Frame an' });
  j.log.push(item);
  broadcast(j, { type: 'log', entry: item });
}

function isRunning() {
  return runningId;
}

function start(id, opts) {
  if (runningId) {
    throw Object.assign(new Error(runningId === id ? 'Hier läuft schon ein Schnitt.' : 'Ein anderes Projekt wird gerade geschnitten — bitte warten.'), { status: 409 });
  }
  const project = store.get(id);
  if (opts.mode === 'revise' && !project.versions.length) {
    throw Object.assign(new Error('Es gibt noch keine Version zum Überarbeiten.'), { status: 400 });
  }
  const j = job(id);
  Object.assign(j, { log: [], error: null, progress: null, cancelled: false });
  runningId = id;
  setStatus(j, 'agent', 'Claude sieht sich die Clips an');

  execute(j, project, opts)
    .catch((err) => {
      j.error = j.cancelled ? 'Abgebrochen.' : err.message;
      log(j, { icon: 'error', text: j.error });
      setStatus(j, 'error', j.error);
    })
    .finally(() => {
      runningId = null;
      j.children.clear();
    });
}

function cancel(id) {
  const j = job(id);
  if (runningId !== id) return false;
  j.cancelled = true;
  for (const child of j.children) killTree(child);
  return true;
}

function cancelAll() {
  if (runningId) cancel(runningId);
}

async function execute(j, project, opts) {
  const dir = store.dir(project.id);
  const track = (child) => {
    j.children.add(child);
    child.on('close', () => j.children.delete(child));
  };
  const onEvent = (entry) => log(j, entry);
  // A cancel can land between child processes; stop before the next costly step.
  const stillWanted = () => {
    if (j.cancelled) throw new Error('Abgebrochen.');
  };

  // Fresh agent instructions + watch skill on every run, so edits to
  // agent/CLAUDE.md apply to old projects too.
  fs.cpSync(AGENT_DIR, dir, { recursive: true, force: true });

  const clipNames = store.clipFiles(project.id);
  if (!clipNames.length) throw new Error('Noch keine Clips hochgeladen.');
  const clips = {};
  for (const name of clipNames) clips[name] = await probe(path.join(dir, 'clips', name));
  const musicName = store.musicFile(project.id);
  const music = musicName ? { name: musicName, ...(await probe(path.join(dir, 'music', musicName))) } : null;
  const editPath = path.join(dir, 'edit.json');

  let prompt;
  let freshPrompt = null;
  let resume = null;
  let base = null;
  if (opts.mode === 'cut') {
    project.settings = opts.settings;
    project.sessionId = null;
    fs.rmSync(editPath, { force: true });
    prompt = prompts.cut({ settings: project.settings, clips, music });
  } else {
    base = project.versions.find((v) => v.n === opts.from) || project.versions[project.versions.length - 1];
    fs.copyFileSync(path.join(dir, 'edits', `v${base.n}.json`), editPath);
    const newClips = clipNames.filter((n) => !project.knownClips.includes(n));
    const args = { base, feedback: opts.feedback, newClips, clips, music, settings: project.settings };
    prompt = prompts.revise({ ...args, fresh: !project.sessionId });
    resume = project.sessionId;
    freshPrompt = prompts.revise({ ...args, fresh: true });
  }
  store.save(project);
  log(j, { icon: 'start', text: opts.mode === 'cut' ? `Neuer Schnitt mit ${clipNames.length} Clip(s)` : `Überarbeite v${base.n}: „${opts.feedback}"` });

  stillWanted();
  let r = await runClaude({ cwd: dir, prompt, resume, onEvent, track });
  if (!r.ok && resume && !r.cancelled && /no conversation|not found|session/i.test(r.raw || '')) {
    log(j, { icon: 'tool', text: 'Alte Sitzung abgelaufen — starte eine neue mit dem Index' });
    r = await runClaude({ cwd: dir, prompt: freshPrompt, onEvent, track });
  }
  if (!r.ok) throw new Error(r.error);
  const reply = r.result;
  project.sessionId = r.sessionId;
  project.knownClips = clipNames;
  store.save(project);

  let edit;
  for (let round = 0; ; round++) {
    let raw = null;
    let errors;
    try {
      raw = JSON.parse(fs.readFileSync(editPath, 'utf8'));
    } catch (err) {
      errors = [`edit.json fehlt oder ist kein gültiges JSON (${err.message}).`];
    }
    if (!errors) ({ edit, errors } = validate(raw, clips));
    if (!errors.length) break;
    if (round >= MAX_FIX_ROUNDS) throw new Error(`Schnittliste unbrauchbar: ${errors.join(' ')}`);
    stillWanted();
    log(j, { icon: 'error', text: `Schnittliste hat ${errors.length} Fehler — Claude korrigiert` });
    r = await runClaude({ cwd: dir, prompt: prompts.fix(errors), resume: project.sessionId, onEvent, track });
    if (!r.ok) throw new Error(r.error);
  }

  stillWanted();
  setStatus(j, 'render', 'Rendern');
  log(j, { icon: 'cut', text: `Rendert ${edit.segments.length} Segmente · ${edit.duration.toFixed(1)} s` });
  const n = project.versions.reduce((max, v) => Math.max(max, v.n), 0) + 1;
  const result = await render({
    clipsDir: path.join(dir, 'clips'),
    edit,
    clips,
    musicFile: music ? path.join(dir, 'music', music.name) : null,
    outFile: path.join(dir, 'renders', `v${n}.mp4`),
    track,
    onProgress: (p) => {
      j.progress = p;
      broadcast(j, { type: 'progress', progress: p });
    },
  });
  fs.writeFileSync(path.join(dir, 'edits', `v${n}.json`), JSON.stringify(edit, null, 2));

  const version = {
    n,
    file: `v${n}.mp4`,
    createdAt: new Date().toISOString(),
    mode: opts.mode,
    from: base?.n ?? null,
    request: opts.mode === 'cut' ? project.settings.brief : opts.feedback,
    title: edit.title,
    summary: edit.summary,
    reply,
    duration: result.duration,
    width: result.width,
    height: result.height,
    segments: edit.segments,
  };
  const fresh = store.get(project.id);
  fresh.versions.push(version);
  fresh.sessionId = project.sessionId;
  fresh.knownClips = project.knownClips;
  store.save(fresh);

  log(j, { icon: 'done', text: `Fertig: v${n} · ${result.duration.toFixed(1)} s` });
  broadcast(j, { type: 'version', version });
  setStatus(j, 'done', `v${n} ist fertig`);
}

module.exports = { start, cancel, cancelAll, snapshot, subscribe, isRunning };

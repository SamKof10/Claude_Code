'use strict';

const fs = require('fs');
const path = require('path');
const store = require('./store');
const prompts = require('./prompts');
const { validate } = require('./edl');
const { probe, render, killTree, outputSize } = require('./media');
const tools = require('./tools');
const { ensureTranscripts } = require('./transcribe');
const { buildSrt, forceStyle } = require('./captions');
const { runClaude } = require('./agent');

const AGENT_DIR = path.join(__dirname, '..', 'agent');
const MAX_FIX_ROUNDS = 2;
const DEFAULT_EXTRAS = { look: 'none', captions: 'none', motion: 'none', review: false };

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

  // Fresh agent instructions, tools and skills on every run, so edits to
  // agent/ apply to old projects too.
  fs.cpSync(AGENT_DIR, dir, { recursive: true, force: true });

  const clipNames = store.clipFiles(project.id);
  if (!clipNames.length) throw new Error('Noch keine Clips hochgeladen.');
  const clips = {};
  for (const name of clipNames) clips[name] = await probe(path.join(dir, 'clips', name));
  const musicName = store.musicFile(project.id);
  const music = musicName ? { name: musicName, ...(await probe(path.join(dir, 'music', musicName))) } : null;
  const editPath = path.join(dir, 'edit.json');
  const addons = tools.status();

  if (opts.mode === 'cut') project.settings = opts.settings;
  const settings = { ...DEFAULT_EXTRAS, ...project.settings };
  const size = outputSize(settings.aspect, clips[clipNames[0]]);

  // Captions need word-level transcripts; making them first also lets
  // Claude cut on word boundaries (video-use's "read, don't watch").
  let transcripts = null;
  if (settings.captions !== 'none') {
    stillWanted();
    transcripts = await transcribeSafely({ dir, clips, j, track });
  }

  let prompt;
  let freshPrompt = null;
  let resume = null;
  let base = null;
  const context = { clips, music, settings, size, tools: addons, transcripts };
  if (opts.mode === 'cut') {
    project.sessionId = null;
    fs.rmSync(editPath, { force: true });
    prompt = prompts.cut(context);
  } else {
    base = project.versions.find((v) => v.n === opts.from) || project.versions[project.versions.length - 1];
    fs.copyFileSync(path.join(dir, 'edits', `v${base.n}.json`), editPath);
    const newClips = clipNames.filter((n) => !project.knownClips.includes(n));
    const args = { ...context, base, feedback: opts.feedback, newClips };
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

  // Reads edit.json and checks it against the clips plus whatever overlays
  // Claude rendered under overlays/.
  const defaults = { captions: settings.captions, grade: settings.look === 'auto' ? 'none' : settings.look };
  const readEdit = async () => {
    const all = { ...clips, ...(await overlayClips(dir)) };
    try {
      return { all, ...validate(JSON.parse(fs.readFileSync(editPath, 'utf8')), all, defaults) };
    } catch (err) {
      return { all, errors: [`edit.json fehlt oder ist kein gültiges JSON (${err.message}).`] };
    }
  };

  let checked;
  for (let round = 0; ; round++) {
    checked = await readEdit();
    if (!checked.errors.length) break;
    if (round >= MAX_FIX_ROUNDS) throw new Error(`Schnittliste unbrauchbar: ${checked.errors.join(' ')}`);
    stillWanted();
    log(j, { icon: 'error', text: `Schnittliste hat ${checked.errors.length} Fehler — Claude korrigiert` });
    r = await runClaude({ cwd: dir, prompt: prompts.fix(checked.errors), resume: project.sessionId, onEvent, track });
    if (!r.ok) throw new Error(r.error);
  }

  const n = project.versions.reduce((max, v) => Math.max(max, v.n), 0) + 1;
  const outFile = path.join(dir, 'renders', `v${n}.mp4`);
  const renderEdit = async ({ edit, all }) => {
    stillWanted();
    setStatus(j, 'render', 'Rendern');
    const extras = [
      edit.output.grade !== 'none' && `Look ${edit.output.grade.length > 20 ? 'eigener Filter' : edit.output.grade}`,
      edit.overlays.length && `${edit.overlays.length} Animation(en)`,
      edit.captions !== 'none' && `Untertitel ${edit.captions}`,
    ].filter(Boolean);
    log(j, { icon: 'cut', text: `Rendert ${edit.segments.length} Segmente · ${edit.duration.toFixed(1)} s${extras.length ? ` · ${extras.join(' · ')}` : ''}` });
    const srt = await captionsFor({ dir, edit, all, j, track });
    return render({
      dir,
      edit,
      clips: all,
      musicFile: music ? path.join(dir, 'music', music.name) : null,
      srt,
      outFile,
      track,
      onProgress: (p) => {
        j.progress = p;
        broadcast(j, { type: 'progress', progress: p });
      },
    });
  };

  let result = await renderEdit(checked);
  let review = null;

  // Self-check (video-use): Claude looks at its own render before you do.
  if (settings.review) {
    stillWanted();
    setStatus(j, 'agent', 'Selbstkontrolle');
    log(j, { icon: 'watch', text: 'Selbstkontrolle: Claude prüft das fertige Video' });
    let at = 0;
    const cuts = checked.edit.segments.slice(0, -1).map((s) => (at += (s.end - s.start) / s.speed));
    r = await runClaude({ cwd: dir, prompt: prompts.review({ n, cuts, tools: addons }), resume: project.sessionId, onEvent, track });
    if (!r.ok) {
      log(j, { icon: 'error', text: `Selbstkontrolle übersprungen: ${r.error}` });
    } else if (/^\s*KORRIGIERT/i.test(r.result)) {
      const again = await readEdit();
      if (again.errors.length) {
        log(j, { icon: 'error', text: 'Korrektur der Selbstkontrolle war ungültig — erste Fassung bleibt' });
      } else {
        review = r.result.replace(/^\s*KORRIGIERT:?\s*/i, '');
        checked = again;
        result = await renderEdit(checked);
      }
    } else {
      review = 'Geprüft, alles in Ordnung.';
      log(j, { icon: 'done', text: 'Selbstkontrolle: alles in Ordnung' });
    }
  }

  const { edit } = checked;
  fs.writeFileSync(path.join(dir, 'edits', `v${n}.json`), JSON.stringify(edit, null, 2));
  const version = {
    n,
    file: `v${n}.mp4`,
    createdAt: new Date().toISOString(),
    mode: opts.mode,
    from: base?.n ?? null,
    request: opts.mode === 'cut' ? settings.brief : opts.feedback,
    title: edit.title,
    summary: edit.summary,
    reply,
    review,
    duration: result.duration,
    width: result.width,
    height: result.height,
    grade: edit.output.grade,
    captions: edit.captions,
    overlays: edit.overlays,
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

// Transcription is a nice-to-have: if it fails, the cut still happens.
async function transcribeSafely({ dir, clips, j, track }) {
  try {
    return await ensureTranscripts({ dir, clips, track, onLog: (e) => log(j, e) });
  } catch (err) {
    if (j.cancelled) throw err;
    log(j, { icon: 'error', text: `Transkription fehlgeschlagen — ohne Untertitel weiter (${err.message.slice(0, 160)})` });
    return null;
  }
}

async function captionsFor({ dir, edit, all, j, track }) {
  if (edit.captions === 'none') return null;
  if (!tools.ffmpegFilters().subtitles) {
    log(j, { icon: 'error', text: 'Dein ffmpeg kann keine Untertitel einbrennen (libass fehlt) — sie fallen weg' });
    return null;
  }
  const uploaded = Object.fromEntries(Object.entries(all).filter(([k]) => !k.startsWith('overlays/')));
  const transcripts = await transcribeSafely({ dir, clips: uploaded, j, track });
  const built = transcripts && buildSrt(edit, transcripts);
  if (!built) return null;
  const [W, H] = outputSize(edit.output.aspect, all[edit.segments[0].clip]);
  return { text: built.srt, style: forceStyle(edit.captions, W, H) };
}

// Videos the agent rendered with HyperFrames (overlays/<id>/…). They can be
// layered on top (edit.overlays) or used as full-frame segments.
async function overlayClips(dir) {
  const found = {};
  const walk = async (rel, depth) => {
    let entries;
    try {
      entries = fs.readdirSync(path.join(dir, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const child = `${rel}/${e.name}`;
      if (e.isDirectory() && depth < 4) await walk(child, depth + 1);
      else if (e.isFile() && /\.(mov|webm|mp4)$/i.test(e.name)) {
        try {
          found[child] = await probe(path.join(dir, child));
        } catch {
          // half-written render — ignore
        }
      }
    }
  };
  await walk('overlays', 0);
  return found;
}

module.exports = { start, cancel, cancelAll, snapshot, subscribe, isRunning };

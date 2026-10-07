'use strict';

const $ = (sel) => document.querySelector(sel);
const PALETTE = ['#ff8a5c', '#5cc8ff', '#b78cff', '#6be3a4', '#ffd166', '#ff7eb6', '#7fd1c7', '#c3d36b'];
const ICONS = { start: '▶', watch: '◉', frame: '▦', ask: '?', tool: '›', cut: '✂', motion: '✦', say: '“', done: '✓', error: '!' };
const LOOK_NAMES = { neutral_punch: 'Clean', warm_cinematic: 'Cinematic', subtle: 'Subtil' };

const state = {
  health: null,
  projects: [],
  running: null,
  project: null,
  version: null,
  uploads: new Map(), // name -> { fraction }
  events: null,
};

// ---------- helpers ----------

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const child of children.flat()) if (child !== null && child !== undefined) node.append(child);
  return node;
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'X-Cutroom': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
  return data;
}

let toastTimer;
function toast(message, isError = false) {
  const node = $('#toast');
  node.textContent = message;
  node.className = `toast${isError ? ' err' : ''}`;
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (node.hidden = true), isError ? 7000 : 3500);
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const secs = (n) => `${n.toFixed(1).replace('.', ',')} s`;
const tc = (n) => {
  const m = Math.floor(n / 60);
  const s = (n % 60).toFixed(1).padStart(4, '0');
  return `${String(m).padStart(2, '0')}:${s}`;
};
const mb = (bytes) => (bytes > 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : `${Math.max(0.1, bytes / 1e6).toFixed(bytes < 1e7 ? 1 : 0)} MB`);
const clipColor = (name) => {
  const names = (state.project?.clips || []).map((c) => c.name);
  const i = names.indexOf(name);
  return PALETTE[(i < 0 ? names.length : i) % PALETTE.length];
};

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ---------- health ----------

async function loadHealth() {
  try {
    state.health = await api('/api/health');
  } catch {
    state.health = null;
  }
  renderHealth();
}

function renderHealth() {
  const h = state.health;
  const box = $('#health');
  box.replaceChildren();
  if (!h) return box.append(el('span', { class: 'pill err', text: 'Server nicht erreichbar' }));

  const c = h.claude;
  if (!c.ok) box.append(el('span', { class: 'pill err', text: claudeProblem(c).short, title: claudeProblem(c).fix }));
  else if (!c.loggedIn) box.append(el('span', { class: 'pill err', text: 'Claude nicht angemeldet', title: 'Im Terminal: claude → /login' }));
  else if (!c.subscription) box.append(el('span', { class: 'pill warn', text: `Claude via ${c.method}`, title: 'Läuft nicht über das Abo — mit /login dein Pro-Konto verbinden' }));
  else box.append(el('span', { class: 'pill ok', text: `Claude Pro · ${h.model}`, title: `Claude Code ${c.version} · ${c.method}` }));

  if (h.apiKeyIgnored) box.append(el('span', { class: 'pill warn', text: 'API-Key ignoriert', title: 'ANTHROPIC_API_KEY ist gesetzt, Cutroom nutzt trotzdem dein Abo' }));
  box.append(
    h.watchSkill
      ? el('span', { class: 'pill ok', text: `watch-skill ${h.watchSkill}` })
      : el('span', { class: 'pill err', text: 'watch-skill fehlt', title: 'uv tool install "watch-skill[perceive,whisper,ocr]"' }),
  );
  box.append(h.ffmpeg ? el('span', { class: 'pill ok', text: `ffmpeg ${h.ffmpeg}` }) : el('span', { class: 'pill err', text: 'ffmpeg fehlt', title: 'brew install ffmpeg' }));
  const a = h.addons || {};
  box.append(
    el('span', { class: `pill ${a.videoUse ? 'ok' : ''}`, text: 'video-use', title: a.videoUse ? 'Timeline-Ansicht und Grades bereit' : 'Nicht installiert — npm run setup' }),
    el('span', { class: `pill ${a.hyperframes ? 'ok' : ''}`, text: 'HyperFrames', title: a.hyperframes ? `Version ${a.hyperframesVersion}` : 'Nicht installiert — npm run setup' }),
  );
  renderCutHint();
  if (state.project) renderSettings();
  renderSystem();
}

// Why the Claude probe failed, in words — "missing" is rarely the truth.
function claudeProblem(c) {
  if (c.reason === 'missing') return { short: 'Claude Code nicht gefunden', fix: 'Im Terminal „which claude“ prüfen; ist es da, Cutroom aus demselben Terminal neu starten' };
  if (c.reason === 'timeout') return { short: 'Claude antwortet nicht', fix: 'Läuft vielleicht gerade ein Update — kurz warten, die Anzeige prüft von selbst neu' };
  return { short: 'Claude Code meldet einen Fehler', fix: c.detail || 'Im Terminal „claude --version“ ausführen und die Meldung ansehen' };
}

function blocker() {
  const h = state.health;
  if (!h) return 'Server nicht erreichbar.';
  if (!h.claude.ok) return `${claudeProblem(h.claude).short}: ${claudeProblem(h.claude).fix}`;
  if (!h.claude.loggedIn) return 'Claude Code ist nicht angemeldet: im Terminal `claude` starten, /login.';
  if (!h.watchSkill) return 'watch-skill fehlt (siehe README).';
  if (!h.ffmpeg) return 'ffmpeg fehlt: brew install ffmpeg.';
  return null;
}

// ---------- projects ----------

async function loadProjects() {
  const data = await api('/api/projects');
  state.projects = data.projects;
  state.running = data.running;
  renderProjects();
}

function renderProjects() {
  const nav = $('#projectList');
  nav.replaceChildren(
    ...state.projects.map((p) =>
      el(
        'a',
        { href: `#${p.id}`, class: p.id === state.project?.id ? 'active' : null },
        p.name,
        el('small', { class: p.id === state.running ? 'running' : null }, p.id === state.running ? 'schneidet gerade …' : `${plural(p.clips, 'Clip', 'Clips')} · ${plural(p.versions, 'Version', 'Versionen')}`),
      ),
    ),
  );
  $('#homeLink').classList.toggle('active', !state.project);
}

async function createProject() {
  const name = prompt('Wie soll das Projekt heißen?', 'Neues Projekt');
  if (name === null) return;
  const project = await api('/api/projects', { method: 'POST', body: { name } });
  location.hash = project.id;
}

// Clips dropped on the home screen: new project, named by date, upload
// starts as soon as it is open. Rename it later in the project header.
async function quickCreate(files) {
  if (!files.length) return;
  const now = new Date();
  const name = `Projekt ${now.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
  try {
    const project = await api('/api/projects', { method: 'POST', body: { name } });
    state.pendingFiles = files;
    location.hash = project.id;
  } catch (err) {
    toast(err.message, true);
  }
}

// #            → home
// #<id>        → project
// #<id>/v<n>   → project with version n selected
function route() {
  const [id, v] = location.hash.slice(1).split('/');
  if (!id) return showHome();
  openProject(id, Number((v || '').replace(/^v/, '')) || null);
}

function showHome() {
  state.events?.close();
  state.events = null;
  state.project = null;
  $('#project').hidden = true;
  $('#home').hidden = false;
  renderProjects();
  loadDashboard();
}

async function openProject(id, version = null) {
  state.events?.close();
  state.events = null;
  try {
    state.project = await api(`/api/projects/${id}`);
  } catch (err) {
    toast(err.message, true);
    location.hash = '';
    return;
  }
  const versions = state.project.versions;
  state.version = versions.some((v) => v.n === version) ? version : versions.at(-1)?.n ?? null;
  $('#home').hidden = true;
  $('#project').hidden = false;
  renderProjects();
  renderProject();
  listen(id);
  if (version) $('#resultCard').scrollIntoView({ block: 'start' });
  if (state.pendingFiles?.length) {
    const files = state.pendingFiles;
    state.pendingFiles = null;
    uploadFiles('clips', files);
  }
}

async function refreshProject() {
  if (!state.project) return;
  const keepVersion = state.version;
  state.project = await api(`/api/projects/${state.project.id}`);
  if (!state.project.versions.some((v) => v.n === keepVersion)) state.version = state.project.versions.at(-1)?.n ?? null;
  renderProject();
}

function renderProject() {
  const p = state.project;
  if (document.activeElement !== $('#projectName')) $('#projectName').value = p.name;
  renderClips();
  renderSettings();
  renderRun(p.job);
  renderResult();
}

// ---------- clips & music ----------

function renderClips() {
  const p = state.project;
  const items = p.clips.map((c) => {
    const src = `/media/${p.id}/clips/${encodeURIComponent(c.name)}`;
    const meta = c.error ? el('div', { class: 'meta err', text: c.error }) : el('div', { class: 'meta', text: `${secs(c.duration)} · ${c.width}×${c.height} · ${mb(c.size)}${c.hasAudio ? '' : ' · ohne Ton'}` });
    return el(
      'li',
      { class: 'clip' },
      el('video', { src: `${src}#t=0.5`, muted: true, preload: 'metadata', playsinline: true, onmouseenter: (e) => e.target.play().catch(() => {}), onmouseleave: (e) => e.target.pause() }),
      el('div', {}, el('div', { class: 'name', text: c.name, title: c.name }), meta),
      el('button', { class: 'x', title: 'Entfernen', 'aria-label': `${c.name} entfernen`, onclick: () => removeFile('clips', c.name), text: '✕' }),
    );
  });
  for (const [name, up] of state.uploads) {
    items.push(
      el(
        'li',
        { class: 'clip' },
        el('div', { class: 'thumb' }),
        el('div', {}, el('div', { class: 'name', text: name }), el('div', { class: 'meta', text: `lädt hoch … ${Math.round(up.fraction * 100)} %` }), el('div', { class: 'upbar' }, el('div', { style: `width:${up.fraction * 100}%` }))),
        el('span'),
      ),
    );
  }
  $('#clipList').replaceChildren(...items);
}

function upload(kind, file) {
  const p = state.project;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/projects/${p.id}/${kind}?name=${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader('X-Cutroom', '1');
    xhr.upload.onprogress = (e) => {
      if (kind !== 'clips' || !e.lengthComputable) return;
      state.uploads.set(file.name, { fraction: e.loaded / e.total });
      renderClips();
    };
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');
      xhr.status < 300 ? resolve(data) : reject(new Error(data.error || `Upload fehlgeschlagen (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload fehlgeschlagen'));
    xhr.send(file);
  });
}

async function uploadFiles(kind, files) {
  const projectId = state.project.id;
  for (const file of files) {
    if (kind === 'clips') state.uploads.set(file.name, { fraction: 0 });
  }
  renderClips();
  // One after another: parallel uploads of big clips just fight for disk.
  for (const file of files) {
    try {
      await upload(kind, file);
    } catch (err) {
      toast(`${file.name}: ${err.message}`, true);
    } finally {
      state.uploads.delete(file.name);
    }
    if (state.project?.id === projectId) await refreshProject();
  }
  loadProjects();
}

async function removeFile(kind, name) {
  await api(`/api/projects/${state.project.id}/${kind}/${encodeURIComponent(name)}`, { method: 'DELETE' });
  await refreshProject();
  loadProjects();
}

const ACCEPT = { clips: /^video\/|\.(mov|mkv|mts|m2ts|m4v)$/i, music: /^audio\/|\.(mp3|m4a|wav|flac|ogg|aac|opus)$/i };

function setupDrop(zone, input, kind, onFiles = (files) => uploadFiles(kind, files)) {
  input.addEventListener('change', () => {
    onFiles([...input.files]);
    input.value = '';
  });
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('over');
    const files = [...e.dataTransfer.files].filter((f) => ACCEPT[kind].test(f.type || f.name));
    if (!files.length) return toast(kind === 'clips' ? 'Das sind keine Videos.' : 'Das ist keine Audiodatei.', true);
    onFiles(kind === 'music' ? files.slice(0, 1) : files);
  });
}

function renderMusic() {
  const p = state.project;
  const box = $('#music');
  if (p.music) {
    box.replaceChildren(
      el(
        'div',
        { class: 'music-file' },
        el('span', { text: `♪ ${p.music.name}${p.music.duration ? ` · ${secs(p.music.duration)}` : ''}`, title: p.music.name }),
        el('button', { class: 'btn btn-ghost', onclick: () => removeFile('music', p.music.name), text: 'Entfernen' }),
      ),
    );
  } else {
    const input = el('input', { type: 'file', accept: 'audio/*', hidden: true });
    const zone = el('label', { class: 'drop' }, input, el('strong', { text: '♪ Track hinzufügen' }), el('span', { text: 'MP3, M4A, WAV' }));
    setupDrop(zone, input, 'music');
    box.replaceChildren(zone);
  }
}

// ---------- settings ----------

function segValue(id) {
  return $(`#${id} button[aria-checked="true"]`)?.dataset.v;
}

function setSeg(id, value) {
  for (const b of $(`#${id}`).querySelectorAll('button')) {
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(b.dataset.v === String(value)));
  }
}

function currentSettings() {
  return {
    aspect: segValue('aspectSeg'),
    length: Number(segValue('lengthSeg')),
    audio: state.project.music ? segValue('audioSeg') : 'original',
    brief: $('#brief').value,
    look: segValue('lookSeg'),
    captions: segValue('captionsSeg'),
    motion: segValue('motionSeg'),
    review: $('#reviewToggle').checked,
  };
}

function renderSettings() {
  const s = state.project.settings;
  setSeg('aspectSeg', s.aspect);
  setSeg('lengthSeg', [15, 30, 60, 90, 0].includes(s.length) ? s.length : 0);
  setSeg('audioSeg', state.project.music ? s.audio : 'original');
  for (const b of $('#audioSeg').querySelectorAll('button')) b.disabled = !state.project.music;
  if (document.activeElement !== $('#brief')) $('#brief').value = s.brief;

  // Add-on switches: greyed out with a hint when the add-on is missing.
  const a = state.health?.addons || {};
  const canCaption = a.hyperframes || (a.elevenLabs && a.videoUse);
  setSeg('lookSeg', s.look || 'none');
  setSeg('captionsSeg', canCaption ? s.captions || 'none' : 'none');
  setSeg('motionSeg', a.hyperframes ? s.motion || 'none' : 'none');
  for (const b of $('#captionsSeg').querySelectorAll('button')) b.disabled = !canCaption && b.dataset.v !== 'none';
  for (const b of $('#motionSeg').querySelectorAll('button')) b.disabled = !a.hyperframes && b.dataset.v !== 'none';
  $('#captionsHint').textContent = !state.health ? '' : canCaption ? (a.filters?.subtitles === false ? 'Dein ffmpeg kann keine Untertitel einbrennen (libass fehlt).' : '') : 'Braucht HyperFrames (lokales Whisper) — npm run setup';
  $('#motionHint').textContent = !state.health || a.hyperframes ? '' : a.nodeOk === false ? 'HyperFrames braucht Node 22+.' : 'Nicht installiert — npm run setup';
  $('#reviewToggle').checked = Boolean(s.review);
  $('#motionNote').hidden = segValue('motionSeg') !== 'explain';
  renderMusic();
  renderCutHint();
}

const saveSettings = debounce(async () => {
  if (!state.project) return;
  try {
    const p = await api(`/api/projects/${state.project.id}`, { method: 'PATCH', body: { settings: currentSettings() } });
    state.project.settings = p.settings;
  } catch (err) {
    toast(err.message, true);
  }
}, 400);

function renderCutHint() {
  if (!state.project) return;
  const busy = ['agent', 'render'].includes(state.project.job?.status);
  const otherRunning = state.running && state.running !== state.project.id;
  const reason =
    blocker() ||
    (!state.project.clips.length ? 'Erst mindestens einen Clip hochladen.' : null) ||
    (state.uploads.size ? 'Warte, bis alle Uploads fertig sind.' : null) ||
    (otherRunning ? 'Ein anderes Projekt wird gerade geschnitten.' : null);
  $('#cutBtn').disabled = Boolean(reason) || busy;
  $('#reviseBtn').disabled = Boolean(blocker()) || busy || otherRunning;
  $('#cutBtn').textContent = state.project.versions.length ? 'Komplett neu schneiden' : 'Schneiden lassen';
  $('#cutHint').textContent = reason || (busy ? '' : 'Läuft über dein Claude-Pro-Abo. Größere Projekte brauchen spürbar Limit.');
}

// ---------- job ----------

function listen(id) {
  const es = new EventSource(`/api/projects/${id}/events`);
  state.events = es;
  es.onmessage = (msg) => {
    if (state.project?.id !== id) return;
    const event = JSON.parse(msg.data);
    const job = state.project.job;
    if (event.type === 'snapshot') {
      state.project.job = event.job;
      renderRun(event.job);
    } else if (event.type === 'status') {
      Object.assign(job, { status: event.status, label: event.label });
      if (event.status !== 'render') job.progress = null;
      renderRun(job);
      if (['done', 'error'].includes(event.status)) loadProjects();
    } else if (event.type === 'log') {
      const i = job.log.findIndex((e) => e.id === event.entry.id);
      if (i >= 0) job.log[i] = event.entry;
      else job.log.push(event.entry);
      renderLog(job);
    } else if (event.type === 'progress') {
      job.progress = event.progress;
      renderProgress(job);
    } else if (event.type === 'version') {
      state.version = event.version.n;
      refreshProject();
    }
  };
}

function renderRun(job) {
  const card = $('#runCard');
  if (!job || job.status === 'idle') {
    card.hidden = true;
    renderCutHint();
    return;
  }
  const active = ['agent', 'render'].includes(job.status);
  card.hidden = !active && state.dismissed != null && state.dismissed === job.log[0]?.t;
  $('#cancelBtn').textContent = active ? 'Abbrechen' : 'Ausblenden';
  const failed = job.error === 'Abgebrochen.' ? 'Abgebrochen' : 'Hat nicht geklappt';
  $('#runTitle').textContent = job.status === 'done' ? 'Fertig' : job.status === 'error' ? failed : 'Claude schneidet …';

  const wroteEdit = job.log.some((e) => e.icon === 'cut');
  const current = job.status === 'render' ? 'render' : job.status === 'done' ? 'done' : wroteEdit ? 'edit' : 'watch';
  const order = ['watch', 'edit', 'render', 'done'];
  for (const li of $('#steps').children) {
    const i = order.indexOf(li.dataset.step);
    const c = order.indexOf(current);
    li.className = job.status === 'done' || i < c ? 'done' : i === c && job.status !== 'error' ? 'active' : '';
  }
  renderProgress(job);
  renderLog(job);
  renderCutHint();
}

function renderProgress(job) {
  const p = job.progress;
  $('#progress').hidden = !p;
  if (!p) return;
  const fraction = (p.step - 1 + (p.fraction ?? (p.step === p.steps ? 0 : 1))) / p.steps;
  $('#progressBar').style.width = `${Math.round(Math.min(1, fraction) * 100)}%`;
}

function renderLog(job) {
  const list = $('#log');
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
  const start = job.log[0]?.t || Date.now();
  list.replaceChildren(
    ...job.log.map((e) =>
      el(
        'li',
        { class: e.icon },
        el('span', { class: 'ico', text: ICONS[e.icon] || '·' }),
        el('span', { class: 'txt', text: e.text }),
        el('span', { class: 'time', text: tc((e.t - start) / 1000).slice(0, 5) }),
      ),
    ),
  );
  if (atBottom) list.scrollTop = list.scrollHeight;
}

async function startCut() {
  const settings = currentSettings();
  try {
    await api(`/api/projects/${state.project.id}/cut`, { method: 'POST', body: settings });
    state.project.job = { status: 'agent', label: '', log: [], progress: null };
    state.running = state.project.id;
    renderRun(state.project.job);
    renderProjects();
    $('#runCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    toast(err.message, true);
  }
}

async function startRevise() {
  const feedback = $('#feedback').value.trim();
  if (!feedback) return toast('Schreib kurz, was anders werden soll.', true);
  try {
    await api(`/api/projects/${state.project.id}/revise`, { method: 'POST', body: { feedback, from: state.version } });
    $('#feedback').value = '';
    state.project.job = { status: 'agent', label: '', log: [], progress: null };
    state.running = state.project.id;
    renderRun(state.project.job);
    renderProjects();
    $('#runCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------- result ----------

function renderResult() {
  const p = state.project;
  const card = $('#resultCard');
  if (!p.versions.length) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  const v = p.versions.find((x) => x.n === state.version) || p.versions.at(-1);
  state.version = v.n;

  $('#versions').replaceChildren(
    ...p.versions
      .slice()
      .reverse()
      .map((x) =>
        el('button', {
          role: 'tab',
          'aria-selected': String(x.n === v.n),
          title: x.request || '',
          text: `v${x.n} · ${secs(x.duration)}`,
          onclick: () => {
            state.version = x.n;
            renderResult();
          },
        }),
      ),
  );

  const src = `/media/${p.id}/renders/${v.file}`;
  const video = $('#video');
  if (video.dataset.src !== src) {
    video.dataset.src = src;
    video.src = `${src}?v=${encodeURIComponent(v.createdAt)}`;
  }
  $('#downloadBtn').href = `${src}?download`;
  $('#versionTitle').textContent = v.title;
  $('#versionRequest').textContent = v.mode === 'revise' ? `Wunsch zu v${v.from}: „${v.request}"` : v.request ? `Vorgabe: „${v.request}"` : '';
  $('#versionReply').textContent = v.reply || v.summary;
  $('#versionReview').textContent = v.review ? `Selbstkontrolle: ${v.review}` : '';
  const extras = [
    v.grade && v.grade !== 'none' && `Look: ${LOOK_NAMES[v.grade] || (v.grade.length > 24 ? 'eigener Filter' : v.grade)}`,
    v.captions && v.captions !== 'none' && (v.captionCount === 0 ? 'Untertitel: keine Sprache gefunden' : `Untertitel: ${v.captions === 'bold' ? 'BOLD' : 'Clean'}${v.captionCount ? ` · ${v.captionCount} Zeilen` : ''}`),
    v.overlays?.length && `${v.overlays.length} Animation${v.overlays.length > 1 ? 'en' : ''}`,
  ].filter(Boolean);
  $('#versionExtras').replaceChildren(...extras.map((t) => el('span', { text: t })));
  const track = $('#ovtrack');
  track.hidden = !v.overlays?.length;
  track.replaceChildren(
    ...(v.overlays || []).map((o) =>
      el('span', {
        style: `left:${(o.start / v.duration) * 100}%;width:${(o.duration / v.duration) * 100}%`,
        title: `${o.file.replace(/^overlays\//, '')} · ${tc(o.start)}–${tc(o.start + o.duration)}${o.why ? `\n${o.why}` : ''}`,
      }),
    ),
  );

  // Timeline: each block is one segment, width = its share of the output.
  let at = 0;
  const blocks = v.segments.map((s, i) => {
    const length = (s.end - s.start) / s.speed;
    const startAt = at;
    at += length;
    return el('button', {
      style: `flex:${length} 1 0;background:${clipColor(s.clip)}`,
      title: `${i + 1}. ${s.clip} ${tc(s.start)}–${tc(s.end)}${s.speed !== 1 ? ` · ${s.speed}×` : ''}${s.why ? `\n${s.why}` : ''}`,
      'data-start': startAt,
      'data-end': at,
      text: length / v.duration > 0.06 ? String(i + 1) : '',
      onclick: () => {
        video.currentTime = startAt + 0.01;
        video.play().catch(() => {});
      },
    });
  });
  $('#timeline').replaceChildren(...blocks);

  $('#segmentList').replaceChildren(
    ...v.segments.map((s) =>
      el(
        'li',
        {},
        el('span', { class: 'dot', style: `background:${clipColor(s.clip)}` }),
        `${s.clip} `,
        el('span', { class: 'tc', text: `${tc(s.start)}–${tc(s.end)}${s.speed !== 1 ? ` · ${s.speed}×` : ''}` }),
        s.why ? ` — ${s.why}` : '',
      ),
    ),
  );
}

$('#video').addEventListener('timeupdate', (e) => {
  const t = e.target.currentTime;
  for (const b of $('#timeline').children) b.classList.toggle('playing', t >= Number(b.dataset.start) && t < Number(b.dataset.end));
});

// ---------- home ----------

const ago = (iso) => {
  const min = (Date.now() - new Date(iso)) / 60000;
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${Math.round(min)} Min.`;
  if (min < 24 * 60) return `vor ${Math.round(min / 60)} Std.`;
  if (min < 48 * 60) return 'gestern';
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
};

const span = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) {
    const m = seconds / 60;
    return `${m < 10 ? m.toFixed(1).replace('.', ',') : Math.round(m)} min`;
  }
  const h = Math.floor(seconds / 3600);
  return `${h} h ${Math.round((seconds - h * 3600) / 60)} min`;
};

const bytes = (n) => (n >= 1e12 ? `${(n / 1e12).toFixed(1)} TB` : n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : `${Math.round(n / 1e6)} MB`).replace('.', ',');

async function loadDashboard() {
  try {
    const before = state.running;
    state.dashboard = await api('/api/dashboard');
    state.running = state.dashboard.running?.id || null;
    renderDashboard();
    if (before !== state.running) loadProjects();
  } catch (err) {
    toast(err.message, true);
  }
}

function renderDashboard() {
  const d = state.dashboard;
  if (!d) return;
  const hour = new Date().getHours();
  const hello = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend';
  $('#homeGreeting').textContent = d.name ? `${hello}, ${d.name}` : hello;
  $('#homeDate').textContent = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  // Running job — the one thing worth jumping to.
  const run = d.running;
  $('#homeRunning').hidden = !run;
  if (run) {
    $('#homeRunning').href = `#${run.id}`;
    $('#runningName').textContent = run.name;
    $('#runningLine').textContent = [run.label, run.last].filter(Boolean).join(' · ');
    const p = run.progress;
    const fraction = p ? (p.step - 1 + (p.fraction ?? (p.step === p.steps ? 0 : 1))) / p.steps : null;
    $('#runningBar').parentElement.hidden = fraction === null;
    $('#runningBar').style.width = `${Math.round((fraction || 0) * 100)}%`;
  }

  const t = d.totals;
  const tiles = [
    { label: 'Projekte', value: String(t.projects), sub: plural(t.clips, 'Clip', 'Clips') },
    { label: 'Fertige Videos', value: String(t.versions), sub: d.recent[0] ? `zuletzt ${ago(d.recent[0].createdAt)}` : 'noch keins' },
    { label: 'Rohmaterial', value: span(t.rawSeconds), sub: 'hochgeladen' },
    { label: 'Geschnitten', value: span(t.cutSeconds), sub: 'aktuelle Versionen' },
  ];
  $('#kpis').replaceChildren(
    ...tiles.map((k) => el('div', { class: 'kpi' }, el('span', { class: 'kpi-label', text: k.label }), el('span', { class: 'kpi-value', text: k.value }), el('span', { class: 'kpi-sub', text: k.sub }))),
  );

  $('#recentRenders').replaceChildren(
    ...(d.recent.length
      ? d.recent.map((v) =>
          el(
            'a',
            { class: 'render', href: `#${v.projectId}/v${v.n}`, title: v.request || v.title },
            el(
              'div',
              { class: 'render-thumb' },
              v.poster ? el('img', { src: `${v.poster}?t=${encodeURIComponent(v.createdAt)}`, alt: '', loading: 'lazy' }) : el('span', { class: 'thumb-empty', text: '✂' }),
              el('span', { class: 'badge', text: span(v.duration) }),
              v.height > v.width ? el('span', { class: 'badge badge-left', text: '9:16' }) : null,
            ),
            el('strong', { text: v.title }),
            el('span', { class: 'render-meta', text: `${v.projectName} · v${v.n} · ${ago(v.createdAt)}` }),
          ),
        )
      : [el('p', { class: 'muted-empty', text: 'Noch nichts geschnitten. Zieh oben ein paar Clips rein, dann legt Claude los.' })]),
  );

  $('#projectCount').textContent = d.projects.length ? String(d.projects.length) : '';
  $('#projectRows').replaceChildren(
    ...(d.projects.length
      ? d.projects.map((p) =>
          el(
            'li',
            {},
            el(
              'a',
              { href: `#${p.id}`, class: 'project-row' },
              p.poster ? el('img', { src: p.poster, alt: '', loading: 'lazy' }) : el('span', { class: 'row-thumb', text: '✂' }),
              el(
                'span',
                { class: 'row-text' },
                el('strong', { text: p.name }),
                el('span', { text: `${plural(p.clips, 'Clip', 'Clips')} · ${plural(p.versions, 'Version', 'Versionen')} · ${ago(p.updatedAt)}` }),
              ),
              p.running ? el('span', { class: 'row-badge', text: 'schneidet' }) : null,
            ),
          ),
        )
      : [el('li', { class: 'muted-empty', text: 'Noch keine Projekte.' })]),
  );

  renderSystem();
}

// Status rows always carry an icon and a word, never colour alone.
function renderSystem() {
  const h = state.health;
  const d = state.dashboard;
  if (!h || !d) return;
  const a = h.addons || {};
  const row = (status, label, hint) =>
    el('li', { class: `check-row ${status}` }, el('span', { class: 'check-icon', text: { ok: '✓', off: '–', bad: '!' }[status] }), el('span', {}, el('strong', { text: label }), hint ? el('span', { text: hint }) : null));
  const c = h.claude;
  $('#systemChecks').replaceChildren(
    !c.ok
      ? row('bad', claudeProblem(c).short, claudeProblem(c).fix)
      : !c.loggedIn
        ? row('bad', 'Claude nicht angemeldet', 'Terminal: claude auth login')
        : row('ok', `Claude Pro · ${h.model}`, 'Bei „session expired“: claude auth login'),
    h.watchSkill ? row('ok', `watch-skill ${h.watchSkill}`) : row('bad', 'watch-skill fehlt', 'siehe README'),
    h.ffmpeg ? row('ok', `ffmpeg ${h.ffmpeg}`) : row('bad', 'ffmpeg fehlt', 'brew install ffmpeg'),
    a.videoUse ? row('ok', 'video-use', 'Grades, Timeline-Check') : row('off', 'video-use', 'npm run setup'),
    a.hyperframes ? row('ok', `HyperFrames ${a.hyperframesVersion}`, 'Animationen') : row('off', 'HyperFrames', a.nodeOk === false ? 'braucht Node 22+' : 'npm run setup'),
    a.whisper || a.elevenLabs ? row('ok', a.elevenLabs ? 'Untertitel: ElevenLabs' : 'Untertitel: Whisper lokal') : row('off', 'Untertitel', a.hyperframes ? 'brew install whisper-cpp (schneller)' : 'npm run setup'),
  );

  const { used, free } = d.storage;
  const low = free !== null && free < 10e9;
  const share = free !== null ? used / (used + free) : 0;
  $('#storage').replaceChildren(
    el('div', { class: 'storage-head' }, el('span', { text: 'Speicher' }), el('span', { text: free !== null ? `${bytes(used)} belegt · ${bytes(free)} frei` : `${bytes(used)} belegt` })),
    el('div', { class: `meter${low ? ' low' : ''}`, role: 'meter', 'aria-valuenow': String(Math.round(share * 100)), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Anteil von Cutroom am freien Speicher' }, el('span', { style: `width:${Math.max(1, share * 100)}%` })),
    ...(low ? [el('p', { class: 'storage-warn', text: '! Speicher wird knapp — alte Projekte löschen oder Renders sichern.' })] : []),
  );
}

// ---------- wiring ----------

$('#newProject').addEventListener('click', createProject);
$('#homeNew').addEventListener('click', createProject);
$('#cutBtn').addEventListener('click', startCut);
$('#reviseBtn').addEventListener('click', startRevise);
$('#cancelBtn').addEventListener('click', () => {
  const job = state.project.job;
  if (['agent', 'render'].includes(job.status)) {
    return api(`/api/projects/${state.project.id}/cancel`, { method: 'POST' }).catch((e) => toast(e.message, true));
  }
  state.dismissed = job.log[0]?.t;
  $('#runCard').hidden = true;
});

$('#projectName').addEventListener(
  'input',
  debounce(async (e) => {
    const name = e.target.value.trim();
    if (!name) return;
    await api(`/api/projects/${state.project.id}`, { method: 'PATCH', body: { name } }).catch((err) => toast(err.message, true));
    state.project.name = name;
    loadProjects();
  }, 500),
);

$('#deleteProject').addEventListener('click', async () => {
  if (!confirm(`„${state.project.name}" mit allen Clips und Versionen löschen?`)) return;
  try {
    await api(`/api/projects/${state.project.id}`, { method: 'DELETE' });
    location.hash = '';
    loadProjects();
  } catch (err) {
    toast(err.message, true);
  }
});

$('#reviewToggle').addEventListener('change', saveSettings);
for (const id of ['aspectSeg', 'lengthSeg', 'audioSeg', 'lookSeg', 'captionsSeg', 'motionSeg']) {
  $(`#${id}`).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    setSeg(id, b.dataset.v);
    if (id === 'motionSeg') $('#motionNote').hidden = b.dataset.v !== 'explain';
    saveSettings();
  });
}
$('#brief').addEventListener('input', saveSettings);

$('#feedbackChips').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const area = $('#feedback');
  area.value = area.value.trim() ? `${area.value.trim()}, ${b.textContent.toLowerCase()}` : b.textContent;
  area.focus();
});

setupDrop($('#clipDrop'), $('#clipInput'), 'clips');
setupDrop($('#homeDrop'), $('#homeInput'), 'clips', quickCreate);
window.addEventListener('hashchange', route);

(async function init() {
  await Promise.all([loadHealth(), loadProjects()]);
  route();
  setInterval(loadHealth, 60000);
  // The home screen refreshes itself: a cheap check every 4 s for a job
  // starting or finishing, the full dashboard while one runs or every 30 s.
  let tick = 0;
  setInterval(async () => {
    if ($('#home').hidden) return;
    tick += 1;
    const { running } = await api('/api/projects').catch(() => ({}));
    if (running || running !== (state.dashboard?.running?.id || null) || tick % 8 === 0) loadDashboard();
  }, 4000);
})();

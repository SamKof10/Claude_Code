'use strict';

const $ = (sel) => document.querySelector(sel);
const PALETTE = ['#ff8a5c', '#5cc8ff', '#b78cff', '#6be3a4', '#ffd166', '#ff7eb6', '#7fd1c7', '#c3d36b'];
const ICONS = { start: '▶', watch: '◉', frame: '▦', ask: '?', tool: '›', cut: '✂', say: '“', done: '✓', error: '!' };

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
  if (!c.installed) box.append(el('span', { class: 'pill err', text: 'Claude Code fehlt', title: 'npm i -g @anthropic-ai/claude-code' }));
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
  renderCutHint();
}

function blocker() {
  const h = state.health;
  if (!h) return 'Server nicht erreichbar.';
  if (!h.claude.installed) return 'Claude Code ist nicht installiert (siehe README).';
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
        el('small', { class: p.id === state.running ? 'running' : null }, p.id === state.running ? 'schneidet gerade …' : `${p.clips} Clips · ${p.versions} Versionen`),
      ),
    ),
  );
  $('#emptyState').hidden = Boolean(state.project);
}

async function createProject() {
  const name = prompt('Wie soll das Projekt heißen?', 'Neues Projekt');
  if (name === null) return;
  const project = await api('/api/projects', { method: 'POST', body: { name } });
  location.hash = project.id;
}

async function openProject(id) {
  state.events?.close();
  state.events = null;
  if (!id) {
    state.project = null;
    $('#project').hidden = true;
    renderProjects();
    return;
  }
  try {
    state.project = await api(`/api/projects/${id}`);
  } catch (err) {
    toast(err.message, true);
    location.hash = '';
    return;
  }
  state.version = state.project.versions.at(-1)?.n ?? null;
  $('#project').hidden = false;
  renderProjects();
  renderProject();
  listen(id);
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

function setupDrop(zone, input, kind) {
  input.addEventListener('change', () => {
    uploadFiles(kind, [...input.files]);
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
    const files = [...e.dataTransfer.files].filter((f) => (kind === 'clips' ? /^video\/|\.(mov|mkv|mts|m2ts|m4v)$/i : /^audio\/|\.(mp3|m4a|wav|flac|ogg|aac|opus)$/i).test(f.type || f.name));
    if (!files.length) return toast(kind === 'clips' ? 'Das sind keine Videos.' : 'Das ist keine Audiodatei.', true);
    uploadFiles(kind, kind === 'music' ? files.slice(0, 1) : files);
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
  };
}

function renderSettings() {
  const s = state.project.settings;
  setSeg('aspectSeg', s.aspect);
  setSeg('lengthSeg', [15, 30, 60, 90, 0].includes(s.length) ? s.length : 0);
  setSeg('audioSeg', state.project.music ? s.audio : 'original');
  for (const b of $('#audioSeg').querySelectorAll('button')) b.disabled = !state.project.music;
  if (document.activeElement !== $('#brief')) $('#brief').value = s.brief;
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

// ---------- wiring ----------

$('#newProject').addEventListener('click', createProject);
$('#emptyNew').addEventListener('click', createProject);
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

for (const id of ['aspectSeg', 'lengthSeg', 'audioSeg']) {
  $(`#${id}`).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    setSeg(id, b.dataset.v);
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
window.addEventListener('hashchange', () => openProject(location.hash.slice(1)));

(async function init() {
  await Promise.all([loadHealth(), loadProjects()]);
  const id = location.hash.slice(1) || state.projects[0]?.id;
  if (id) {
    if (location.hash.slice(1) !== id) history.replaceState(null, '', `#${id}`);
    openProject(id);
  } else {
    renderProjects();
  }
  setInterval(loadHealth, 60000);
})();

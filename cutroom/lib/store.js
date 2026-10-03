'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(process.env.CUTROOM_DATA || path.join(os.homedir(), 'Cutroom'));
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const ID_RE = /^[a-z0-9-]{4,64}$/;

const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.mkv', '.webm', '.avi', '.mts', '.m2ts', '.3gp']);
const AUDIO_EXT = new Set(['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.opus']);

const DEFAULT_SETTINGS = { aspect: '9:16', length: 30, audio: 'original', brief: '' };

fs.mkdirSync(PROJECTS_DIR, { recursive: true });

function dir(id) {
  if (!ID_RE.test(String(id))) throw Object.assign(new Error('Ungültige Projekt-ID'), { status: 400 });
  return path.join(PROJECTS_DIR, id);
}

const metaPath = (id) => path.join(dir(id), 'project.json');

function get(id) {
  try {
    return JSON.parse(fs.readFileSync(metaPath(id), 'utf8'));
  } catch {
    throw Object.assign(new Error('Projekt nicht gefunden'), { status: 404 });
  }
}

function save(project) {
  const file = metaPath(project.id);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(project, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return project;
}

function create(name) {
  const stamp = new Date().toISOString().slice(0, 10);
  const id = `${stamp}-${crypto.randomBytes(3).toString('hex')}`;
  for (const sub of ['clips', 'music', 'renders', 'edits']) fs.mkdirSync(path.join(dir(id), sub), { recursive: true });
  return save({
    id,
    name: String(name || '').trim().slice(0, 80) || 'Neues Projekt',
    createdAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    sessionId: null,
    knownClips: [],
    versions: [],
  });
}

function list() {
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((id) => ID_RE.test(id) && fs.existsSync(metaPath(id)))
    .map((id) => {
      const p = get(id);
      return { id: p.id, name: p.name, createdAt: p.createdAt, versions: p.versions.length, clips: clipFiles(id).length };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function remove(id) {
  fs.rmSync(dir(id), { recursive: true, force: true });
}

const filesIn = (folder, exts) => {
  try {
    return fs
      .readdirSync(folder)
      .filter((f) => !f.startsWith('.') && exts.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
  } catch {
    return [];
  }
};

const clipFiles = (id) => filesIn(path.join(dir(id), 'clips'), VIDEO_EXT);
const musicFile = (id) => filesIn(path.join(dir(id), 'music'), AUDIO_EXT)[0] || null;

// Keeps a readable name but drops anything that could escape the folder or
// trip up a shell command.
function safeName(name, folder) {
  const ext = path.extname(String(name)).toLowerCase();
  const base =
    path
      .basename(String(name), path.extname(String(name)))
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w.-]+/g, '_')
      .replace(/^[._]+|_+$/g, '')
      .slice(0, 60) || 'clip';
  let candidate = `${base}${ext}`;
  for (let i = 2; fs.existsSync(path.join(folder, candidate)); i++) candidate = `${base}_${i}${ext}`;
  return candidate;
}

module.exports = {
  DATA_DIR,
  VIDEO_EXT,
  AUDIO_EXT,
  dir,
  get,
  save,
  create,
  list,
  remove,
  clipFiles,
  musicFile,
  safeName,
};

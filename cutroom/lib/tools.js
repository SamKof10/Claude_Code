'use strict';

// Optional add-ons on top of the core (Claude Code + watch-skill + ffmpeg):
//   video-use  (browser-use/video-use) — timeline view for precise cut checks,
//              grade presets, ElevenLabs transcription when a key is set
//   HyperFrames (heygen-com/hyperframes) — HTML → video for titles, intros,
//              lower thirds; also local whisper.cpp transcription for captions
// `npm run setup` installs both; this module only detects what is there.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'vendor');
const VIDEO_USE_DIR = path.join(VENDOR_DIR, 'video-use');
const STATE_FILE = path.join(VENDOR_DIR, 'state.json');

// Pinned so a breaking upstream change can't silently break a cut.
const VIDEO_USE_REPO = 'https://github.com/browser-use/video-use.git';
const VIDEO_USE_REF = 'b877063835e6ea6e457124da7e28a0ae26691dc3';
const HYPERFRAMES_VERSION = process.env.CUTROOM_HYPERFRAMES_VERSION || '0.8.114';
const WHISPER_MODEL = process.env.CUTROOM_WHISPER_MODEL || 'large-v3-turbo';

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeState(patch) {
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...readState(), ...patch }, null, 2));
}

function which(bin, extra = []) {
  for (const dir of [...(process.env.PATH || '').split(path.delimiter), ...extra]) {
    const file = path.join(dir, bin);
    try {
      fs.accessSync(file, fs.constants.X_OK);
      return file;
    } catch {
      // keep looking
    }
  }
  return null;
}

function elevenLabsKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  try {
    const env = fs.readFileSync(path.join(VIDEO_USE_DIR, '.env'), 'utf8');
    return env.match(/^\s*ELEVENLABS_API_KEY\s*=\s*["']?([^"'\s]+)/m)?.[1] || null;
  } catch {
    return null;
  }
}

let filterCache = null;
// Captions need libass, HDR tone mapping needs zimg. Homebrew's ffmpeg has
// both, but a minimal build might not, so the renderer asks first.
function ffmpegFilters() {
  if (filterCache) return filterCache;
  try {
    const out = execFileSync('ffmpeg', ['-hide_banner', '-filters'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    filterCache = {
      subtitles: /\ssubtitles\s/.test(out),
      zscale: /\szscale\s/.test(out) && /\stonemap\s/.test(out),
    };
  } catch {
    filterCache = { subtitles: false, zscale: false };
  }
  return filterCache;
}

function status() {
  const state = readState();
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const videoUse = fs.existsSync(path.join(VIDEO_USE_DIR, 'helpers', 'timeline_view.py')) && fs.existsSync(path.join(VIDEO_USE_DIR, '.venv'));
  const whisper = which('whisper-cli', ['/opt/homebrew/bin', '/usr/local/bin', path.join(os.homedir(), '.cache/hyperframes/whisper/whisper.cpp/build/bin')]);
  return {
    videoUse,
    uv: Boolean(which('uv', ['/opt/homebrew/bin', '/usr/local/bin'])),
    hyperframes: state.hyperframes === HYPERFRAMES_VERSION && nodeMajor >= 22,
    hyperframesVersion: HYPERFRAMES_VERSION,
    nodeOk: nodeMajor >= 22,
    whisper: Boolean(whisper),
    elevenLabs: Boolean(elevenLabsKey()),
    filters: ffmpegFilters(),
  };
}

// Extra environment for the headless agent so the wrappers in agent/tools
// find the add-ons. Telemetry stays off.
function agentEnv() {
  return {
    CUTROOM_VIDEO_USE: VIDEO_USE_DIR,
    CUTROOM_HYPERFRAMES_VERSION: HYPERFRAMES_VERSION,
    HYPERFRAMES_NO_TELEMETRY: '1',
  };
}

module.exports = {
  ROOT,
  VENDOR_DIR,
  VIDEO_USE_DIR,
  VIDEO_USE_REPO,
  VIDEO_USE_REF,
  HYPERFRAMES_VERSION,
  WHISPER_MODEL,
  readState,
  writeState,
  which,
  elevenLabsKey,
  ffmpegFilters,
  status,
  agentEnv,
};

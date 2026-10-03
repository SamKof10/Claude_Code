'use strict';

// Word-level transcripts for captions and word-precise cuts.
//   - ElevenLabs Scribe via video-use's transcribe.py when a key is set
//     (keeps fillers like "ähm", best timestamps)
//   - otherwise local whisper.cpp via `hyperframes transcribe` (free, offline
//     after the first model download, auto-detects the language)
// Both are normalised to { words: [{ text, start, end, type: 'word' }] } in
// transcripts/<clip>.json — the shape video-use's timeline_view also reads.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { run } = require('./media');
const tools = require('./tools');

const PHRASE_GAP = 0.5;

function sourceStamp(file) {
  const s = fs.statSync(file);
  return `${s.size}:${Math.round(s.mtimeMs)}`;
}

function normalise(raw) {
  const list = Array.isArray(raw) ? raw : raw?.words || [];
  return list
    .filter((w) => (w.type ?? 'word') === 'word' && Number.isFinite(Number(w.start)) && Number.isFinite(Number(w.end)))
    .map((w) => ({ text: String(w.text ?? w.word ?? '').trim(), start: Number(w.start), end: Number(w.end), type: 'word' }))
    .filter((w) => w.text);
}

async function viaElevenLabs(clipPath, track) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cutroom-scribe-'));
  try {
    const vu = tools.VIDEO_USE_DIR;
    await run('uv', ['run', '--quiet', '--project', vu, 'python', path.join(vu, 'helpers', 'transcribe.py'), clipPath, '--edit-dir', tmp], {
      track,
      env: { ...process.env, ELEVENLABS_API_KEY: tools.elevenLabsKey() },
    });
    const stem = path.basename(clipPath, path.extname(clipPath));
    return normalise(JSON.parse(fs.readFileSync(path.join(tmp, 'transcripts', `${stem}.json`), 'utf8')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function viaWhisper(clipPath, track) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cutroom-whisper-'));
  try {
    await run('npx', ['--yes', `hyperframes@${tools.HYPERFRAMES_VERSION}`, 'transcribe', clipPath, '--dir', tmp, '--model', tools.WHISPER_MODEL], {
      track,
      env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1' },
    });
    return normalise(JSON.parse(fs.readFileSync(path.join(tmp, 'transcript.json'), 'utf8')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function engine() {
  const s = tools.status();
  if (s.elevenLabs && s.videoUse) return 'elevenlabs';
  if (s.hyperframes) return 'whisper';
  return null;
}

// Transcribes every clip with sound that has no fresh transcript yet.
// Returns { name: words[] } for all clips that have one.
async function ensureTranscripts({ dir, clips, onLog, track }) {
  const outDir = path.join(dir, 'transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const result = {};
  const chosen = engine();

  for (const [name, info] of Object.entries(clips)) {
    if (!info.hasAudio || name.startsWith('overlays/')) continue;
    const clipPath = path.join(dir, 'clips', name);
    const file = path.join(outDir, `${name}.json`);
    const stamp = sourceStamp(clipPath);
    try {
      const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (cached.source === stamp) {
        result[name] = cached.words;
        continue;
      }
    } catch {
      // not transcribed yet
    }
    if (!chosen) {
      onLog?.({ icon: 'error', text: 'Keine Transkription verfügbar — npm run setup ausführen. Untertitel fallen weg.' });
      return result;
    }
    onLog?.({ icon: 'tool', text: `Transkribiert ${name} (${chosen === 'elevenlabs' ? 'ElevenLabs Scribe' : `Whisper ${tools.WHISPER_MODEL}, lokal`})` });
    const words = chosen === 'elevenlabs' ? await viaElevenLabs(clipPath, track) : await viaWhisper(clipPath, track);
    fs.writeFileSync(file, JSON.stringify({ engine: chosen, source: stamp, words }, null, 1));
    result[name] = words;
  }

  fs.writeFileSync(path.join(outDir, 'packed.md'), pack(result, clips));
  return result;
}

// Phrase-level view of all transcripts (after video-use's pack_transcripts):
// one line per phrase, broken on pauses ≥ 0.5 s. Cheap for Claude to read and
// precise enough to cut on word boundaries.
function pack(transcripts, clips) {
  const t = (n) => n.toFixed(2).padStart(6, '0');
  const parts = ['# Transkripte (Phrasen, Zeiten in Sekunden der Quelle)', ''];
  for (const [name, words] of Object.entries(transcripts)) {
    parts.push(`## ${name}  (Dauer: ${clips[name]?.duration.toFixed(1) ?? '?'} s, ${words.length} Wörter)`);
    if (!words.length) parts.push('  (keine Sprache erkannt)');
    let phrase = [];
    const flush = () => {
      if (!phrase.length) return;
      parts.push(`  [${t(phrase[0].start)}-${t(phrase[phrase.length - 1].end)}] ${phrase.map((w) => w.text).join(' ')}`);
      phrase = [];
    };
    words.forEach((w, i) => {
      if (phrase.length && w.start - words[i - 1].end >= PHRASE_GAP) flush();
      phrase.push(w);
    });
    flush();
    parts.push('');
  }
  return parts.join('\n');
}

module.exports = { ensureTranscripts, engine, pack };

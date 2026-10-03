'use strict';

// `npm run setup`: installs the optional add-ons Cutroom can use.
//   1. browser-use/video-use → vendor/video-use (pinned commit, uv venv)
//   2. heygen-com/hyperframes → npx cache (pinned version) + its Claude skills
// Safe to re-run; finished steps are skipped.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const tools = require('../lib/tools');

const ok = (msg) => console.log(`  ✓ ${msg}`);
const info = (msg) => console.log(`  i ${msg}`);
const fail = (msg, fix) => {
  console.log(`  ✗ ${msg}${fix ? `\n      → ${fix}` : ''}`);
  process.exitCode = 1;
};

function sh(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8', ...opts });
  return result.status === 0;
}

function setupVideoUse() {
  console.log('\nvideo-use (browser-use/video-use)');
  if (!tools.which('uv', ['/opt/homebrew/bin', '/usr/local/bin'])) {
    return fail('uv fehlt', 'brew install uv');
  }
  const dir = tools.VIDEO_USE_DIR;
  if (!fs.existsSync(path.join(dir, '.git'))) {
    fs.mkdirSync(tools.VENDOR_DIR, { recursive: true });
    if (!sh('git', ['clone', '--quiet', tools.VIDEO_USE_REPO, dir])) return fail('git clone fehlgeschlagen');
  }
  sh('git', ['-C', dir, 'fetch', '--quiet', 'origin'], { quiet: true });
  if (!sh('git', ['-C', dir, 'checkout', '--quiet', tools.VIDEO_USE_REF], { quiet: true })) {
    return fail(`Commit ${tools.VIDEO_USE_REF.slice(0, 7)} nicht gefunden`);
  }
  ok(`Code auf ${tools.VIDEO_USE_REF.slice(0, 7)}`);
  if (!sh('uv', ['sync', '--quiet', '--project', dir])) return fail('uv sync fehlgeschlagen');
  ok('Python-Umgebung bereit (timeline_view, grade)');
  if (tools.elevenLabsKey()) ok('ElevenLabs-Key gefunden — Untertitel nutzen Scribe (beste Wort-Zeitstempel)');
  else info('Kein ElevenLabs-Key — Untertitel laufen lokal mit Whisper (kostenlos). Optional: ELEVENLABS_API_KEY in vendor/video-use/.env');
}

function setupHyperFrames() {
  console.log(`\nHyperFrames ${tools.HYPERFRAMES_VERSION} (heygen-com/hyperframes)`);
  if (Number(process.versions.node.split('.')[0]) < 22) {
    return fail(`Node ${process.versions.node} ist zu alt`, 'HyperFrames braucht Node 22+: brew upgrade node');
  }
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1' };
  const pkg = `hyperframes@${tools.HYPERFRAMES_VERSION}`;
  if (!sh('npx', ['--yes', pkg, '--version'], { quiet: true, env })) return fail(`${pkg} lässt sich nicht laden`, 'Internet prüfen und erneut versuchen');
  ok('CLI geladen');
  // Installs the core HyperFrames skills into ~/.claude/skills, so the
  // headless cutter (and your own Claude Code) can read them.
  if (sh('npx', ['--yes', pkg, 'skills', 'update'], { quiet: true, env })) ok('Skills in ~/.claude/skills installiert');
  else info('Skills konnten nicht installiert werden — Animationen gehen trotzdem, Claude kennt dann nur die Grundregeln');
  // doctor fetches the headless Chrome HyperFrames renders with.
  if (sh('npx', ['--yes', pkg, 'doctor'], { quiet: true, env })) ok('Renderer (headless Chrome) bereit');
  else info('`hyperframes doctor` meldet Probleme — Details: npx hyperframes@' + tools.HYPERFRAMES_VERSION + ' doctor');
  tools.writeState({ hyperframes: tools.HYPERFRAMES_VERSION });

  if (tools.status().whisper) ok('whisper-cli gefunden (lokale Untertitel)');
  else info('Für lokale Untertitel: brew install whisper-cpp (sonst baut HyperFrames whisper.cpp beim ersten Mal selbst)');
}

console.log('\nCutroom-Setup — Add-ons');
setupVideoUse();
setupHyperFrames();
console.log(process.exitCode ? '\nSetup unvollständig — siehe ✗ oben.\n' : '\nFertig. Starten mit: npm start\n');

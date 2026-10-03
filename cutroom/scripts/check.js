'use strict';

// `npm run check`: verifies everything Cutroom needs before the first cut.
const { authStatus, strippedApiKey } = require('../lib/agent');
const { run } = require('../lib/media');

const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg, fix) => {
  console.log(`  ✗ ${msg}\n      → ${fix}`);
  process.exitCode = 1;
};

(async () => {
  console.log('\nCutroom-Check\n');

  const major = Number(process.versions.node.split('.')[0]);
  major >= 20 ? ok(`Node ${process.versions.node}`) : bad(`Node ${process.versions.node} ist zu alt`, 'Node 20 oder neuer installieren (brew install node)');

  const claude = await authStatus();
  if (!claude.installed) bad('Claude Code nicht gefunden', 'npm install -g @anthropic-ai/claude-code');
  else if (!claude.loggedIn) bad('Claude Code nicht angemeldet', 'im Terminal `claude` starten und /login mit deinem Pro-Konto');
  else if (!claude.subscription) bad(`Claude Code nutzt ${claude.method}, nicht dein Abo`, '`claude` starten, /logout, dann /login mit dem Pro-Konto');
  else ok(`Claude Code ${claude.version} · angemeldet über ${claude.method}`);
  if (strippedApiKey()) console.log('  i ANTHROPIC_API_KEY ist gesetzt — Cutroom blendet ihn aus, damit alles übers Abo läuft');

  for (const tool of ['ffmpeg', 'ffprobe']) {
    await run(tool, ['-version']).then(
      (out) => ok(out.split('\n')[0].split(' ').slice(0, 3).join(' ')),
      () => bad(`${tool} fehlt`, 'brew install ffmpeg'),
    );
  }

  const install = (force = '') => `uv tool install ${force}"watch-skill[perceive,whisper,ocr]"`;
  const version = await run('watch-skill', ['--version']).catch(() => null);
  if (!version) bad('watch-skill fehlt', install());
  else {
    ok(`watch-skill ${version.trim().split(/\s+/).pop()}`);
    const doctor = await run('watch-skill', ['doctor', '--json']).catch((err) => err.message);
    const missing = ['perceive', 'whisper'].filter((extra) => new RegExp(`\\b${extra}\\b`).test(String(doctor).match(/not installed[^"]*/)?.[0] || ''));
    if (missing.length) bad(`watch-skill ohne ${missing.join(' + ')}`, install('--force '));
  }
  // Optional add-ons — missing ones only switch features off.
  const addons = require('../lib/tools').status();
  console.log('\n  Add-ons (optional, installiert mit npm run setup):');
  const opt = (on, label, hint) => console.log(`  ${on ? '✓' : '–'} ${label}${on ? '' : `  → ${hint}`}`);
  opt(addons.videoUse, 'video-use — Timeline-Ansicht, Grades', 'npm run setup');
  opt(addons.hyperframes, `HyperFrames ${addons.hyperframesVersion} — Animationen, lokale Untertitel`, addons.nodeOk ? 'npm run setup' : 'Node 22+ nötig, dann npm run setup');
  opt(addons.whisper, 'whisper-cli — schnelle lokale Transkription', 'brew install whisper-cpp');
  opt(addons.elevenLabs, 'ElevenLabs-Key — beste Untertitel (kostet)', 'optional: ELEVENLABS_API_KEY in vendor/video-use/.env');
  opt(addons.filters.subtitles, 'ffmpeg mit libass — Untertitel einbrennen', 'brew reinstall ffmpeg');
  opt(addons.filters.zscale, 'ffmpeg mit zimg — HDR-Clips (iPhone) korrekt umwandeln', 'brew reinstall ffmpeg');

  console.log(process.exitCode ? '\nNoch nicht startklar.\n' : '\nAlles bereit: npm start\n');
})();

'use strict';

const ASPECT_LABEL = {
  '9:16': '9:16 hochkant (Reels, TikTok, Shorts)',
  '16:9': '16:9 quer (YouTube)',
  '1:1': '1:1 quadratisch',
  '4:5': '4:5 (Instagram-Feed)',
  source: 'wie der erste Clip ("source")',
};

const AUDIO_LABEL = {
  original: 'Nur Originalton → audio.original 1, audio.music 0.',
  music: 'Nur Musik → audio.original 0, audio.music 1.',
  mix: 'Musik mit leisem Originalton → audio.music ~0.8, audio.original ~0.4; Stellen mit Sprache oder Jubel über segment.volume lauter.',
};

const quote = (text) => `"""\n${String(text).trim()}\n"""`;

function clipLines(clips) {
  return Object.entries(clips)
    .map(([name, c]) => `- ${name} — ${c.duration.toFixed(1)} s, ${c.width}×${c.height}, ${c.hasAudio ? 'mit Ton' : 'ohne Ton'}`)
    .join('\n');
}

function musicLine(music) {
  return music
    ? `Musik: music/${music.name} (${music.duration.toFixed(1)} s). Die App legt sie unter den Schnitt, Lautstärke über audio.music.`
    : 'Musik: keine → audio.music = 0.';
}

function cut({ settings, clips, music }) {
  const length = settings.length > 0 ? `ca. ${settings.length} s` : 'frei — so lang, wie das Material trägt';
  const audio = music ? AUDIO_LABEL[settings.audio] || AUDIO_LABEL.original : AUDIO_LABEL.original;
  return [
    'Neuer Schnitt.',
    '',
    `Clips in ./clips:\n${clipLines(clips)}`,
    musicLine(music),
    '',
    'Vorgaben:',
    `- Format: ${ASPECT_LABEL[settings.aspect] || settings.aspect}`,
    `- Ziellänge: ${length}`,
    `- Ton: ${audio}`,
    `- Wunsch: ${settings.brief.trim() ? quote(settings.brief) : 'keiner — mach den bestmöglichen Highlight-Schnitt.'}`,
    '',
    'Sieh dir jeden Clip mit dem watch-Skill an und schreib dann ./edit.json nach dem Schema in CLAUDE.md.',
  ].join('\n');
}

function revise({ base, feedback, newClips, clips, music, fresh, settings }) {
  const lines = [`Änderungswunsch zu Version v${base.n} („${base.title}"). ./edit.json enthält genau diese Version.`, '', `Wunsch: ${quote(feedback)}`];
  if (newClips.length) {
    lines.push('', `Neu hochgeladene Clips — vorher ansehen:\n${clipLines(Object.fromEntries(newClips.map((n) => [n, clips[n]])))}`);
  }
  if (fresh) {
    // The original Claude session is gone, so restate what it knew.
    lines.push(
      '',
      'Die vorherige Sitzung ist nicht mehr verfügbar. Die Clips sind aber schon im watch-skill-Index: `watch-skill list` zeigt die video_ids, `watch-skill ask` beantwortet Fragen. Nur gezielt nachschauen, nicht alles neu watchen.',
      '',
      `Alle Clips:\n${clipLines(clips)}`,
      musicLine(music),
      `Ursprüngliche Vorgaben: Format ${settings.aspect}, Ziellänge ${settings.length || 'frei'} s, Ton ${settings.audio}. Wunsch: ${settings.brief || '—'}`,
    );
  }
  lines.push('', 'Passe ./edit.json an und antworte kurz, was du geändert hast.');
  return lines.join('\n');
}

function fix(errors) {
  return [
    'Die App kann ./edit.json so nicht rendern:',
    ...errors.map((e) => `- ${e}`),
    '',
    'Korrigiere die Datei und antworte mit einem Satz.',
  ].join('\n');
}

module.exports = { cut, revise, fix };

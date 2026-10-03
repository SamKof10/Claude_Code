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

const LOOK_LABEL = {
  auto: 'Entscheide selbst — output.grade als Preset oder eigener Farbfilter, nur wenn das Material davon profitiert.',
  none: 'output.grade "none" — Farben unverändert.',
  neutral_punch: 'output.grade "neutral_punch" — sauber, etwas mehr Kontrast, keine Farbverschiebung.',
  warm_cinematic: 'output.grade "warm_cinematic" — warmer, filmischer Look.',
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

// What the add-ons contribute to this run, spelled out so Claude doesn't have
// to guess which tools exist.
function extras({ settings, size, tools, transcripts }) {
  const [W, H] = size;
  const lines = ['', 'Extras:'];
  lines.push(`- Look: ${LOOK_LABEL[settings.look] || LOOK_LABEL.none}`);
  if (settings.captions !== 'none' && transcripts) {
    lines.push(
      `- Untertitel: captions "${settings.captions}". Die App brennt sie aus den Transkripten ein — du lieferst nur die Schnitte.`,
      '  Wortgenaue Transkripte liegen in transcripts/packed.md (Phrasen mit Zeiten). Lies sie zuerst und schneide auf Wortgrenzen.',
    );
  } else {
    lines.push('- Untertitel: captions "none".');
  }
  if (settings.motion === 'none') {
    lines.push('- Animationen: keine — overlays bleibt leer.');
  } else if (!tools.hyperframes) {
    lines.push('- Animationen: gewünscht, aber HyperFrames ist nicht installiert — overlays bleibt leer. Erwähne das in deiner Antwort.');
  } else {
    const what = settings.motion === 'titles' ? 'einen Titel oder ein Intro (max. 2 Overlays, je höchstens 4 s)' : 'nur dort, wo sie den Schnitt wirklich besser machen (max. 3 Overlays)';
    lines.push(`- Animationen mit HyperFrames: ${what}. Leinwand ${W}×${H}, ${settings.fps || 30} fps, Ablauf siehe CLAUDE.md.`);
  }
  if (tools.videoUse) lines.push('- Schnittpunkte prüfen: ./tools/timeline-view (Filmstreifen + Waveform) an kniffligen Stellen.');
  return lines;
}

function cut({ settings, clips, music, size, tools, transcripts }) {
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
    ...extras({ settings, size, tools, transcripts }),
    '',
    'Sieh dir jeden Clip mit dem watch-Skill an und schreib dann ./edit.json nach dem Schema in CLAUDE.md.',
  ].join('\n');
}

function revise({ base, feedback, newClips, clips, music, fresh, settings, size, tools, transcripts }) {
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
      ...extras({ settings, size, tools, transcripts }),
    );
  }
  lines.push('', 'Passe ./edit.json an und antworte kurz, was du geändert hast.');
  return lines.join('\n');
}

// Self-check after the render (video-use's "verify before you show it").
function review({ n, cuts, tools }) {
  const how = tools.videoUse
    ? `./tools/timeline-view renders/v${n}.mp4 <start> <end> für ±1 s um jede Schnittstelle und öffne die PNGs mit Read`
    : `watch-skill watch renders/v${n}.mp4 --timestamps ${cuts.map((t) => t.toFixed(1)).join(',')} --max-frames ${Math.min(24, cuts.length * 2 + 4)}`;
  return [
    `Selbstkontrolle: renders/v${n}.mp4 ist fertig gerendert. Prüfe ihn, bevor der User ihn sieht.`,
    '',
    `Schnittstellen in der Ausgabe (Sekunden): ${cuts.map((t) => t.toFixed(2)).join(', ') || '—'}`,
    `So: ${how}. Dazu die ersten und letzten 2 s.`,
    '',
    'Achte auf: Bildsprünge oder Blitzer am Schnitt, abgeschnittene Wörter, verdeckte Untertitel, Overlays an der falschen Stelle, ein Ende mitten in der Bewegung.',
    '',
    'Passt alles: antworte nur mit OK.',
    'Sonst: korrigiere ./edit.json (höchstens die Fehler, keinen neuen Schnitt) und antworte mit „KORRIGIERT: <was, in einem Satz>“.',
  ].join('\n');
}

function fix(errors) {
  return [
    'Die App kann ./edit.json so nicht rendern:',
    ...errors.map((e) => `- ${e}`),
    '',
    'Korrigiere die Datei und antworte mit einem Satz.',
  ].join('\n');
}

module.exports = { cut, revise, review, fix };

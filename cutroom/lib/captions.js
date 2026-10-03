'use strict';

// Burned-in captions built from word-level transcripts. The chunking follows
// browser-use/video-use (helpers/render.py, MIT): a cue closes on punctuation
// or a pause, otherwise after a few words — but never flashes shorter than a
// readable minimum. Times are mapped onto the output timeline per segment,
// including speed changes.

const STYLES = {
  // Short-form social: 2–3 words, UPPERCASE, heavy outline.
  bold: { words: 2, maxWords: 3, minDur: 0.35, pause: 0.3, upper: true, font: 18, bold: 1, outline: 2.2 },
  // Narrative / talking head: up to 6 words, natural case.
  clean: { words: 5, maxWords: 7, minDur: 0.8, pause: 0.45, upper: false, font: 12, bold: 0, outline: 1.4 },
};
const PUNCT_BREAK = /[.,!?;:…]$/;

function chunkWords(words, style) {
  const chunks = [];
  let current = [];
  words.forEach((w, i) => {
    current.push(w);
    const next = words[i + 1];
    const gap = next ? next.start - w.end : 0;
    const dur = w.end - current[0].start;
    if (
      !next ||
      PUNCT_BREAK.test(w.text) ||
      gap >= style.pause ||
      current.length >= style.maxWords ||
      (current.length >= style.words && dur >= style.minDur)
    ) {
      chunks.push(current);
      current = [];
    }
  });
  return chunks;
}

const stamp = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
};

// Returns { srt, count } for the given edit, or null when nothing is spoken.
function buildSrt(edit, transcripts) {
  const style = STYLES[edit.captions] || STYLES.bold;
  const cues = [];
  let offset = 0;

  for (const seg of edit.segments) {
    const length = (seg.end - seg.start) / seg.speed;
    const words = transcripts[seg.clip] || [];
    const audible = seg.volume * edit.audio.original > 0.05;
    const inside = audible ? words.filter((w) => w.end > seg.start && w.start < seg.end) : [];
    for (const chunk of chunkWords(inside, style)) {
      const toOut = (t) => offset + (Math.min(seg.end, Math.max(seg.start, t)) - seg.start) / seg.speed;
      const start = toOut(chunk[0].start);
      const end = Math.max(toOut(chunk[chunk.length - 1].end), start + 0.3);
      let text = chunk.map((w) => w.text).join(' ').replace(/\s+/g, ' ').trim();
      text = style.upper ? text.replace(/[,;:]$/, '').toUpperCase() : text;
      cues.push({ start, end: Math.min(end, offset + length), text });
    }
    offset += length;
  }
  if (!cues.length) return null;

  // Never let two cues overlap on screen.
  cues.sort((a, b) => a.start - b.start);
  for (let i = 0; i < cues.length - 1; i++) cues[i].end = Math.min(cues[i].end, cues[i + 1].start);

  const srt = cues
    .filter((c) => c.end - c.start > 0.05)
    .map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`)
    .join('\n');
  return { srt, count: cues.length };
}

// libass force_style for the subtitles filter. Sizes are relative to the
// 288-line default script height, so they scale with the output resolution.
// Portrait output keeps captions above the app UI at the bottom of the screen.
function forceStyle(styleName, width, height) {
  const s = STYLES[styleName] || STYLES.bold;
  const portrait = height > width;
  return [
    'FontName=Helvetica',
    `FontSize=${portrait ? s.font : Math.round(s.font * 0.85)}`,
    `Bold=${s.bold}`,
    'PrimaryColour=&H00FFFFFF',
    'OutlineColour=&H00000000',
    'BackColour=&H80000000',
    'BorderStyle=1',
    `Outline=${s.outline}`,
    'Shadow=0',
    'Alignment=2',
    `MarginV=${portrait ? 64 : 22}`,
  ].join(',');
}

module.exports = { buildSrt, forceStyle, chunkWords, STYLES };

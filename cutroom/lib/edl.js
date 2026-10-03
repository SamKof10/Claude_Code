'use strict';

const { ASPECTS } = require('./media');

const MIN_SEGMENT = 0.2;
const MAX_TOTAL = 15 * 60;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const num = (v, fallback) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback);

// Checks the edit Claude wrote against the real clips. Small slips (an end a
// few frames past the clip, a speed out of range) are corrected silently;
// anything that would make the render meaningless is returned as an error so
// Claude can fix it itself.
function validate(raw, clips) {
  const errors = [];
  if (!raw || typeof raw !== 'object') return { errors: ['edit.json ist kein JSON-Objekt.'] };

  const output = raw.output || {};
  const aspect = output.aspect === 'source' || ASPECTS[output.aspect] ? output.aspect : null;
  if (!aspect) errors.push(`output.aspect "${output.aspect}" ist unbekannt (erlaubt: ${Object.keys(ASPECTS).join(', ')}, source).`);

  const audio = raw.audio || {};
  const edit = {
    title: String(raw.title || 'Schnitt').slice(0, 120),
    summary: String(raw.summary || '').slice(0, 2000),
    output: {
      aspect: aspect || '9:16',
      fps: Math.round(clamp(num(output.fps, 30), 24, 60)),
      fadeOut: clamp(num(output.fadeOut, 0), 0, 3),
    },
    audio: {
      original: clamp(num(audio.original, 1), 0, 2),
      music: clamp(num(audio.music, 0), 0, 2),
    },
    segments: [],
  };

  if (!Array.isArray(raw.segments) || raw.segments.length === 0) {
    errors.push('segments fehlt oder ist leer.');
    return { edit, errors };
  }

  let total = 0;
  raw.segments.forEach((seg, i) => {
    const label = `segments[${i}]`;
    const info = clips[seg?.clip];
    if (!info) {
      errors.push(`${label}: Clip "${seg?.clip}" gibt es nicht. Vorhanden: ${Object.keys(clips).join(', ')}.`);
      return;
    }
    if (!info.hasVideo) {
      errors.push(`${label}: "${seg.clip}" hat keine Videospur.`);
      return;
    }
    const start = num(seg.start, NaN);
    let end = num(seg.end, NaN);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      errors.push(`${label}: start/end müssen Zahlen in Sekunden sein.`);
      return;
    }
    if (start < 0 || start >= info.duration) {
      errors.push(`${label}: start ${start} liegt außerhalb von "${seg.clip}" (0–${info.duration.toFixed(2)} s).`);
      return;
    }
    if (end > info.duration) end = info.duration;
    if (end - start < MIN_SEGMENT) {
      errors.push(`${label}: Segment ${start}–${end} ist kürzer als ${MIN_SEGMENT} s.`);
      return;
    }
    const speed = clamp(num(seg.speed, 1), 0.25, 4);
    total += (end - start) / speed;
    edit.segments.push({
      clip: seg.clip,
      start,
      end,
      speed,
      volume: clamp(num(seg.volume, 1), 0, 2),
      focusX: clamp(num(seg.focusX, 0.5), 0, 1),
      focusY: clamp(num(seg.focusY, 0.5), 0, 1),
      why: String(seg.why || '').slice(0, 200),
    });
  });

  if (total > MAX_TOTAL) errors.push(`Gesamtlänge ${Math.round(total)} s ist über dem Limit von ${MAX_TOTAL} s.`);
  edit.duration = total;
  return { edit, errors };
}

module.exports = { validate };

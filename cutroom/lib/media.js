'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ASPECTS = {
  '9:16': [1080, 1920],
  '16:9': [1920, 1080],
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
};

// Runs a command and resolves with its stdout. `track` receives the child so
// a running job can be cancelled from outside.
function run(cmd, args, { onStdout, track } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    track?.(child);
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => {
      out += d;
      onStdout?.(String(d));
    });
    child.stderr.on('data', (d) => {
      err = (err + d).slice(-8000);
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) return resolve(out);
      const tail = err.trim().split('\n').slice(-3).join(' | ');
      reject(new Error(signal ? `${cmd} abgebrochen` : `${cmd} fehlgeschlagen (${code}): ${tail}`));
    });
  });
}

// Stops a child and everything it started. Claude runs in its own process
// group (see agent.js), so a cancel also ends the watch-skill/ffmpeg calls it
// spawned; plain children fall back to a normal kill.
function killTree(child, signal = 'SIGTERM') {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    child.kill(signal);
  }
}

const probeCache = new Map();

// Duration, display size (rotation applied) and whether there is sound.
async function probe(file) {
  const stat = fs.statSync(file);
  const key = `${file}:${stat.size}:${stat.mtimeMs}`;
  if (probeCache.has(key)) return probeCache.get(key);

  const out = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_type,width,height:stream_tags=rotate:stream_side_data=rotation',
    '-of', 'json',
    file,
  ]);
  const json = JSON.parse(out);
  const streams = json.streams || [];
  const video = streams.find((s) => s.codec_type === 'video');
  let width = video?.width || 0;
  let height = video?.height || 0;
  const sideRotation = video?.side_data_list?.find((s) => 'rotation' in s)?.rotation;
  const rotation = Number(video?.tags?.rotate ?? sideRotation ?? 0);
  if (Math.abs(rotation) % 180 === 90) [width, height] = [height, width];

  const info = {
    duration: Number(json.format?.duration) || 0,
    width,
    height,
    hasVideo: Boolean(video),
    hasAudio: streams.some((s) => s.codec_type === 'audio'),
  };
  probeCache.set(key, info);
  return info;
}

function outputSize(aspect, firstClip) {
  if (ASPECTS[aspect]) return ASPECTS[aspect];
  // "source": keep the first clip's shape, long side capped at 1920.
  const { width = 1920, height = 1080 } = firstClip || {};
  const scale = Math.min(1, 1920 / Math.max(width, height));
  const even = (n) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return [even(width), even(height)];
}

// atempo only accepts 0.5–2, so larger changes are chained.
function atempo(speed) {
  const filters = [];
  let s = speed;
  while (s > 2) {
    filters.push('atempo=2');
    s /= 2;
  }
  while (s < 0.5) {
    filters.push('atempo=0.5');
    s /= 0.5;
  }
  if (Math.abs(s - 1) > 1e-3) filters.push(`atempo=${s.toFixed(4)}`);
  return filters;
}

const fmt = (n) => Number(n).toFixed(3);

// Renders a validated edit (see edl.js) to `outFile`. Every segment is first
// normalised to the same size, fps and audio layout, then all segments are
// joined with the concat filter in one final encode, which keeps A/V in sync.
async function render({ clipsDir, edit, clips, musicFile, outFile, onProgress, track }) {
  const segments = edit.segments;
  const [W, H] = outputSize(edit.output.aspect, clips[segments[0].clip]);
  const fps = edit.output.fps;
  const tmp = fs.mkdtempSync(path.join(path.dirname(outFile), '.render-'));
  const steps = segments.length + 1;

  try {
    const parts = [];
    let total = 0;

    for (const [i, seg] of segments.entries()) {
      onProgress?.({ step: i + 1, steps, label: `Segment ${i + 1}/${segments.length}` });
      const info = clips[seg.clip];
      const length = (seg.end - seg.start) / seg.speed;
      const part = path.join(tmp, `seg${String(i).padStart(3, '0')}.mp4`);

      const args = ['-y', '-v', 'error', '-ss', fmt(seg.start), '-t', fmt(seg.end - seg.start), '-i', path.join(clipsDir, seg.clip)];
      if (!info.hasAudio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');

      const vf = [
        `setpts=(PTS-STARTPTS)/${seg.speed}`,
        `scale=${W}:${H}:force_original_aspect_ratio=increase`,
        `crop=${W}:${H}:(iw-${W})*${seg.focusX}:(ih-${H})*${seg.focusY}`,
        'setsar=1',
        `fps=${fps}`,
        'format=yuv420p',
      ];
      const af = info.hasAudio
        ? ['asetpts=PTS-STARTPTS', ...atempo(seg.speed), `volume=${seg.volume}`, 'aresample=48000', 'apad']
        : ['apad'];

      args.push(
        '-map', '0:v:0',
        '-map', info.hasAudio ? '0:a:0' : '1:a:0',
        '-vf', vf.join(','),
        '-af', af.join(','),
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
        '-t', fmt(length),
        part,
      );
      await run('ffmpeg', args, { track });
      parts.push(part);
      total += length;
    }

    onProgress?.({ step: steps, steps, label: 'Zusammenfügen' });

    const n = parts.length;
    const inputs = parts.flatMap((p) => ['-i', p]);
    const graph = [`${parts.map((_, i) => `[${i}:v][${i}:a]`).join('')}concat=n=${n}:v=1:a=1[v0][a0]`];
    const fade = Math.min(edit.output.fadeOut, total / 2);

    graph.push(fade > 0 ? `[v0]fade=t=out:st=${fmt(total - fade)}:d=${fmt(fade)}[v]` : '[v0]null[v]');

    if (musicFile && edit.audio.music > 0) {
      inputs.push('-stream_loop', '-1', '-i', musicFile);
      const musicFade = Math.min(1.5, total / 2);
      graph.push(
        `[a0]volume=${edit.audio.original}[ao]`,
        `[${n}:a]atrim=0:${fmt(total)},asetpts=PTS-STARTPTS,aresample=48000,volume=${edit.audio.music},` +
          `afade=t=out:st=${fmt(total - musicFade)}:d=${fmt(musicFade)},apad[am]`,
        '[ao][am]amix=inputs=2:duration=first:normalize=0[a1]',
      );
    } else {
      graph.push(`[a0]volume=${edit.audio.original}[a1]`);
    }
    // apad + the -t below make the audio exactly as long as the picture.
    graph.push(fade > 0 ? `[a1]afade=t=out:st=${fmt(total - fade)}:d=${fmt(fade)},apad[a]` : '[a1]apad[a]');

    const partial = `${outFile}.part.mp4`;
    await run(
      'ffmpeg',
      [
        '-y', '-v', 'error', '-nostats', '-progress', 'pipe:1',
        ...inputs,
        '-filter_complex', graph.join(';'),
        '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
        '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart',
        '-t', fmt(total),
        partial,
      ],
      {
        track,
        onStdout: (chunk) => {
          const m = chunk.match(/out_time_us=(\d+)/g);
          if (!m) return;
          const done = Number(m[m.length - 1].split('=')[1]) / 1e6;
          onProgress?.({ step: steps, steps, label: 'Zusammenfügen', fraction: Math.min(1, done / total) });
        },
      },
    );
    fs.renameSync(partial, outFile);
    return { duration: total, width: W, height: H };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

module.exports = { run, probe, render, outputSize, killTree, ASPECTS };

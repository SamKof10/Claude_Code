'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { ffmpegFilters } = require('./tools');

const ASPECTS = {
  '9:16': [1080, 1920],
  '16:9': [1920, 1080],
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
};

// Colour grades from browser-use/video-use (helpers/grade.py, MIT). Applied
// per segment, after the crop. Claude may also write its own chain; edl.js
// only lets plain colour filters through.
const GRADES = {
  none: '',
  subtle: 'eq=contrast=1.03:saturation=0.98',
  neutral_punch: "eq=contrast=1.06:brightness=0.0:saturation=1.0,curves=master='0/0 0.25/0.23 0.75/0.77 1/1'",
  warm_cinematic:
    'eq=contrast=1.12:brightness=-0.02:saturation=0.88,' +
    'colorbalance=rs=0.02:gs=0.0:bs=-0.03:rm=0.04:gm=0.01:bm=-0.02:rh=0.08:gh=0.02:bh=-0.05,' +
    "curves=master='0/0 0.25/0.22 0.75/0.78 1/1'",
};

// HDR (PQ/HLG, e.g. iPhone) → SDR, also from video-use's render.py. Without
// it HDR footage comes out washed-out.
const TONEMAP = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p';
const HDR_TRANSFERS = new Set(['smpte2084', 'arib-std-b67']);

const AUDIO_EDGE = 0.03; // 30 ms fade at every cut, so no cut pops

// Runs a command and resolves with its stdout. `track` receives the child so
// a running job can be cancelled from outside.
function run(cmd, args, { onStdout, track, env, cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], env: env || process.env, cwd });
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
    '-show_entries', 'format=duration:stream=codec_type,width,height,color_transfer:stream_tags=rotate:stream_side_data=rotation',
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
    hdr: HDR_TRANSFERS.has(video?.color_transfer),
  };
  probeCache.set(key, info);
  return info;
}

// One JPEG frame for thumbnails. Skipped when the poster is newer than the
// video, so re-renders get a fresh one.
async function poster(video, out, at = 1) {
  try {
    if (fs.statSync(out).mtimeMs >= fs.statSync(video).mtimeMs) return out;
  } catch {
    // no poster yet
  }
  await run('ffmpeg', ['-y', '-v', 'error', '-ss', fmt(Math.max(0, at)), '-i', video, '-frames:v', '1', '-vf', 'scale=480:-2', '-q:v', '4', out]);
  return out;
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

// Where a segment's source lives: uploaded clips, or a full-frame card the
// agent rendered with HyperFrames under overlays/.
const sourcePath = (dir, name) => (name.startsWith('overlays/') ? path.join(dir, name) : path.join(dir, 'clips', name));

// Renders a validated edit (see edl.js) to `outFile`. Every segment is first
// normalised (tone map, crop, grade, fps, 30 ms audio edges), then one final
// pass joins them and layers overlays → captions → fade, and normalises the
// loudness. Doing the join in a single encode keeps A/V in sync.
async function render({ dir, edit, clips, musicFile, srt, outFile, onProgress, track }) {
  const segments = edit.segments;
  const [W, H] = outputSize(edit.output.aspect, clips[segments[0].clip]);
  const fps = edit.output.fps;
  const filters = ffmpegFilters();
  const grade = GRADES[edit.output.grade] ?? edit.output.grade ?? '';
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

      const args = ['-y', '-v', 'error', '-ss', fmt(seg.start), '-t', fmt(seg.end - seg.start), '-i', sourcePath(dir, seg.clip)];
      if (!info.hasAudio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');

      const vf = [
        info.hdr && filters.zscale ? TONEMAP : null,
        `setpts=(PTS-STARTPTS)/${seg.speed}`,
        `scale=${W}:${H}:force_original_aspect_ratio=increase`,
        `crop=${W}:${H}:(iw-${W})*${seg.focusX}:(ih-${H})*${seg.focusY}`,
        grade || null,
        'setsar=1',
        `fps=${fps}`,
        'format=yuv420p',
      ].filter(Boolean);
      const edge = Math.min(AUDIO_EDGE, length / 4);
      const af = info.hasAudio
        ? [
            'asetpts=PTS-STARTPTS',
            ...atempo(seg.speed),
            `volume=${seg.volume}`,
            `afade=t=in:st=0:d=${fmt(edge)}`,
            `afade=t=out:st=${fmt(length - edge)}:d=${fmt(edge)}`,
            'aresample=48000',
            'apad',
          ]
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
    let video = '[v0]';
    let next = n;

    // Overlays (HyperFrames renders, usually with alpha), each shifted so its
    // first frame lands at its start time.
    for (const [k, ov] of (edit.overlays || []).entries()) {
      const file = path.join(dir, ov.file);
      if (/\.webm$/i.test(file)) inputs.push('-c:v', 'libvpx-vp9'); // keeps the alpha channel
      inputs.push('-i', file);
      const end = Math.min(total, ov.start + ov.duration);
      graph.push(
        `[${next}:v]format=yuva420p,scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
          `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black@0,setpts=PTS-STARTPTS+${fmt(ov.start)}/TB[ov${k}]`,
        `${video}[ov${k}]overlay=0:0:eof_action=pass:enable='between(t,${fmt(ov.start)},${fmt(end)})'[vo${k}]`,
      );
      video = `[vo${k}]`;
      next += 1;
    }

    // Captions last, so no overlay can hide them. The file sits next to the
    // ffmpeg working dir, which avoids escaping the absolute path.
    if (srt?.text && filters.subtitles) {
      fs.writeFileSync(path.join(tmp, 'captions.srt'), srt.text);
      graph.push(`${video}subtitles=filename=captions.srt:force_style='${srt.style}'[vs]`);
      video = '[vs]';
    }

    const fade = Math.min(edit.output.fadeOut, total / 2);
    graph.push(fade > 0 ? `${video}fade=t=out:st=${fmt(total - fade)}:d=${fmt(fade)}[v]` : `${video}null[v]`);

    if (musicFile && edit.audio.music > 0) {
      inputs.push('-stream_loop', '-1', '-i', musicFile);
      const musicFade = Math.min(1.5, total / 2);
      graph.push(
        `[a0]volume=${edit.audio.original}[ao]`,
        `[${next}:a]atrim=0:${fmt(total)},asetpts=PTS-STARTPTS,aresample=48000,volume=${edit.audio.music},` +
          `afade=t=out:st=${fmt(total - musicFade)}:d=${fmt(musicFade)},apad[am]`,
        '[ao][am]amix=inputs=2:duration=first:normalize=0[a1]',
      );
    } else {
      graph.push(`[a0]volume=${edit.audio.original}[a1]`);
    }
    // -14 LUFS / -1 dBTP: what YouTube, Instagram and TikTok normalise to.
    // apad + the -t below make the audio exactly as long as the picture.
    const loud = 'loudnorm=I=-14:TP=-1:LRA=11,aresample=48000';
    graph.push(fade > 0 ? `[a1]${loud},afade=t=out:st=${fmt(total - fade)}:d=${fmt(fade)},apad[a]` : `[a1]${loud},apad[a]`);

    const partial = `${outFile}.part.mp4`;
    await run(
      'ffmpeg',
      [
        '-y', '-v', 'error', '-nostats', '-progress', 'pipe:1',
        ...inputs,
        '-filter_complex', graph.join(';'),
        '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart',
        '-t', fmt(total),
        partial,
      ],
      {
        track,
        cwd: tmp,
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

module.exports = { run, probe, render, poster, outputSize, killTree, sourcePath, ASPECTS, GRADES };

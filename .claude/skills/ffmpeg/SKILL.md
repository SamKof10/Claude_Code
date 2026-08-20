---
name: ffmpeg
description: When the user wants to convert, transcode, trim, crop, resize, concatenate, mute, extract audio from, overlay text/watermarks on, generate a thumbnail from, or otherwise process a video or audio file. Also use when the user mentions "ffmpeg", "convert this video", "compress this video", "change the format", "cut a clip", "strip the audio", or gives a local media file and describes an edit.
metadata:
  version: 1.0.0
  upstream: https://ffmpeg.org
---

# ffmpeg

`ffmpeg` is the standard CLI multimedia framework for encoding, decoding,
transcoding, and filtering audio/video. It is **not** a Claude Code plugin —
this skill teaches Claude how to drive the CLI correctly and safely. Nothing
is auto-installed; run the check below first.

## Availability check

```bash
ffmpeg -version || echo "install via the OS package manager, e.g. apt-get install ffmpeg / brew install ffmpeg"
```

## Common recipes

**Convert container/codec:**
```bash
ffmpeg -i input.mov -c:v libx264 -crf 20 -c:a aac output.mp4
```

**Trim without re-encoding (fast, keyframe-accurate to nearest GOP):**
```bash
ffmpeg -ss 00:00:10 -to 00:00:30 -i input.mp4 -c copy output.mp4
```

**Extract audio only:**
```bash
ffmpeg -i input.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3
```

**Resize/scale:**
```bash
ffmpeg -i input.mp4 -vf "scale=1280:-2" output.mp4
```

**Mute a video (drop audio track):**
```bash
ffmpeg -i input.mp4 -c copy -an output.mp4
```

**Concatenate several clips with the same codec:**
```bash
printf "file '%s'\n" clip1.mp4 clip2.mp4 clip3.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
```

**Grab a thumbnail at a timestamp:**
```bash
ffmpeg -ss 00:00:05 -i input.mp4 -frames:v 1 thumb.jpg
```

**Compress for web (two-pass, target bitrate):**
```bash
ffmpeg -i input.mp4 -c:v libx264 -b:v 1M -pass 1 -an -f mp4 /dev/null
ffmpeg -i input.mp4 -c:v libx264 -b:v 1M -pass 2 -c:a aac output.mp4
```

## Guardrails

- Always write to a **new** output filename; never let `-y` overwrite the
  user's only copy of a source file without confirming first.
- Check `ffprobe -v error -show_format -show_streams input.ext` before
  editing blindly, so filter/codec choices match the actual source.
- For long/batch jobs, run in the background and report progress rather than
  blocking the conversation.

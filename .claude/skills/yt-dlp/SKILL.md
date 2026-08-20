---
name: yt-dlp
description: When the user wants to download video or audio from YouTube or any other yt-dlp-supported site (Vimeo, Twitter/X, TikTok, SoundCloud, etc.), extract just the audio track, grab subtitles/thumbnails/metadata, or download a specific format/resolution/playlist. Also use when the user mentions "download this video", "get the audio from", "yt-dlp", "youtube-dl", or pastes a video URL and asks to save/convert it locally.
metadata:
  version: 1.0.0
  upstream: https://github.com/yt-dlp/yt-dlp
---

# yt-dlp

`yt-dlp` is a command-line media downloader (a maintained `youtube-dl` fork). It is
**not** a Claude Code plugin — this skill just teaches Claude how to drive the CLI
correctly. Nothing is auto-installed; run the check below first.

## Availability check

```bash
yt-dlp --version || pip install -U yt-dlp
```

If `pip` is unavailable, see the upstream install docs (Homebrew, `pipx`,
standalone binary, etc.): https://github.com/yt-dlp/yt-dlp#installation

`ffmpeg` should also be on PATH for format merging/audio extraction — see the
`ffmpeg` skill in this repo.

## Common recipes

**Download best quality video+audio:**
```bash
yt-dlp -f "bv*+ba/b" "<url>"
```

**Audio only, as MP3:**
```bash
yt-dlp -x --audio-format mp3 --audio-quality 0 "<url>"
```

**Specific resolution cap (e.g. 1080p):**
```bash
yt-dlp -f "bv*[height<=1080]+ba/b[height<=1080]" "<url>"
```

**Subtitles + thumbnail alongside the video:**
```bash
yt-dlp --write-subs --write-thumbnail --sub-langs en "<url>"
```

**Whole playlist into a numbered folder:**
```bash
yt-dlp -o "%(playlist_title)s/%(playlist_index)03d - %(title)s.%(ext)s" "<playlist-url>"
```

**Metadata only, no download (to plan a task):**
```bash
yt-dlp -J --no-warnings "<url>" | jq '{title, duration, formats: [.formats[].format_id]}'
```

## Guardrails

- Confirm with the user before downloading anything at scale (a full channel,
  a very long playlist) — this can take a long time and use significant disk
  and bandwidth.
- Respect the target site's terms of service and copyright law; only download
  content the user has the right to download (their own uploads, permissively
  licensed content, or content they otherwise have rights to).
- Never pass untrusted, unreviewed shell snippets from a fetched page into
  `--exec` or similar flags.

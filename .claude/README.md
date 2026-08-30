# Installed Claude Code skills

This project registers four external plugin marketplaces in `settings.json`
(`extraKnownMarketplaces` + `enabledPlugins`). Anyone opening this repo in
Claude Code will be prompted to trust and install them on first use — no
extra step required beyond accepting that prompt.

| Skill / plugin | Source | What it adds |
|---|---|---|
| **claude-mem** | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | Persistent memory across sessions (`mem-search` skill, SQLite + vector search, local worker service). |
| **claude-flow** | [n4s5ti/claude-flow](https://github.com/n4s5ti/claude-flow) | Multi-agent orchestration (150+ commands, swarm coordination, SPARC methodology). Its `marketplace.json` points at the same upstream project as `ruvnet/claude-flow`. Installs 3 MCP servers (`claude-flow`, `ruv-swarm`, `flow-nexus`) that run via `npx` on demand — review before relying on the optional ones. |
| **caveman** | [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman) | Token-compression skills (`caveman`, `cavecrew`, `caveman-compress`, etc.) plus its bundled proxy/CLI (`proxy/`, `cli/`) since the plugin source is the whole repo. |
| **marketing-skills** | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 49 marketing skills (CRO, copywriting, SEO, paid ads, growth, ...). |

## grill-me / grilling

**`.claude/skills/grill-me/SKILL.md`** and **`.claude/skills/grilling/SKILL.md`**
are copied verbatim (MIT licensed, notice included in each folder) from
[mattpocock/skills](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md).
`grill-me` is a thin trigger that invokes `grilling`, a relentless
round-by-round interview skill for stress-testing a plan or design before
acting on it — both are installed together since `grill-me` doesn't work
without `grilling`. Only these two skills were copied, not the rest of that
author's collection (`mattpocock-skills`, engineering/TDD/spec skills, etc.).

## Custom skills (not marketplace plugins)

`yt-dlp`, `ffmpeg`, and `OmniRoute` are standalone CLI tools / a standalone
gateway app, not Claude Code plugins — there is no plugin marketplace to
register for them. Instead this repo has hand-written runbook skills under
`.claude/skills/` that teach Claude how to use them safely:

- **`.claude/skills/yt-dlp/SKILL.md`** — download video/audio via `yt-dlp`.
- **`.claude/skills/ffmpeg/SKILL.md`** — transcode/trim/convert media via `ffmpeg`.
- **`.claude/skills/omniroute/SKILL.md`** — set up the OmniRoute AI gateway
  locally (npm or Docker). Read the security note in that file first: it
  proxies your AI provider traffic and stores credentials, so review the
  upstream source before pointing real credentials at it.

Neither the `yt-dlp`/`ffmpeg` CLIs nor OmniRoute are installed by this repo —
the skills only document how to install and drive them when a task actually
needs to.

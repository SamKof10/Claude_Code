---
name: omniroute
description: When the user wants to set up or use OmniRoute — a self-hosted AI gateway that routes chat/completions requests across 300+ providers with automatic failover and token compression. Use when the user mentions "OmniRoute", "AI gateway", "provider failover", or wants a single OpenAI-compatible endpoint in front of multiple LLM providers.
metadata:
  version: 1.0.0
  upstream: https://github.com/diegosouzapw/OmniRoute
---

# OmniRoute

OmniRoute is **not a Claude Code skill or plugin** — it is a standalone,
self-hosted gateway application (Next.js app + local proxy) that sits in
front of 300+ AI providers behind one OpenAI-compatible endpoint. It was
requested alongside the plugin-based skills in this repo, so this file
documents it as a runbook rather than registering it as a plugin (there is
no `.claude-plugin/marketplace.json` in the upstream repo to register).

## What it does

- Aggregates many AI providers behind `http://localhost:20128` with automatic
  failover across subscription/API/cheap/free tiers.
- Stores provider credentials locally, AES-256-GCM encrypted.
- Applies token-compression middleware to reduce provider-billed tokens.

## Security note before installing

Routing your AI provider traffic through **any** third-party gateway means
that gateway's code sees every prompt, completion, and (if configured) API
key that passes through it. Before running this in a real environment:

- Review the source (`Dockerfile`, `docker-compose.yml`, the request-proxy
  code) rather than trusting the README's claims blindly.
- Prefer the Docker option so it's isolated from the host, and keep it off
  a network egress path you don't control.
- Only point production credentials at it once you've verified the above —
  start with free/no-auth providers if just evaluating it.

## Install options (run only when the user explicitly wants OmniRoute running)

**npm (global):**
```bash
npm install -g omniroute
omniroute start   # serves on localhost:20128
```

**Docker (recommended for isolation):**
```bash
docker run -p 20128:20128 diegosouzapw/omniroute
```

## Usage

Once running, point any OpenAI-compatible client (including Claude Code's own
model config, if desired) at `http://localhost:20128/v1` instead of a
provider's native endpoint.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o-mini", "messages": [{"role":"user","content":"hi"}]}'
```

See the upstream README for the full provider/model catalog and failover-tier
configuration: https://github.com/diegosouzapw/OmniRoute

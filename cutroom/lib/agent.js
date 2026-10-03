'use strict';

const os = require('os');
const path = require('path');
const { spawn, execFile } = require('child_process');
const { killTree } = require('./media');

const CLAUDE_BIN = process.env.CUTROOM_CLAUDE_BIN || 'claude';
const MODEL = process.env.CUTROOM_MODEL || 'opus';
const TIMEOUT_MS = Number(process.env.CUTROOM_TIMEOUT_MIN || 45) * 60 * 1000;
const WATCH_HOME = path.join(os.homedir(), '.watch-skill');

// Tools the headless cutter may use. It can watch, read frames and write
// edit.json — nothing else. Rendering stays with the app.
const ALLOWED_TOOLS = ['Skill', 'Bash(watch-skill:*)', 'Bash(ffprobe:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep'];

// Claude Code prefers an API key over the claude.ai login whenever one is in
// the environment. Removing them guarantees every run bills the Pro plan.
const API_ENV = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'CLAUDECODE'];

function subscriptionEnv() {
  const env = { ...process.env };
  for (const key of API_ENV) delete env[key];
  return env;
}

function strippedApiKey() {
  return API_ENV.slice(0, 2).some((key) => process.env[key]);
}

function exec(cmd, args, timeout = 15000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { env: subscriptionEnv(), timeout }, (error, stdout, stderr) => {
      resolve({ ok: !error, out: String(stdout || stderr || error?.message || '').trim() });
    });
  });
}

async function authStatus() {
  const version = await exec(CLAUDE_BIN, ['--version']);
  if (!version.ok) return { installed: false };
  const status = await exec(CLAUDE_BIN, ['auth', 'status', '--json']);
  let auth = {};
  try {
    auth = JSON.parse(status.out);
  } catch {
    // Older CLIs print text only; treat a zero exit as logged in.
    auth = { loggedIn: status.ok };
  }
  const method = String(auth.authMethod || '');
  return {
    installed: true,
    version: version.out.split(' ')[0],
    loggedIn: Boolean(auth.loggedIn),
    subscription: auth.loggedIn && !/api.?key/i.test(method),
    method,
  };
}

const short = (s, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// Turns one tool call into a line a human wants to read in the live log.
function describeTool(name, input = {}) {
  if (name === 'Bash') {
    const cmd = String(input.command || '');
    const clips = [...cmd.matchAll(/watch-skill\s+watch\s+["']?(?:clips\/)?([^"'\s]+)/g)].map((m) => m[1]);
    if (clips.length) {
      const range = cmd.match(/--start\s+(\S+).*--end\s+(\S+)/);
      if (range && clips.length === 1) return { icon: 'watch', text: `Schaut genauer hin: ${clips[0]} ${range[1]}–${range[2]}` };
      return { icon: 'watch', text: `Schaut ${clips.length > 1 ? 'Clips' : 'Clip'}: ${clips.join(', ')}` };
    }
    if (/watch-skill\s+ask/.test(cmd)) return { icon: 'ask', text: `Fragt den Index: ${short(cmd.replace(/^.*ask\s+\S+\s+/, ''))}` };
    if (/watch-skill\s+doctor/.test(cmd)) return { icon: 'tool', text: 'Prüft watch-skill' };
    if (/ffprobe/.test(cmd)) return { icon: 'tool', text: 'Misst Clipdauer' };
    const firstLine = cmd.split('\n')[0];
    return { icon: 'tool', text: short(firstLine === cmd ? cmd : `${firstLine} …`) };
  }
  if (name === 'Read') {
    const file = String(input.file_path || '');
    if (/\.(jpe?g|png|webp)$/i.test(file)) return { icon: 'frame', text: 'Frame', frame: true };
    return { icon: 'tool', text: `Liest ${path.basename(file)}` };
  }
  if (name === 'Write' || name === 'Edit') {
    const file = path.basename(String(input.file_path || ''));
    return { icon: 'cut', text: file === 'edit.json' ? 'Schreibt die Schnittliste' : `Schreibt ${file}` };
  }
  if (name === 'Skill') return { icon: 'tool', text: `Lädt Skill: ${input.skill || input.name || ''}` };
  return { icon: 'tool', text: name };
}

function friendlyError(text) {
  if (/usage limit|rate limit|limit reached|resets? (at|in)/i.test(text)) {
    return `Pro-Limit erreicht — ${short(text, 200).replace(/\.$/, '')}. Sobald das Limit zurückgesetzt ist, einfach erneut starten.`;
  }
  if (/not logged in|login|authenticat|401/i.test(text)) {
    return 'Claude Code ist nicht angemeldet. Im Terminal `claude` starten und mit /login dein Pro-Konto verbinden.';
  }
  return short(text, 400);
}

// Runs `claude -p` once. Resolves with { ok, sessionId, result, error }.
function runClaude({ cwd, prompt, resume, onEvent, track }) {
  return new Promise((resolve) => {
    const args = [
      '-p',
      '--output-format', 'stream-json',
      '--verbose',
      '--model', MODEL,
      '--permission-mode', 'acceptEdits',
      '--allowedTools', ALLOWED_TOOLS.join(','),
      '--add-dir', WATCH_HOME,
    ];
    if (resume) args.push('--resume', resume);

    const child = spawn(CLAUDE_BIN, args, { cwd, env: subscriptionEnv(), stdio: ['pipe', 'pipe', 'pipe'], detached: true });
    track?.(child);
    // The prompt goes over stdin so no variadic flag can swallow it.
    child.stdin.end(prompt);

    let sessionId = resume || null;
    let final = null;
    let stderr = '';
    let buffer = '';
    const timer = setTimeout(() => killTree(child), TIMEOUT_MS);

    const handle = (line) => {
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        return;
      }
      if (msg.session_id) sessionId = msg.session_id;
      if (msg.type === 'system' && msg.subtype === 'init') {
        onEvent?.({ icon: 'start', text: `Claude Code läuft (${msg.model || MODEL})` });
      } else if (msg.type === 'assistant') {
        for (const block of msg.message?.content || []) {
          if (block.type === 'text' && block.text.trim()) onEvent?.({ icon: 'say', text: block.text.trim() });
          if (block.type === 'tool_use') onEvent?.(describeTool(block.name, block.input));
        }
      } else if (msg.type === 'result') {
        final = msg;
      }
    };

    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      lines.forEach(handle);
    });
    child.stderr.on('data', (d) => {
      stderr = (stderr + d).slice(-4000);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        sessionId,
        error: err.code === 'ENOENT' ? 'Claude Code (`claude`) ist nicht installiert oder nicht im PATH.' : err.message,
      });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (buffer) handle(buffer);
      if (signal) return resolve({ ok: false, sessionId, cancelled: true, error: 'Abgebrochen.' });
      if (final && !final.is_error && final.subtype === 'success') {
        return resolve({ ok: true, sessionId, result: String(final.result || '').trim() });
      }
      const text = String(final?.result || final?.error || stderr || `claude beendet mit Code ${code}`);
      resolve({ ok: false, sessionId, error: friendlyError(text), raw: text });
    });
  });
}

module.exports = { runClaude, authStatus, strippedApiKey, describeTool, MODEL };

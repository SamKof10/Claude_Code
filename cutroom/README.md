# Cutroom

Clips hochladen, kurz sagen, was du willst, und Claude schneidet. Die App
startet Claude Code headless. Opus 5.5 sieht sich jeden Clip mit dem
`/watch`-Skill an (Frames, OCR, Transcript) und schreibt eine Schnittliste.
ffmpeg rendert sie. Passt was nicht, schreibst du „kürzer, Clip 3 raus“ und
bekommst eine neue Version.

**Läuft über dein Claude-Pro-Abo, nicht über die API.** Cutroom ruft das
offizielle `claude`-CLI auf, das mit deinem claude.ai-Konto angemeldet ist.
Ein gesetzter `ANTHROPIC_API_KEY` wird für diese Aufrufe ausgeblendet, damit
nichts über die API abgerechnet wird.

```
Browser ──► server.js ──► claude -p (Opus 5.5, dein Pro-Login)
  ▲              │            └─ watch-skill watch clips/… → Frames + Transcript
  │              │            └─ schreibt edit.json
  │              └──► ffmpeg rendert edit.json → renders/vN.mp4
  └── Live-Log (SSE), Player, Versionen, Feedback
```

## Einrichten (macOS, einmalig)

```bash
brew install node ffmpeg uv
npm install -g @anthropic-ai/claude-code
uv tool install "watch-skill[perceive,whisper,ocr]"

claude            # einmal starten, /login, mit dem Pro-Konto anmelden, /exit
```

`perceive`, `whisper` und `ocr` sind Pflicht. Ohne sie bricht `watch-skill`
ab oder liefert kein Transcript.

## Starten

```bash
cd cutroom
npm run check   # prüft Node, Claude-Login, ffmpeg und watch-skill
npm start       # → http://localhost:4317
```

Keine npm-Abhängigkeiten, nur Node ≥ 20. Projekte, Clips und Renders liegen
in `~/Cutroom/projects/<id>/` und nicht im Repo.

## So läuft ein Schnitt

1. **Clips** reinziehen (MP4, MOV, MKV, WebM, beliebig groß).
2. **Vorgaben**: Format (9:16, 16:9, 1:1, 4:5, Original), Ziellänge,
   optional ein Musiktrack (Originalton, nur Musik oder Mix) und ein Satz,
   was du willst.
3. **Schneiden lassen**: Im Live-Log siehst du, welchen Clip Claude gerade
   anschaut, wie viele Frames es liest und wann es die Schnittliste schreibt.
   Danach rendert die App.
4. **Ergebnis**: Player, Timeline (Klick springt zum Segment), Begründung pro
   Segment, Download.
5. **Überarbeiten**: Wunsch eintippen oder Chip anklicken. Claude arbeitet in
   derselben Sitzung weiter und schaut nicht alles neu an. Jede Version
   bleibt erhalten, und du kannst von jeder alten Version aus weitermachen.

## Was Claude darf und was nicht

Der Agent läuft mit einer festen Liste an Werkzeugen: `watch-skill`,
`ffprobe`, Dateien lesen und `edit.json` schreiben. Er rendert nie selbst und
hat keine anderen Shell-Befehle. Die App prüft jede Schnittliste gegen die
echten Clips (Dateinamen, Zeiten, Dauer). Bei Fehlern geht sie zur Korrektur
zurück an Claude, maximal zweimal.

Die Anweisungen für den Cutter stehen in [`agent/CLAUDE.md`](agent/CLAUDE.md),
inklusive Schema und Schnitt-Regeln. Wenn du deinen Stil reinschreibst (etwa
„immer auf den Beat“ oder „nie länger als 2 s pro Einstellung“), gilt das ab
dem nächsten Schnitt für alle Projekte.

## Ehrlich gesagt

- **Pro-Limit:** Frames sind teuer. Fünf kurze Clips gehen locker, 20 Minuten
  Rohmaterial fressen spürbar vom 5-Stunden-Fenster. Ist das Limit erreicht,
  zeigt die App das an. Wenn es zurückgesetzt ist, startest du einfach neu.
- **Nur lokal und nur für dich.** Der Server hört nur auf `127.0.0.1`.
  Anthropic erlaubt das Abo für Claude Code auf deinem eigenen Rechner. Die
  App als Dienst für andere zu hosten, wäre ein Verstoß gegen die
  Nutzungsbedingungen. Dafür bräuchte es einen API-Key.
- **Kein Beat-Sync:** Claude sieht Bilder und liest das Transcript, hört aber
  keine Musik. Die Musik liegt unter dem Schnitt, die Schnitte sitzen aber
  nicht auf dem Beat.
- **HDR-Material** (iPhone, Dolby Vision) wird ohne Tone-Mapping nach SDR
  gerendert und kann blass aussehen. Am besten vorher in SDR exportieren.

## Einstellungen (Umgebungsvariablen)

| Variable | Standard | Wofür |
|---|---|---|
| `PORT` | `4317` | Port der Oberfläche |
| `CUTROOM_DATA` | `~/Cutroom` | Ablage für Projekte |
| `CUTROOM_MODEL` | `opus` | Modell für Claude Code (`opus` = aktuelles Opus) |
| `CUTROOM_TIMEOUT_MIN` | `45` | Abbruch eines Agenten-Laufs nach N Minuten |
| `CUTROOM_CLAUDE_BIN` | `claude` | Pfad zum Claude-CLI |

## Aufbau

| Datei | Aufgabe |
|---|---|
| `server.js` | HTTP-Server ohne Abhängigkeiten: API, Uploads als Stream, SSE, Video mit Range |
| `lib/agent.js` | startet `claude -p` mit Abo-Umgebung, liest stream-json, übersetzt Tool-Aufrufe ins Log |
| `lib/jobs.js` | Ablauf: Clips messen → Claude → Schnittliste prüfen → rendern → Version speichern |
| `lib/edl.js` | prüft und normalisiert `edit.json` |
| `lib/media.js` | ffprobe, Rendering (Zuschnitt, Tempo, Ton, Musik, Abblende) |
| `lib/prompts.js` | Aufträge an Claude: neuer Schnitt, Überarbeitung, Korrektur |
| `agent/` | wird in jedes Projekt kopiert: `CLAUDE.md` und der `watch`-Skill |
| `public/` | Oberfläche (Vanilla JS) |

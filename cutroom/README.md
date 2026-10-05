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
Browser ──► server.js ──┬─► Transkript (Whisper lokal / ElevenLabs)   nur bei Untertiteln
  ▲                     ├─► claude -p (Opus 5.5, dein Pro-Login)
  │                     │     ├─ watch-skill watch clips/…  → Frames + Transcript
  │                     │     ├─ ./tools/timeline-view      → Filmstreifen + Waveform (video-use)
  │                     │     ├─ ./tools/hyperframes        → Titel, Intros als Video (HyperFrames)
  │                     │     └─ schreibt edit.json
  │                     ├─► ffmpeg: Grade → Schnitt → Overlays → Untertitel → -14 LUFS
  │                     └─► optional: Claude prüft das Ergebnis und bessert nach
  └── Live-Log (SSE), Player, Versionen, Feedback
```

Dazu kommen zwei Open-Source-Projekte als Add-ons:

- **[video-use](https://github.com/browser-use/video-use)** (browser-use, MIT):
  Timeline-Ansicht für wortgenaue Schnitte, Color-Grades, HDR-Tonemapping,
  30-ms-Fades gegen Knackser, Untertitel-Logik, Selbstkontrolle.
- **[HyperFrames](https://github.com/heygen-com/hyperframes)** (HeyGen,
  Apache 2.0): Claude baut Titel, Intros und Lower-Thirds als HTML/GSAP, und
  HyperFrames rendert sie als Video mit Alpha-Kanal. Außerdem kommt die
  lokale Whisper-Transkription für Untertitel von hier.

## Einrichten (macOS, einmalig)

```bash
brew install node ffmpeg uv
npm install -g @anthropic-ai/claude-code
uv tool install "watch-skill[perceive,whisper,ocr]"

claude            # einmal starten, /login, mit dem Pro-Konto anmelden, /exit
```

`perceive`, `whisper` und `ocr` sind Pflicht. Ohne sie bricht `watch-skill`
ab oder liefert kein Transcript.

**Add-ons (optional, für Look, Untertitel, Animationen, Selbstkontrolle):**

```bash
brew install whisper-cpp   # schnelle lokale Transkription für Untertitel
cd cutroom && npm run setup
```

`npm run setup` klont video-use in `cutroom/vendor/` (fester Commit) und
richtet dessen Python-Umgebung mit `uv` ein. Außerdem lädt es HyperFrames in
fester Version und installiert dessen Skills nach `~/.claude/skills`. Die
nutzt dann auch dein normales Claude Code. HyperFrames braucht Node 22+.

Für die besten Untertitel kannst du optional einen ElevenLabs-Key in
`cutroom/vendor/video-use/.env` eintragen (`ELEVENLABS_API_KEY=…`). Das ist
ein bezahlter Dienst. Ohne Key läuft alles lokal und kostenlos mit Whisper.

## Starten

```bash
cd cutroom
npm run check   # prüft Node, Claude-Login, ffmpeg und watch-skill
npm start       # → http://localhost:4317
```

Keine npm-Abhängigkeiten, nur Node ≥ 20 (für Animationen ≥ 22). Projekte, Clips und Renders liegen
in `~/Cutroom/projects/<id>/` und nicht im Repo.

## Home

Die Startseite zeigt auf einen Blick:

- einen laufenden Schnitt mit Live-Status (ein Klick öffnet ihn)
- eine Ablage: **Clips aufs Home ziehen legt sofort ein neues Projekt an**
  und lädt sie hoch
- Kennzahlen: Projekte, fertige Videos, Rohmaterial und geschnittene Länge
- die zuletzt geschnittenen Videos mit Vorschaubild (ein Klick springt
  direkt zu dieser Version)
- alle Projekte nach letzter Aktivität
- den System-Check (Claude-Login, watch-skill, ffmpeg, Add-ons) und den
  Speicherplatz. Rohclips sind groß, und bei weniger als 10 GB frei warnt
  die App.

## So läuft ein Schnitt

1. **Clips** reinziehen (MP4, MOV, MKV, WebM, beliebig groß).
2. **Vorgaben**: Format (9:16, 16:9, 1:1, 4:5, Original), Ziellänge,
   optional ein Musiktrack (Originalton, nur Musik oder Mix) und ein Satz,
   was du willst. Dazu die Add-on-Schalter:
   - **Look**: Original, Clean, Cinematic oder „Claude entscheidet“
   - **Untertitel**: aus, BOLD (2–3 Wörter, Reels) oder Clean (Satzteile)
   - **Animationen**: aus, Titel/Intro oder „Claude entscheidet“
   - **Selbstkontrolle**: Claude schaut sich das fertige Video an jeder
     Schnittstelle an und bessert nach, bevor du es siehst
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
`ffprobe`, `./tools/timeline-view`, `./tools/hyperframes`, Dateien lesen und
schreiben. Den Schnitt rendert er nie selbst und hat keine anderen
Shell-Befehle. Der HyperFrames-Wrapper lässt nur lokale Befehle zu (`init`,
`lint`, `render` …). `publish`, Cloud-Rendering und Dev-Server sind
gesperrt, Telemetrie ist aus. Eigene Color-Grades gehen nur aus einer Liste
reiner Farbfilter durch. Die App prüft jede Schnittliste gegen die
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
- **Animationen und Selbstkontrolle kosten viel Limit.** Für eine
  Animation schreibt Claude HTML/GSAP und liest dazu die HyperFrames-Skills.
  Die Selbstkontrolle ist ein zusätzlicher Durchlauf. Beides nur einschalten,
  wenn du es wirklich brauchst.
- **Erster Untertitel-Lauf dauert:** Whisper lädt einmalig das Modell
  `large-v3-turbo` (~1,6 GB). HyperFrames lädt beim ersten Rendern ein
  headless Chrome. Danach geht beides offline und schnell.
- **Kein Beat-Sync:** Claude sieht Bilder und liest das Transcript, hört aber
  keine Musik. Die Musik liegt unter dem Schnitt, die Schnitte sitzen aber
  nicht auf dem Beat.
- **HDR-Material** (iPhone, HLG/PQ) wird automatisch nach SDR getonemappt.
  Das ist video-uses Kette und braucht ein ffmpeg mit zimg. Homebrew hat
  das, `npm run check` sagt es dir.

## Einstellungen (Umgebungsvariablen)

| Variable | Standard | Wofür |
|---|---|---|
| `PORT` | `4317` | Port der Oberfläche |
| `CUTROOM_DATA` | `~/Cutroom` | Ablage für Projekte |
| `CUTROOM_MODEL` | `opus` | Modell für Claude Code (`opus` = aktuelles Opus) |
| `CUTROOM_TIMEOUT_MIN` | `45` | Abbruch eines Agenten-Laufs nach N Minuten |
| `CUTROOM_CLAUDE_BIN` | `claude` | Pfad zum Claude-CLI |
| `CUTROOM_WHISPER_MODEL` | `large-v3-turbo` | Whisper-Modell für Untertitel (mehrsprachig, erkennt Deutsch selbst) |
| `CUTROOM_HYPERFRAMES_VERSION` | `0.8.114` | HyperFrames-Version (danach `npm run setup`) |
| `ELEVENLABS_API_KEY` | — | Optional: Untertitel über ElevenLabs Scribe statt Whisper |

## Aufbau

| Datei | Aufgabe |
|---|---|
| `server.js` | HTTP-Server ohne Abhängigkeiten: API, Uploads als Stream, SSE, Video mit Range |
| `lib/agent.js` | startet `claude -p` mit Abo-Umgebung, liest stream-json, übersetzt Tool-Aufrufe ins Log |
| `lib/jobs.js` | Ablauf: Clips messen → transkribieren → Claude → Schnittliste prüfen → rendern → Selbstkontrolle → Version speichern |
| `lib/edl.js` | prüft und normalisiert `edit.json` (inkl. Grade-Filter-Whitelist, Overlays) |
| `lib/media.js` | ffprobe, Rendering (Tonemapping, Zuschnitt, Grade, Tempo, 30-ms-Fades, Overlays, Untertitel, Musik, Lautheit) |
| `lib/captions.js` | Untertitel aus Wort-Transkripten, auf die Ausgabe-Timeline gerechnet |
| `lib/transcribe.js` | Wort-Transkripte über Whisper (HyperFrames) oder ElevenLabs (video-use) |
| `lib/tools.js` | findet die Add-ons und meldet ihren Status |
| `lib/dashboard.js` | Daten fürs Home: Kennzahlen, letzte Renders mit Vorschaubild, Projekte, laufender Job, Speicher |
| `lib/prompts.js` | Aufträge an Claude: neuer Schnitt, Überarbeitung, Korrektur, Selbstkontrolle |
| `agent/` | wird in jedes Projekt kopiert: `CLAUDE.md`, der `watch`-Skill und `tools/` (Wrapper für timeline-view und HyperFrames) |
| `scripts/setup.js` | `npm run setup`: installiert video-use und HyperFrames in fester Version |
| `public/` | Oberfläche (Vanilla JS) |

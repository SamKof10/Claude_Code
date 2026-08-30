# Claude Code

Projekte, die in Claude-Code-Sessions entstanden sind. Jedes liegt in einem
eigenen Ordner und ist unabhängig lauffähig.

**Live:** [samkof10.github.io/Claude_Code](https://samkof10.github.io/Claude_Code/)
— das Ghost-Line-FPV-Portfolio, automatisch deployed via GitHub Actions bei
jedem Push, der `fpv-portfolio-react/` ändert
([Workflow](.github/workflows/deploy-fpv-portfolio.yml)).

| Ordner | Was es ist | Stack |
|---|---|---|
| [`fpv-portfolio-react/`](fpv-portfolio-react) | Ghost Line FPV — Portfolio, mit Komponenten aus Magic UI, Smooth UI, Retro UI und unlumen UI | Vite, React 19, Tailwind 4, shadcn/ui, Motion |
| [`fpv-portfolio/`](fpv-portfolio) | Ghost Line FPV — dieselbe Seite als Ur-Version | statisches HTML/CSS/JS, kein Build |
| [`aurel/`](aurel) | AUREL — Premium-Store für eine zirkadiane Schreibtischleuchte | Next.js 16, React 19, Tailwind 4, Motion |
| [`mudroom/`](mudroom) | MUDROOM — Premium-Store für eine automatische Bike-Waschbox | Next.js 16, React 19, Tailwind 4, Motion |
| [`gym-tracker/`](gym-tracker) | Gym Tracker — PWA für einen 5-Tage-Split, mit echtem Background-Push | Vanilla JS PWA + Node/Express |
| [`studyhub/`](studyhub) | StudyHub — KI-gestützte Lernplattform: Anmeldung, Dokumente, Notizen, Karteikarten, Quizze, Prüfungspläne, Fokustimer und ein AI-Tutor | Next.js 16, React 19, Tailwind 4, Zustand, Tiptap, Recharts |

## Fertige Seiten ohne Build

`sites/` enthält von jedem Projekt eine Ein-Datei-Version. Einfach im
Browser öffnen — kein Server, kein Build:

- [`sites/aurel.html`](sites/aurel.html) — komplette Seite inkl. aller
  Routen, Warenkorb und Checkout
- [`sites/mudroom.html`](sites/mudroom.html) — dito
- [`sites/gym-tracker.html`](sites/gym-tracker.html) — Trainingsplan,
  Satz-Logging und Streaks laufen vollständig lokal (`localStorage`).
  **Nur die 20-Uhr-Push-Erinnerung fehlt** — die braucht `gym-tracker/server`,
  weil ein geschlossener Browser-Tab sich nicht selbst wecken kann.

Das sind Snapshots. Neu erzeugen: bei AUREL und MUDROOM mit
`npm run standalone` (Ergebnis: `standalone/dist/local.html`), beim Gym
Tracker durch Inlinen von `public/styles.css` und `public/app.js` in
`public/index.html`.

## Den Gym Tracker mit Push starten

```bash
cd gym-tracker/server
npm install
npm run generate-vapid-keys   # VAPID-Schlüsselpaar erzeugen
cp .env.example .env          # Schlüssel eintragen
npm start                     # App + API auf http://localhost:3000
```

Push braucht HTTPS in Produktion und einen dauerhaft laufenden Server —
Details in [`gym-tracker/README.md`](gym-tracker/README.md).

## StudyHub starten

```bash
cd studyhub
npm install
npm run dev     # http://localhost:3000
```

Läuft ohne jede Konfiguration: Konto anlegen — das liegt im Browser, kein
Server ist beteiligt — und StudyHub startet leer. Auf Wunsch füllt es sich per
Klick mit einem vollständigen Demo-Datensatz (Fächer, Dokumente, Karteikarten,
Quizze, Prüfungen, Lernstatistiken). Alle KI-Funktionen laufen über einen
eingebauten Demo-Generator, der aus den eigenen Dokumenten und Notizen
ableitet. Mit `ANTHROPIC_API_KEY` in `.env.local` schaltet die App auf ein
echtes Modell um — der Schlüssel wird ausschließlich serverseitig gelesen.
Details in [`studyhub/README.md`](studyhub/README.md).

**Auf Vercel deployen.** Repo importieren und **Root Directory** auf `studyhub`
setzen — ohne das baut Vercel das Repo-Root, findet dort keine `package.json`
und liefert eine 404 statt der App. Der Rest läuft auf den Standardwerten.

## Die Next.js-Projekte lokal starten

```bash
cd aurel        # oder mudroom
npm install
npm run dev     # http://localhost:3000
```

Weitere Befehle in beiden Projekten:

```bash
npm run build       # Produktions-Build
npm run lint
npm run export      # statischer Export nach ./out, für jeden Static-Host
npm run standalone  # Ein-Datei-Build nach standalone/dist/
```

Details, Designsystem und Architektur stehen jeweils in der README des
Projekts.

## Hinweis

AUREL und MUDROOM sind Konzeptseiten. Produkte, Preise, Maße, technische
Werte und Bewertungen sind Demodaten, und die Checkouts nehmen keine
echten Zahlungen entgegen — das steht auch auf den Seiten selbst.

Auch die StudyHub-Daten sind erfunden. Ohne API-Key stammen alle
KI-Antworten aus dem lokalen Demo-Generator; die Oberfläche kennzeichnet
das entsprechend.

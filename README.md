# Claude Code

Projekte, die in Claude-Code-Sessions entstanden sind. Jedes liegt in einem
eigenen Ordner und ist unabhängig lauffähig.

| Ordner | Was es ist | Stack |
|---|---|---|
| [`fpv-portfolio/`](fpv-portfolio) | Ghost Line FPV — Portfolio-Single-Page | statisches HTML/CSS/JS, kein Build |
| [`aurel/`](aurel) | AUREL — Premium-Store für eine zirkadiane Schreibtischleuchte | Next.js 16, React 19, Tailwind 4, Motion |
| [`mudroom/`](mudroom) | MUDROOM — Premium-Store für eine automatische Bike-Waschbox | Next.js 16, React 19, Tailwind 4, Motion |
| [`gym-tracker/`](gym-tracker) | Gym Tracker — PWA für einen 5-Tage-Split, mit echtem Background-Push | Vanilla JS PWA + Node/Express |

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

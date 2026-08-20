# Claude Code

Projekte, die in Claude-Code-Sessions entstanden sind. Jedes liegt in einem
eigenen Ordner und ist unabhängig lauffähig.

| Ordner | Was es ist | Stack |
|---|---|---|
| [`fpv-portfolio/`](fpv-portfolio) | Ghost Line FPV — Portfolio-Single-Page | statisches HTML/CSS/JS, kein Build |
| [`aurel/`](aurel) | AUREL — Premium-Store für eine zirkadiane Schreibtischleuchte | Next.js 16, React 19, Tailwind 4, Motion |
| [`mudroom/`](mudroom) | MUDROOM — Premium-Store für eine automatische Bike-Waschbox | Next.js 16, React 19, Tailwind 4, Motion |
| [`fluent/`](fluent) | FLUENT — Persönliches Englisch-Lern-Betriebssystem (B2 → C1/C2) | Next.js 16, React 19, Tailwind 4 |

## Fertige Seiten ohne Build

`sites/` enthält von jedem Next.js-Projekt eine Ein-Datei-Version — die
komplette Seite inklusive aller Routen, Warenkorb und Checkout in einem
einzigen HTML-File. Einfach im Browser öffnen:

- [`sites/aurel.html`](sites/aurel.html)
- [`sites/mudroom.html`](sites/mudroom.html)

Das sind Snapshots. Neu erzeugen lassen sie sich im jeweiligen Projekt mit
`npm run standalone` (Ergebnis: `standalone/dist/local.html`).

## Die Next.js-Projekte lokal starten

```bash
cd aurel        # oder mudroom, fluent
npm install
npm run dev     # http://localhost:3000
```

Weitere Befehle in allen drei Projekten:

```bash
npm run build       # Produktions-Build
npm run lint
npm run export      # statischer Export nach ./out, für jeden Static-Host
```

Nur in aurel und mudroom zusätzlich:

```bash
npm run standalone  # Ein-Datei-Build nach standalone/dist/
```

Details, Designsystem und Architektur stehen jeweils in der README des
Projekts.

## Hinweis

AUREL und MUDROOM sind Konzeptseiten. Produkte, Preise, Maße, technische
Werte und Bewertungen sind Demodaten, und die Checkouts nehmen keine
echten Zahlungen entgegen — das steht auch auf den Seiten selbst.

FLUENT ist ebenfalls ein Konzeptprojekt: keine echte Spracherkennung, kein
Backend, alle Lernfortschritte liegen nur in `localStorage` — Details in der
Projekt-README.

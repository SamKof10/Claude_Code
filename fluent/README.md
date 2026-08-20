# FLUENT — Persönliches Englisch-Betriebssystem

Eine Lern-Web-App für einen deutschen Muttersprachler auf B2-Niveau mit dem
Ziel C1–C2. Kein Kurs, keine Schule-Optik — ein tägliches Dashboard mit
Sitzungen, Vokabeln im Kontext, Hör-, Sprech- und Schreibtraining, Debatten,
Alltagssimulationen und einem KI-Tutor.

> Stop learning English. Start thinking in it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Lucide.
Keine Animationsbibliothek — Reveals, Zähler und Übergänge laufen über reines
CSS (`transition`/`@keyframes`) plus `IntersectionObserver`, siehe
„Bekannte Grenzen" unten für den Grund.

## Starten

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build (Node-Server)
npm run export   # statischer Export nach out/
npm run lint
```

## Struktur

```
src/
  app/
    page.tsx                 Dashboard
    session/                 Distraction-free Tagessitzung (6 Schritte)
    vocabulary/, grammar/, listening/, speaking/, writing/
    think/, translate/, natural/, c1c2/, debate/, real-life/, abroad/, tutor/
    progress/, progress/weak-areas/, progress/achievements/
    settings/
    globals.css               Design-Tokens (hell/dunkel), Effekt-Primitiven
    global-error.tsx          Eigene Fehlerseite im Markendesign
  components/
    layout/                   Sidebar, Topbar, mobile Drawer-Navigation
    dashboard/                Hero, Tagesplan, System-Status, Smart Review
    session/                  Sitzungs-Runner + sechs Mini-Übungstypen
    vocabulary/, grammar/, listening/, speaking/, writing/
    think/, translate/, natural/, c1c2/, debate/, reallife/, abroad/, tutor/
    progress/                 Confusable-Pairs-Übung
    ui/                       Button, Card, Charts (Linie/Balken/Ring), Reveal, …
  lib/
    store.tsx                 Globaler Zustand (Context + Reducer, localStorage)
    scoring.ts                Heuristische Demo-Bewertung (Schreiben, Sprechen, Abroad Mode)
    achievements.ts            Achievement-Definitionen
    content/                  Alle Lerninhalte: Vokabeln, Grammatik, Hörtexte,
                              Übersetzung, Natural-English-Paare, C1/C2-Material,
                              Debatten, Szenarien, Confusable Pairs, Tutor-Regeln, Level
  hooks/                      useMediaQuery, useInViewOnce, useRandomOnMount, …
```

## Design

Dunkel als Standard, umschaltbar auf Hell (`Settings`). Ein Signalfarbton
(Violett) für Fokus/CTA, Mint für Fortschritt/Mastery, Amber für Streak,
Koralle für Korrekturen. Monospace-Retro-Label für „System Status" und
technische Kennzahlen, Glass-Oberflächen, dezentes Rauschen — siehe
`src/app/globals.css`.

## Warum keine Animationsbibliothek

Der erste Entwurf nutzte `motion` (Framer-Motion-Nachfolger), wie die
Schwesterprojekte `aurel` und `mudroom`. In dieser Umgebung crashte
`next build` beim Prerendering jeder Seite reproduzierbar mit
`TypeError: Cannot read properties of null (reading 'useContext')` — auch
bei einer auf ein Minimum reduzierten App ohne jeglichen eigenen Code.
Ursache war eine durch die Sandbox global gesetzte `NODE_ENV=development`,
die Next intern zu einer inkonsistenten React-Modulauflösung während der
statischen Generierung verleitete (`next build` erzwingt normalerweise
selbst Produktions-Verhalten). Mit explizit gesetztem `NODE_ENV=production`
verschwindet der Fehler vollständig — die Bibliothek war nie das Problem.
Da zu diesem Zeitpunkt aber bereits klar war, dass reines CSS für dieses
Design ausreicht, blieb die Umstellung bestehen: kleinere Bundle-Größe, eine
Abhängigkeit weniger.

## KI-Tutor & Bewertungen — bewusst als Demo markiert

Es ist keine echte Spracherkennung und kein LLM angebunden:

- **Speaking/Writing-Analyse** (`lib/scoring.ts`): deterministisch-heuristisch
  aus Wortanzahl, Wortvielfalt und erkannten C1-Markerphrasen abgeleitet —
  glaubwürdige Demo-Werte, kein echtes NLP-Scoring.
- **AI Tutor** (`lib/content/tutor.ts`): ein kleines regelbasiertes
  Korrektur-System (Substring-Trigger → Hinweis), kein Modell. Die
  Matching-Funktion liegt bewusst getrennt von der UI, damit sie sich später
  durch einen echten API-Aufruf ersetzen lässt.
- **Abroad Mode**: Zeit- und Stichwort-heuristische Bewertung, keine echte
  Spracherkennung.

## Bekannte Grenzen

Demonstrationsprojekt: keine echten Nutzerkonten, kein Backend, alle
Fortschrittsdaten liegen ausschließlich in `localStorage` dieses Browsers.
Hör-„Audio" ist eine simulierte Wellenform mit Transkript, keine echten
Audiodateien.

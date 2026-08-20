# FLUENT — Persönliches Englisch-Betriebssystem

Eine Lern-Web-App für einen deutschen Muttersprachler auf B2-Niveau mit dem
Ziel C1–C2. Kein Kurs, keine Schule-Optik — ein tägliches Dashboard mit
Sitzungen, Vokabeln im Kontext, Hör-, Sprech- und Schreibtraining, Debatten,
Alltagssimulationen und einem KI-Tutor.

> Stop learning English. Start thinking in it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Lucide ·
Motion. Scroll-Reveals und Zähler laufen über `motion/react` (wie die
Schwesterprojekte `aurel`/`mudroom`); die meisten übrigen Effekte (Border-
Beam, Marquee, Ripple, Konfetti, Sliding-Indicator, Retro-Akzente) bleiben
handgebautes CSS/DOM ohne die Bibliothek — siehe „Design" unten.

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
    progress/                 Confusable-Pairs-Übung, monatlicher Check-in (Runner + Ergebnisse + Gate)
    ui/                       Button, Card, Charts (Linie/Balken/Ring), Reveal, …
  lib/
    store.tsx                 Globaler Zustand (Context + Reducer, localStorage)
    scoring.ts                Heuristische Demo-Bewertung (Schreiben, Sprechen, Abroad Mode)
    achievements.ts            Achievement-Definitionen
    content/                  Alle Lerninhalte: Vokabeln, Grammatik, Hörtexte,
                              Übersetzung, Natural-English-Paare, C1/C2-Material,
                              Debatten, Szenarien, Confusable Pairs, Tutor-Regeln, Level,
                              monatlicher Check-in (monthlyTest.ts)
  hooks/                      useMediaQuery, useInViewOnce, useRandomOnMount, …
```

## Design

Hell als Standard — eine warme, neutrale Papier-Basis (dieselbe Farbfamilie
wie das Schwesterprojekt `aurel`: `#f6f4f0`/`#131211` statt kühlem Grau),
umschaltbar auf Dunkel (Topbar-Toggle, `Settings`). Ein Signalfarbton
(Violett) für Fokus/CTA, Mint für Fortschritt/Mastery, Amber für Streak,
Koralle für Korrekturen — FLUENTs eigene vier Akzente bleiben unverändert,
nur die neutrale Basis wurde AUREL angeglichen. Monospace-Retro-Label für
„System Status" und technische Kennzahlen, Glass-Oberflächen, dezentes
Rauschen — siehe `src/app/globals.css`.

## Akzente inspiriert von Magic UI, Unlumen UI, Smooth UI, Retro UI

Auf Wunsch um ein paar gezielte, kleine Akzente erweitert, die stilistisch an
diese vier populären React-Komponenten-Bibliotheken angelehnt sind — ohne
sie tatsächlich zu installieren. Bis auf Scroll-Reveals/Zähler (die inzwischen
echtes `Motion` nutzen, siehe „Motion & Animationen" unten) sind die Effekte
als eigene, kleine Primitives in `components/ui/` und `globals.css`
nachgebaut, im selben dependency-freien Stil wie der Rest des Designsystems:

- **`BorderBeam`** (Magic UI) — ein wandernder Lichtpunkt am Rand, per
  `conic-gradient` + `@property`-Winkel. Um den Level-Ring im Dashboard.
- **`ShinyText`** (Magic UI) — ein durchlaufender Glanz-Sweep auf
  `background-clip: text`. Auf der Begrüßung im Dashboard-Hero.
- **`Marquee`** (Magic UI) — ein pausierbares Endlos-Band. Zeigt
  freigeschaltete Achievements.
- **Ripple-Button** (Magic UI) — eine kurze, vom Klickpunkt ausgehende
  Kreis-Animation, als `ripple`-Prop auf `Button`/`ButtonLink`.
- **Konfetti** (`useConfetti`, Magic UI) — eine Handvoll `<span>`-Elemente,
  imperativ erzeugt und wieder entfernt, kein Canvas. Bei Sitzungsabschluss
  und beim Antippen eines freigeschalteten Achievements.
- **`Tooltip`** (Unlumen UI) — ein Pop-in-Hinweis auf Icon-Buttons in der
  Topbar (Menü, Theme, Einstellungen).
- **Sliding Indicator** (Smooth UI, `useSlidingIndicator`) — eine per
  `getBoundingClientRect` gemessene, weich mitgleitende Markierung statt
  eines harten Klassenwechsels. Ein gemeinsamer Hook treibt drei Stellen:
  den aktiven Sidebar-Eintrag, den Tab-Unterstrich (`Tabs`, u. a.
  Vocabulary/Listening/C1-C2-Lab) und den Segmented-Control-Hintergrund
  (`SegmentedControl`, Settings).
- **`retro-panel` / `retro-badge`** (Retro UI, dosiert) — dicke Kontur +
  harter Versatz-Schatten statt Blur, bewusst nur auf den ohnehin schon
  „technischen"/spielerischen Flächen: System-Status-Panel, Streak-Kachel,
  Streak-Chip in der Topbar, freigeschaltete Achievement-Badges.

Alle neuen Animationen respektieren `prefers-reduced-motion` (siehe
`globals.css`) und laufen ausschließlich über CSS-Keyframes/-Transitions
plus punktuelle, unkritische DOM-Manipulation (Ripple, Konfetti) — kein
zusätzliches Bundle-Gewicht, kein neues Build-Risiko.

## Motion & Animationen

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
Zunächst blieb die CSS-Umstellung trotzdem bestehen (kleinere Bundle-Größe),
bis auf Wunsch dieselbe butterweiche Reveal-/Zähler-Qualität wie bei `aurel`
gefragt war: `Reveal` (`components/ui/Reveal.tsx`) und `AnimatedNumber`
laufen jetzt über `motion/react` — `whileInView` mit `viewport={{ once }}`
statt eigenem `IntersectionObserver`-Hook, `MotionConfig
reducedMotion="user"` in `components/ui/MotionProvider.tsx` respektiert
`prefers-reduced-motion` global, ohne SSR/CSR-Mismatch-Risiko (siehe
Kommentar dort). Alles andere — Border-Beam, Marquee, Ripple, Konfetti,
Sliding-Indicator, Retro-Akzente — bleibt bewusst dependency-freies CSS/DOM,
da diese Effekte kein Scroll-/Viewport-Tracking brauchen.

## Startzustand & monatlicher Check-in

Die App startet bei **B2, 0%** — kein vorgetäuschter Fortschritt. `lib/store.tsx`
setzt `programStartDate` beim allerersten Laden auf heute; von da an zählt ein
**monatlicher Check-in** (`lib/content/monthlyTest.ts`, `components/progress/
MonthlyTest*`): 4 Vokabel-MCQs, 4 Grammatik-Korrekturen, 2 Hörverständnisfragen
und eine kurze Schreibaufgabe, gezogen aus denselben Inhalts-Pools wie das
tägliche Training, damit der Test misst, was tatsächlich geübt wurde. Das
Ergebnis kalibriert `skillScores` und `c1Progress` neu; ein Level-Aufstieg
(`levelAfterTest` in `lib/store.tsx`) ist an einen hohen Score (≥85) gebunden,
nicht automatisch. Speaking wird bewusst **nicht** im Check-in getestet — dafür
gibt es keine echte Spracherkennung —, sondern weiterhin nur über die
Sessions bewertet. Freigeschaltet wird jeder Check-in nach 30 Tagen seit dem
Start bzw. dem letzten Test (`monthlyTestStatus`), rein datumsbasiert über
`localStorage` — kein Server, keine Cron-Jobs.

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

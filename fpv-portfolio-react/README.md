# Ghost Line FPV — React

React + Vite + Tailwind v4 + shadcn/ui Rebuild des FPV-Portfolios, aufgebaut mit echten, installierten Komponenten aus vier shadcn-Registries: **unlumen UI**, **Magic UI**, **Smooth UI** und **Retro UI (neobrutalism)**.

## Starten

```bash
npm install
npm run dev
```

## Woher welche Komponente kommt

| Library | Komponenten | Eingesetzt für |
|---|---|---|
| **Magic UI** | `BorderBeam`, `Meteors`, `Marquee`, `BlurFade`, `AnimatedShinyText`, `NumberTicker` | Reel-Frame-Glow, Hero-Ambient, Location-Ticker, Scroll-Reveals, Eyebrow-Shimmer, REC-Timer |
| **Smooth UI** | `AnimatedTabs`, `ClipCornersButton`, `NumberFlow`, `ScrambleHover` | Flight-Log-Filter, primärer Hero-CTA, VTX-Kanal-Stepper, Karten-Titel bei Hover |
| **Retro UI** (neobrutalism, Base UI-Variante) | `Button`, `Badge`, `Card`, `Switch` | Kontakt-Buttons, Kategorie-Tags, Rig-Spec-Panels, OSD-Overlay-Toggle |
| **unlumen UI** | `MagneticButton`, `Tilt`, `Cursor`/`CursorProvider`, `GlowingBadge`, `ScrambleText`, `CountUp` | Sekundärer Hero-CTA, 3D-Tilt auf Flight-Log-Karten, Reticle-Cursor (Site-weit), REC-Badge, Boot-Screen-Text, Pilot-Statistiken |

Alle Komponenten liegen unter `src/components/{ui,smoothui,unlumen-ui}` — sie sind wie bei shadcn üblich in den Code kopiert (nicht als npm-Paket importiert), also frei anpassbar. Zwei kleine Bugs aus den Original-Registries wurden dabei gefixt (`NodeJS.Timeout`-Typen, ein falscher Importpfad in `cursor.tsx`, zwei tote Variablen in `count-up.tsx`).

## Registries nachinstallieren

Alle vier Registries sind in `components.json` registriert:

```bash
npx shadcn@latest add @magicui/<name>
npx shadcn@latest add @smoothui/<name>
npx shadcn@latest add @neobrutalism-base/<name>
npx shadcn@latest add @unlumen/<name>
```

## Design-Tokens

`src/index.css` — Graphit-Teal-Grund (`--background: #0b1013`) mit Signal-Amber-Akzent (`--brand: #f2863c`), dieselbe Teal/Orange-Aufteilung wie beim FPV-Colorgrading. Dark-only, kein Light-Mode-Toggle. Typografie: `Big Shoulders Condensed` (Headlines), `Chakra Petch` (Labels/Telemetrie), `IBM Plex Sans` (Fließtext).

## Eigene Inhalte einsetzen

- **Flight Log:** `src/lib/flight-log-data.ts`
- **Rig-Specs:** `src/components/site/rig.tsx`
- **Pilot-Bio & Stats:** `src/components/site/pilot.tsx`
- **Kontakt:** `src/components/site/contact.tsx`
- **Reel-Video:** `src/components/site/reel.tsx` — aktuell ein generativer Canvas-Platzhalter; für echtes Footage dort ein `<video>`- oder `<iframe>`-Element einsetzen.

## Verhältnis zur Vanilla-Version

Die ursprüngliche reine HTML/CSS/JS-Version liegt weiterhin unter `../fpv-portfolio/` (kein Build-Schritt nötig). Dieses React-Projekt ist die aktive Weiterentwicklung mit den vier UI-Libraries.

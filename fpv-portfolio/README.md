# Ghost Line FPV — Portfolio

Statische Single-Page-Site, kein Build-Schritt nötig. `index.html` einfach im Browser öffnen oder auf beliebigem Static-Hosting (Netlify, Vercel, GitHub Pages, eigener Server) deployen.

## Dateien

- `index.html` — Struktur & Inhalt
- `css/style.css` — Design-Tokens (Farben, Type-Skala) + Komponenten
- `js/main.js` — Boot-Sequenz, Canvas-Flightpaths, Nav, Scroll-Reveal, OSD-Telemetrie

## Eigene Inhalte einsetzen

Alle Platzhalter sind bewusst „echt" formuliert (Callsign, Flüge, Specs), aber zum Ersetzen gedacht:

1. **Name/Callsign & Logo** — `index.html`, `.brand`-Link im Header und `.hero-title`.
2. **Reel** — Abschnitt `#reel`. Der `<canvas>`-Platzhalter samt Play-Button kann durch ein echtes `<video>`-Tag oder einen YouTube/Vimeo-`<iframe>` ersetzt werden (Kommentar direkt im HTML markiert die Stelle).
3. **Flight Log** — sechs `.log-card`-Blöcke in `#log`. Jede Karte hat ein `data-seed`-Attribut, das die generative Flightpath-Grafik steuert — einfach eine neue Zahl setzen für ein neues Muster. Titel, Beschreibung und die vier Specs (`ORT`, `DATUM`, `DAUER`, `SETUP`) direkt im Markup anpassen. Für echte Clips analog zum Reel ein `<video>`/`<iframe>` in `.log-thumb` einsetzen.
4. **Rig** — Abschnitt `#rig`, vier Spec-Blöcke (Aircraft, Goggles, Kamera, Funke).
5. **Pilot** — Bio-Text und die drei Kennzahlen (`Flugstunden`, `Edits`, `Seit`) in `#pilot`.
6. **Kontakt** — E-Mail-Adresse (`mailto:`) und Social-Links (aktuell `href="#"`) in `#contact` ausfüllen.

## Design-Notizen

- **Farbwelt:** Graphit-Schwarz mit Teal-Unterton + Signal-Amber als Akzent — dieselbe Teal/Orange-Aufteilung, in die FPV-Footage beim Colorgrading ohnehin meist läuft. Rot/Grün sind reserviert für REC- und Signal-Status, nicht als zweiter Akzent nutzen.
- **Typografie:** `Big Shoulders Condensed` (Headlines), `Chakra Petch` (Labels/Telemetrie/Buttons), `IBM Plex Sans` (Fließtext) — werden über Google Fonts geladen (`index.html`, `<head>`).
- **CH01–CH05:** Die Kanal-Labels vor jeder Sektion greifen echtes FPV-Vokabular auf (VTX-Kanalwahl), keine dekorative Nummerierung.
- Reduzierte Bewegung wird über `prefers-reduced-motion` respektiert (Boot-Screen, Canvas-Animationen, REC-Timer, OSD-Werte werden dann statisch dargestellt).
- Reines Dark-Theme, bewusst ohne Light-Mode-Umschaltung (passend zur Anfrage „Dark Mode").

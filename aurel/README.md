# AUREL — Premium D2C Store

Eine vollständige E-Commerce-Website für **AUREL ARC**, eine (erfundene)
zirkadiane Schreibtischleuchte: 1800–6500 K, CRI 97, flimmerfrei.

Das Produkt wurde bewusst so gewählt, dass die visuelle Sprache aus der
Sache selbst kommt — bei einer Leuchte sind Glow, Farbtemperatur und
Lichtkegel keine Dekoration, sondern das Produkt. Die gesamte Farbpalette
besteht deshalb aus genau zwei Akzenten, und beide sind die Leuchte:
`ember` (1800 K) und `day` (6500 K).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Motion 13 · Lucide. Keine UI-Library, keine weiteren Abhängigkeiten.

## Starten

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build (Node-Server)
npm run export   # statischer Export nach out/
npm run lint
```

## Veröffentlichen

Alle vier Routen sind statisch, es läuft kein Server-Code. Damit gibt es zwei
Wege:

**Statisch — überall hostbar.** `npm run export` schreibt fertige Dateien nach
`out/`. Der Ordner lässt sich unverändert auf Netlify ziehen, in einen
S3-Bucket legen, auf GitHub Pages schieben oder lokal mit
`npx serve out` ansehen. Kein Node-Prozess nötig.

```bash
npm run export
npx serve out          # zum Prüfen
```

**Mit Plattform.** Auf Vercel, Netlify oder Cloudflare Pages reicht das Repo:
Build-Befehl `npm run build`, Ausgabe wird automatisch erkannt.

Die Produktseite liest `?modell=` und `?oberflaeche=` bewusst im Client
(`ProductConfigurator`), damit die Route statisch bleibt. Vorgerendert steht
die Standardkonfiguration im HTML; die URL-Auswahl greift direkt danach.

Für den statischen Export setzt `next.config.ts` zusätzlich
`trailingSlash: true`, weil Static-Hosts `/produkt/index.html` ausliefern und
nicht `/produkt`.

## Struktur

```
src/
  app/
    page.tsx            Landingpage (Scrolling-Storytelling)
    produkt/            Produktseite, liest ?modell= und ?oberflaeche=
    checkout/           Kasse + Bestellbestätigung
    globals.css         Design-Tokens, Effekt-Primitiven, Reduced-Motion
  components/
    layout/             Navbar (invertiert über dunklen Sektionen), Footer, Logo
    sections/           Hero, Problem, Solution, ProductReveal, Features,
                        SmartControl, Technology, Variants, Accessories,
                        SocialProof, Faq, FinalCta
    product/            ArcLamp, AccessoryArt, PhoneMock, ProductViewer,
                        Hotspots, SpecsTable, ProductDetail, AccessoryUpsell
    cart/               CartDrawer, FlyToCart
    checkout/           CheckoutForm, OrderSuccess
    ui/                 Button, Reveal, Marquee, Spotlight, Accordion,
                        AnimatedNumber, Toast, Primitives, reactbits/
  vendor/reactbits/     Fremdkomponenten, unverändert (siehe dortige README)
  lib/
    products.ts         Katalog: Modelle, Oberflächen, Zubehör, Varianten, SKUs
    i18n/               Wörterbücher (de, en), Provider, Platzhalter-Ersetzung
    labels.ts           Warenkorbzeile → Bezeichnung in der aktuellen Sprache
    reviews.ts          Rezensenten, Kennzahlen, Lieferländer
    cart.tsx            Cart-Context (Reducer + localStorage)
    payments.ts         Payment-Provider-Schnittstelle
    content.ts          Reviews, FAQ, Datenblatt, Features, Presse
    format.ts           Preise (de-DE), Kelvin→RGB, Wellenlänge→RGB
  hooks/                Media-Query, Parallax, Magnetic, Focus-Trap, …
```

## Produktdarstellung

Es gibt keine Stockfotos. Die Leuchte ist eine parametrische SVG-Zeichnung
(`components/product/ArcLamp.tsx`): Gehäuse, Diffusor, Lichtkegel und der
Lichtteppich auf dem Tisch werden aus zwei Zahlen abgeleitet — `kelvin` und
`intensity`. Dieselbe Komponente rendert das Hero-Visual, die
Varianten-Karten, die Warenkorb-Thumbnails und die Flug-Animation.

Der Regler im Hero startet auf der **echten aktuellen Uhrzeit**: die Leuchte
zeigt beim Laden genau das Licht, das sie gerade abgeben würde.

## Sprachen

Deutsch und Englisch, umschaltbar über die Flagge neben dem Warenkorb. Die
Wahl landet in `localStorage`; ohne gespeicherte Wahl entscheidet die
Browsersprache. Beim ersten Rendern läuft immer Deutsch, damit Server und
Client übereinstimmen — die gespeicherte Sprache greift direkt nach dem
Mount.

Sämtliche Texte liegen in `lib/i18n/de.ts` und `en.ts`. Der Typ `Dict` wird
aus dem deutschen Wörterbuch abgeleitet, also ist ein fehlender oder
vertippter Schlüssel in einer anderen Sprache ein Build-Fehler, keine leere
Stelle auf der Seite. `products.ts` enthält nur noch Struktur, Preise und
Geometrie; Namen und Beschreibungen hängen an den IDs im Wörterbuch. Auch
der Warenkorb speichert keine Bezeichnungen, sonst bliebe die Sprache von
damals stehen — `describeLine()` löst sie beim Rendern auf.

Eine dritte Sprache ist eine Datei plus ein Eintrag in `LOCALE_META`.

## Weltweiter Versand

Über 90 Länder, Versand im Preis enthalten, Zoll und Einfuhrumsatzsteuer
inklusive. Die Länderauswahl im Checkout ist nach EU / übriges Europa /
weltweit gruppiert, und die Postleitzahl wird bewusst locker geprüft — ein
deutsches Format hätte kanadische oder britische Codes abgelehnt.

## Animationen aus React Bits

Drei Komponenten von [React Bits](https://reactbits.dev) liegen unverändert
unter `src/vendor/reactbits/` (MIT + Commons Clause, siehe dortige README);
die getypten Wrapper mit unseren Voreinstellungen stehen in
`components/ui/reactbits/`:

- **ShinyText** — ein langsamer Schimmer über das Announcement-Badge im Hero.
- **DecryptedText** — die Statuszeile im Technologie-Panel löst sich aus
  Rauschen auf, passend zum technischen Retro-Akzent.
- **ClickSpark** — Funken in Bernstein dort, wo geklickt wird.

Abgeschaltet wird bei `prefers-reduced-motion` über Props, nie über eine
andere DOM-Struktur: `useReducedMotion()` ist beim Server-Rendern false, ein
struktureller Zweig würde die Hydration zerreißen.

## Zubehör

Zwei Halterungen für dieselbe Leuchte, jeweils in allen drei Oberflächen:

- **AUREL CLIP** (59 €) — hängt die ARC auf die Oberkante des Monitors.
- **AUREL ARCH** (149 €) — Auslegerbogen mit beschwertem Fuß; die Leiste
  hängt über der Tischplatte und leuchtet senkrecht nach unten.

Beide sind wie die Leuchte gezeichnet, nicht fotografiert
(`components/product/AccessoryArt.tsx`), und teilen sich mit ihr die
Oberflächen-Gradienten.

Die Oberfläche wird **pro Zubehör** gewählt, nicht pro Sektion — CLIP in
Sand und ARCH in Alabaster lassen sich in einem Durchgang bestellen. Im
Cross-Sell auf der Produktseite folgen die Zeilen zunächst der Farbe der
konfigurierten Leuchte; sobald jemand eine Zeile bewusst umstellt, behält sie
ihre Wahl. Das ist abgeleitet, nicht synchronisiert — gespeichert werden nur
die Abweichungen.

## Steuerung

Die Sektion „Steuerung" ist spielbar: Ein/Aus und der Umschaltpunkt für den
Abendmodus (17:00–23:00, 15-Minuten-Schritte) verändern live die Leuchte
daneben. Bezugspunkt ist ein fester Moment (20:30 Uhr) — so zeigt sich
unmittelbar, was ein früherer oder späterer Umschaltpunkt am Abend bedeutet.

## E-Commerce

- **Warenkorb** — Context + Reducer, in `localStorage` gespiegelt. Beim Laden
  werden gespeicherte Zeilen gegen den Katalog revalidiert; Preise und Namen
  kommen immer aus dem Katalog, nie aus dem Storage.
- **Ein Katalog für alles** — Warenkorb und Kasse kennen nur SKUs.
  `findCatalogEntry(sku)` liefert Leuchte oder Zubehör; das Feld `kind`
  entscheidet, welche Zeichnung als Vorschau erscheint. Neue Produktarten
  brauchen keine Änderung an Warenkorb, Kasse oder Bestätigung.
- **Preise** sind durchgängig Integer-Cents, nie Floats.
- **Checkout** — Client-Validierung, Verarbeitungszustand,
  Bestellbestätigung mit Bestellnummer und Liefertermin (Werktage).
- **Zahlung** — `lib/payments.ts` definiert `PaymentProvider`. Aktuell ist ein
  Demo-Provider aktiv; für Stripe wird das Interface implementiert und in
  `getPaymentProvider()` eine Zeile getauscht. Die Komponenten kennen den
  Anbieter nicht. Der auskommentierte Stripe-Fall schickt bewusst nur SKUs
  und Mengen — der Server bepreist neu, damit der Client nie einen Betrag
  diktieren kann.

## Motion

Alle Animationen laufen über `transform` und `opacity`, Scroll- und
Pointer-Handler sind rAF-gedrosselt, Pointer-Effekte (Parallax, Magnetic,
Spotlight) sind hinter `(hover: hover) and (pointer: fine)` abgeschaltet.
`prefers-reduced-motion` schaltet Reveals, Marquee, CRT-Linien, den
Warenkorb-Flug und die Zähler ab.

## Bekannte Grenzen

Demonstrationsprojekt: keine echte Zahlungsanbindung, kein Backend, keine
Bestandsführung (die „nicht am Lager"-Variante ist im Katalog fest
hinterlegt), keine Marke namens AUREL.

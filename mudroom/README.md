# MUDROOM

A premium e-commerce concept site for **MUDROOM ONE** — a massive automatic
bike wash box. Ride in, press one button, ride out clean.

> **This is a design study.** The machine does not exist. Every price,
> dimension, throughput figure, review and counter on the site is
> demonstration data, and the checkout completes without taking a payment.
> The site says so wherever a number appears.

## The brand

| | |
|---|---|
| Name | MUDROOM |
| Product | MUDROOM ONE — CORE / PRO / PARK |
| Tagline | Dirt stops here. |
| Palette | Steel `#0d0f11` ground · concrete `#e9eae5` light sections · hi-vis `#c8f249` as the single accent · water blue for readouts · mud ochre only on dirty things |
| Type | Archivo (display + body), JetBrains Mono (labels, numbers) |
| Mark | The box seen head-on: cabinet outline, shutter slats, hi-vis sill |

The one rule the palette follows: **mud is semantic**. Ochre appears on
dirty bikes and nowhere else, so the moment it disappears means something.

## What is in it

- **Hero** — a 360 vh scroll stage with a pinned viewport. Page scroll *is*
  the wash cycle: the bike rides in, the shutter comes down, the brushes
  close in and the jets run, the mud comes off, the shutter lifts, the bike
  rides out clean. Drawn in SVG, driven by one number.
- **One box. Every bike.** — seven parametric bike silhouettes (trail,
  enduro, downhill, gravel, road, e-MTB, BMX) with per-bike specs and the
  honest limits of the bay envelope.
- **How it works** — four steps, each with its own small looping animation.
- **Cleaning technology** — brush set, pressure ring, bike-safe reasoning,
  and four selectable wash programs.
- **From this… to this.** — a second pinned stage. A clean bike sits under a
  dirty one and is revealed left-to-right by a clip inset, with a rotating
  brush riding the boundary. One SVG, one clip, no video.
- **Built for the mess.** — five drawn vignettes of what actually comes home
  on a bike. No stock photography anywhere on the site.
- **Technical specs**, **social proof**, **FAQ**.
- **Buy** — a live configurator (configuration, finish, options,
  installation, warranty) that prices as you go, adds to a cart drawer with
  a fly-to-cart animation, and runs a five-step checkout ending in
  *Welcome to the clean side.*
- **Rent** — an event rental calculator (type × duration × volume) and a
  separate four-step quote flow ending in *Request received.*

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict ·
Tailwind CSS 4 · Motion · lucide-react. No other runtime dependencies.

All product art is SVG generated from data — `src/lib/bikes.ts` drives
`BikeArt`, and `WashBox` is drawn from one exported coordinate frame so the
bike overlay lands on the box floor exactly.

## Structure

```
src/
  app/            routes: /, /checkout, /rental, 404
  components/
    layout/       navbar, footer, logo, skip link
    sections/     one file per page section
    product/      BikeArt, WashBox, WashScene, MessArt, BoxThumb
    cart/         drawer, fly-to-cart
    checkout/     five-step checkout
    rental/       four-step quote flow
    ui/           button, fields, reveal, accordion, marquee, toast, …
  lib/
    products.ts   catalogue, SKU encoding, pricing
    cart.tsx      cart context + reducer + localStorage
    payments.ts   PaymentProvider seam (demo today, Stripe tomorrow)
    rental.ts     rental pricing model + request seam
    bikes.ts      bike geometry and specs
    content.ts    marketing copy and demo data
standalone/       single-file build (esbuild + hash router + Tailwind CLI)
```

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint
npm run export       # STATIC_EXPORT=1 → ./out, a plain folder of HTML
npm run standalone   # → standalone/dist/local.html, the whole site in one file
```

## Payments

The checkout talks only to the `PaymentProvider` interface in
`src/lib/payments.ts`. Swapping the demo provider for Stripe means
implementing that interface against `/api/checkout/session` and changing one
line in `getPaymentProvider()` — no component knows the difference. The
commented sketch in that file sends SKUs and quantities only, so the server
re-prices from the catalogue and the client can never dictate an amount.

## Notes on the animation work

- Scroll progress is quantised (160 steps in the hero, 100 in the
  transformation) and held in React state rather than piped through
  `useTransform`. Scrubbing a 200-node SVG on every frame stutters on a
  phone, and Motion hands plain scroll-linked style values to the browser's
  native scroll timeline, which animated against the document range rather
  than the section's.
- The wash box renders in two layers — `back` and `front` — with the bike
  between them, so a closed shutter actually covers the bike. The shutter is
  glazed, because the reader needs to see the wash and a real cabinet needs
  an inspection window for the same reason.
- Nothing branches its markup on `useReducedMotion()`. That hook is false
  during SSR, so a branch tears hydration. Reduced motion is handled once by
  `<MotionConfig reducedMotion="user">` and by the CSS block in
  `globals.css` — which is also why the brush bristles animate in CSS rather
  than SMIL: the reduced-motion block can stop CSS and cannot stop SMIL.
- Trig-derived SVG coordinates are rounded to three decimals. `Math.cos` is
  not bit-identical between Node and V8-in-the-browser, and a last-digit
  difference in a spoke coordinate is a hydration mismatch.

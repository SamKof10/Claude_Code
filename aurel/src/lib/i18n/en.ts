import { enContent } from "./en.content";
import type { Dict } from "./types";

export const en: Dict = {
  ...enContent,

  meta: {
    title: "AUREL — light that knows what time it is",
    titleTemplate: "%s · AUREL",
    description:
      "The AUREL ARC is a circadian desk light: 1800 to 6500 Kelvin, CRI 97, flicker-free. It follows the sun, so your evening isn't lit like noon.",
    productTitle: "ARC — circadian desk light",
    productDescription:
      "Configure the AUREL ARC: two lengths, three finishes. 1800–6500 K, CRI 97, flicker-free. 60 nights to try it, worldwide shipping included.",
    checkoutTitle: "Checkout",
    checkoutDescription: "Complete your order — shipping included, 60 nights to try it.",
  },

  toast: { added: "{name} added" },

  common: {
    addToCart: "Add to cart",
    added: "Added",
    soldOut: "Unavailable",
    buyNow: "Buy now",
    from: "from",
    trust: ["60 nights to try it", "Worldwide shipping included", "5-year warranty"],
    inStock: "Ships within 48 hours",
    restock: "Back in stock 12 March",
    finishLabel: "Finish",
    skipToContent: "Skip to content",
  },

  nav: {
    links: {
      produkt: "Product",
      features: "Features",
      technologie: "Technology",
      zubehoer: "Accessories",
      reviews: "Reviews",
      faq: "FAQ",
    },
    buy: "Buy now",
    buyFrom: "Buy now — from {price}",
    home: "AUREL — home",
    openCart: "Open cart, {count} items",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    navigation: "Navigation",
    language: "Language",
    languageOpen: "Choose language — currently {name}",
    shipsTo: "Ships to over 90 countries",
  },

  hero: {
    badge: "ARC MAX has landed — 84 cm light bar",
    headline: ["Light that knows", "what time it is."],
    lede: "The ARC follows the sun: cold and bright for thinking, ember-warm in the evening. Exactly when it switches over is yours to set, from your phone.",
    ctaSecondary: "Explore the product",
    floaters: [
      { label: "CRI 97", sub: "colour rendering" },
      { label: "1800—6500 K", sub: "continuous" },
      { label: "0.1%", sub: "flicker-free dimming" },
      { label: "UGR < 16", sub: "glare-free" },
    ],
    timeOfDay: "Time of day",
    now: "now",
    colourTemp: "Colour temperature",
    sunrise: "06:00 · sunrise",
    bedtime: "23:00 · bedtime",
    scrubHint: "Drag the slider through the day — this is exactly what the ARC does on its own.",
    scrubAria: "Choose a time of day — the lamp follows",
    scrubValue: "{clock}, {kelvin} Kelvin",
    lampAlt: "The AUREL ARC MAX, its colour temperature following the selected time of day",
  },

  shop: {
    kicker: "Straight to the cart",
    title: "Accessories, right here.",
    lede: "Both mounts can go in the cart now — the lamp itself is configured one section further down.",
    seeAll: "See all variants",
  },

  press: [
    { outlet: "MONOCLE", quote: "The first desk light worth the desk" },
    { outlet: "DEZEEN", quote: "Restraint as a design strategy" },
    { outlet: "WALLPAPER*", quote: "Quietly the best lit object of the year" },
    { outlet: "CORE77", quote: "Engineering you can feel in the dial" },
    { outlet: "DISEGNO", quote: "A lamp that argues for slowness" },
    { outlet: "IF DESIGN", quote: "Gold Award 2026 — Workspace" },
  ],

  problem: {
    kicker: "The problem",
    title: "Your evening is lit like noon.",
    body1:
      "Your body reads light as a clock. Cold, bright light means midday: stay awake, keep working. That is exactly the light still on most people's ceilings at eleven at night — and then we wonder why we are lying awake at one.",
    body2:
      "The antidote is not darker. It is warmer — with enough light left to see by. Almost no desk lamp can do that, and none does it on its own.",
    evidence: [
      {
        label: "ceiling light at 23:00",
        note: "What a standard office fixture emits — the same colour temperature as a midday sky.",
      },
      {
        label: "work under cool white at night",
        note: "Of 2,417 customers we surveyed before they bought.",
      },
      {
        label: "longer to fall asleep",
        note: "Average reported delay after two hours of bright evening light.",
      },
    ],
    source: "Source: AUREL customer survey 2025, n = 2,417 · figures rounded",
  },

  solution: {
    kicker: "The solution",
    title: "So we rebuilt the path of the sun.",
    lede: "The ARC knows your location and works out, fresh each day, when the sun rises and sets. Then it walks its spectrum along that path — ninety minutes per transition, in steps of twenty Kelvin. Slow enough that you never see it. Clear enough that you notice.",
    chartAlt: "Colour temperature across the day",
    stops: ["Waking", "Focus", "Midday peak", "Transition", "Winding down"],
  },

  productReveal: {
    kicker: "The product",
    title: "One bar, one dial, no menu.",
    lede: "Aluminium extruded in a single run, bead-blasted and anodised. A brass counterweight in the base so nothing wanders when you tug the cable. Nothing else.",
    currentFinish: "Current finish",
    configure: "Configure and buy",
    summary: "{finishes} finishes · 2 lengths · ships within 48 hours",
  },

  featuresSection: {
    kicker: "Features",
    title: "Four decisions that make the difference.",
    lede: "None of it is newly invented. It is just rare for anyone to pay for all four at once.",
  },

  smart: {
    kicker: "Control",
    title: "Evening starts when you say so.",
    lede: "Out of the box the ARC follows sunset. If your evening runs differently, move the switch-over from your phone — and turn it off from there too, once you are already lying down.",
    room: "Study",
    on: "On",
    off: "Off",
    tapToTurnOn: "Tap to switch on",
    eveningFrom: "Evening mode from",
    earlier: "Evening mode earlier",
    later: "Evening mode later",
    states: { off: "Off", evening: "Evening mode", shifting: "Shifting", daylight: "Daylight" },
    deskAt: "Your desk at {clock}",
    switchedOff: "Switched off",
    points: [
      { t: "On and off", d: "From your phone, without getting up" },
      { t: "Your own schedule", d: "Switch-over in 15-minute steps" },
      { t: "No account", d: "Bluetooth direct, no cloud" },
    ],
    tryIt:
      "Try it: switch off above, or move the switch-over — the lamp beside it shows what happens on your desk at half past eight.",
  },

  technology: {
    kicker: "Technology",
    title: "The hard part sits inside the housing.",
    lede: "Keeping a spectrum clean across the whole range is a control problem, not a design problem. Here is what that took.",
    status: "System status · ARC MAX",
    firmware: "Firmware 4.2.1 · signed",
    readouts: {
      colourTemp: "Colour temperature",
      illuminance: "Illuminance",
      duty: "Channel duty",
      heatsink: "Heatsink",
    },
    spd: "Spectral distribution at {kelvin} K",
    cri: "CRI 97 · R9 92",
    pillars: [
      {
        title: "Solar table on board",
        body: "Sunrise and sunset are computed locally from latitude and date. No server, no location sent anywhere, correct across daylight saving.",
      },
      {
        title: "400 Hz control loop",
        body: "Each of the five channels is driven separately and trimmed against a reference sensor — the mix stays stable across the lifetime, not just on day one.",
      },
      {
        title: "Thermal compensation",
        body: "LEDs shift colour as they warm up. A sensor in the heatsink corrects the mix along with them instead of ignoring the drift.",
      },
      {
        title: "Bluetooth LE, Matter-ready",
        body: "Connected only when you need it. The lamp works fully offline; the app is an editor, not an operating system.",
      },
    ],
    stats: [
      { prefix: "", suffix: " h", label: "L90 lifetime" },
      { prefix: "", suffix: " years", label: "warranty" },
      { prefix: "", suffix: " years", label: "spare parts" },
      { prefix: "CRI ", suffix: "", label: "across the whole range" },
    ],
  },

  variants: {
    kicker: "Variants & price",
    title: "Two lengths, three finishes.",
    lede: "Measure your desk and the decision makes itself. The electronics are identical in both.",
    chooseModel: "Choose model",
  },

  accessoriesSection: {
    kicker: "Accessories",
    title: "The same lamp, hung somewhere else.",
    lede: "Not every desk has room for a base, and not every job wants light from the front. Two mounts, both fitting ARC and ARC MAX.",
    upsellTitle: "Matching accessories",
    upsellIn: "in {finish}",
    addAria: "Add AUREL {name} to cart",
  },

  social: {
    kicker: "Customers",
    title: "Two thousand desks later.",
    outOf: "from {count} reviews",
    recommend: "would recommend it",
    ownedFor: "for {duration}",
    trust: [
      { title: "60 nights to try it", note: "Return shipping paid" },
      { title: "5-year warranty", note: "Parts stocked for 10" },
      { title: "Ships worldwide", note: "Dispatched within 48 hours" },
      { title: "iF Gold Award 2026", note: "Workspace category" },
    ],
  },

  faqSection: {
    kicker: "Questions",
    title: "What people want to know before buying.",
    lede: "If your question isn't here, write to us — someone who uses the lamp will answer.",
    contact: "hello@aurel.light · Mon–Fri, 9–17 CET",
  },

  finalCta: {
    stamp: "23:00 · 1800 K",
    title: "The rest of the day takes care of itself.",
    lede: "Put the ARC on your desk, give it a location once, and forget about it. If your evening runs differently, the rest is on your phone. Sixty nights to find out.",
    secondary: "Still wondering?",
  },

  footer: {
    blurb:
      "We build light for the one metre of desk where the day actually happens. Designed in Copenhagen, made in Portugal.",
    status: "System status · all plants running",
    columns: { product: "Product", buy: "Buy", company: "Company" },
    links: {
      specs: "Specifications",
      accessories: "Accessories",
      cart: "Cart",
      shipping: "Shipping & delivery",
      trial: "60 nights to try it",
      warranty: "Warranty",
      about: "About AUREL",
      press: "Press",
      sustainability: "Sustainability",
      contact: "Contact",
      imprint: "Imprint",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
    },
    copyright: "© {year} AUREL Lighting ApS — demonstration project, not a real brand",
  },

  cart: {
    title: "Cart",
    items: "{count} items",
    close: "Close cart",
    emptyTitle: "Nothing in here yet",
    emptyBody: "The ARC comes in three finishes and two lengths.",
    emptyCta: "See the product",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    remove: "Remove",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingIncluded: "Included",
    total: "Total",
    vatIncluded: "incl. {amount} VAT",
    checkout: "Checkout",
    trial: "60 nights to try it · return shipping paid",
  },

  checkout: {
    back: "Continue shopping",
    title: "Checkout",
    contact: "Contact",
    email: "Email",
    address: "Delivery address",
    firstName: "First name",
    lastName: "Last name",
    street: "Street and number",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    payment: "Payment",
    demoTitle: "Demo payment",
    demoBody:
      "This is a demonstration project — no payment details are collected and no payment is taken. The integration sits behind a provider interface, so Stripe can be dropped in without changing the interface.",
    failed: "The payment could not be completed. Please try again.",
    processing: "Processing…",
    placeOrder: "Place order — {amount}",
    summary: "Your order",
    vatLine: "VAT included ({rate}%)",
    emptyTitle: "Your cart is empty.",
    emptyBody: "Put an ARC in it and we'll carry on here.",
    emptyCta: "Go to the product",
    errors: {
      email: "Please enter a valid email address.",
      required: "Please fill this in.",
      street: "Enter street and number.",
      postalCode: "Please enter a valid postal code.",
    },
    duties: "Duties and import VAT are included in the price.",
    regions: { eu: "European Union", europe: "Rest of Europe", world: "Worldwide" },
  },

  success: {
    title: "Order confirmed.",
    lede: "We've sent a confirmation to {email}. The lamp leaves our warehouse within 48 hours.",
    orderNumber: "Order number",
    delivery: "Estimated delivery",
    overview: "Order summary",
    totalPaid: "Total paid",
    home: "Back to the homepage",
    demoNote: "Demo order · no payment was taken",
  },

  product: {
    subtitle: "Circadian desk light. {tagline} Lights {coverage}, {lumens} lumens at 4000 K.",
    reviewsShort: "{rating} · {count} reviews",
    priceNote: "incl. VAT · worldwide shipping included · {sku}",
    length: "Length",
    finishWith: "Finish — {finish}",
    outOfStock: "{finish} in {model} is out of stock right now — {leadTime}.",
    addWithPrice: "Add to cart — {price}",
    buyNow: "Buy it now",
    delivery: [
      { title: "Worldwide shipping included", note: "Dispatched in 48 hours, delivered in 2–6 working days" },
      { title: "60 nights to try it", note: "If it doesn't fit we collect it — return shipping paid" },
      { title: "5-year warranty", note: "We stock spare parts for ten years" },
    ],
    descriptionKicker: "Product description",
    descriptionTitle: "Built to stand on the same desk for twenty years.",
    description: [
      "The body is a single extruded aluminium profile, screwed rather than glued at both ends. The diffuser comes out; should it go cloudy in ten years, you replace it, not the lamp.",
      "In the base sits a 900 gram brass counterweight. That is why the ARC stays put when you catch the cable, and why it feels heavier than it looks.",
      "The rest is restraint: no status LED blinking at night, no logo on the front, no fan. The lamp is there to light the desk, not to ask for attention.",
    ],
    specsTitle: "Specifications",
  },

  viewer: {
    view: "View",
    views: { gesamt: "Whole", leiste: "Light bar", sockel: "Base" },
    notes: {
      gesamt: "Full view · {cm} cm",
      leiste: "Diffuser · asymmetric optics",
      sockel: "Dial · milled from one billet",
    },
    day: "Day · 5400 K",
    night: "Night · 1900 K",
    coverage: "{coverage} coverage",
    hotspotHint: "Tap the points for detail",
    hotspotClose: "Tap again to close",
    hotspots: [
      {
        title: "Asymmetric diffuser",
        body: "Microstructure in the acrylic that tips the light forward and cuts it above 65°.",
      },
      {
        title: "Milled joint",
        body: "Friction-damped, holds any angle without a spring and without readjusting.",
      },
      {
        title: "The dial",
        body: "Milled from one billet, weighted with brass. Turn for brightness, push for colour temperature.",
      },
      {
        title: "End cap",
        body: "Screwed rather than glued — the diffuser comes out if it goes cloudy in ten years.",
      },
    ],
  },
};

/** English copy for everything keyed off a catalogue id. */
import type { Dict } from "./types";

export const enContent: Pick<
  Dict,
  "finishes" | "models" | "accessories" | "features" | "reviews" | "faq" | "specs"
> = {
  finishes: {
    graphite: { name: "Graphite", note: "Blasted anodised, near-black in shadow." },
    alabaster: { name: "Alabaster", note: "Bead-blasted, matte. Disappears against a pale wall." },
    sand: { name: "Sand", note: "Warm champagne anodising with a fine linear grain." },
  },

  models: {
    arc: {
      tagline: "For a desk you sit at.",
      highlights: ["58 cm light bar", "1100 lm at 4000 K", "Covers one workstation"],
      coverage: "120 × 60 cm",
    },
    "arc-max": {
      tagline: "For a desk you live at.",
      highlights: ["84 cm light bar", "1750 lm at 4000 K", "Covers two monitors"],
      coverage: "180 × 75 cm",
    },
  },

  accessories: {
    clip: {
      title: "Monitor mount",
      tagline: "For the desk that has no room left.",
      summary:
        "Puts the ARC on the top edge of your monitor instead of beside it. The foot rests on the panel and a counterweight holds it — no screws, no adhesive, curved displays included.",
      bullets: [
        "Fits 99.9% of all monitors",
        "Panel 6 – 42 mm, curved from 1500R",
        "Tilts ±25°, friction-damped",
      ],
      specs: [
        { label: "Fits", value: "99.9% of all monitors, 24 – 49 inch" },
        { label: "Clamping range", value: "6 – 42 mm panel thickness" },
        { label: "Tilt", value: "±25°, friction-damped" },
        { label: "Weight", value: "340 g incl. counterweight" },
        { label: "Material", value: "Aluminium, silicone pad" },
      ],
    },
    arch: {
      title: "Overhead stand",
      tagline: "Stands on the desk, lights from above.",
      summary:
        "A cantilever arch on a weighted foot. The bar hangs 62 cm above the desktop, centred over you, and throws light straight down — no shadow from your own hand, and nothing in your eyeline.",
      bullets: [
        "Reach to 48 cm, height to 74 cm",
        "3.1 kg steel foot, won't tip",
        "Height and reach adjustable",
      ],
      specs: [
        { label: "Height", value: "52 – 74 cm, adjustable" },
        { label: "Reach", value: "34 – 48 cm" },
        { label: "Foot", value: "3.1 kg steel, felt pad" },
        { label: "Footprint", value: "22 cm diameter" },
        { label: "Material", value: "Aluminium, steel" },
      ],
    },
  },

  features: [
    {
      kicker: "Solar sync",
      title: "It knows what time your body thinks it is",
      body: "The ARC computes local sunrise and sunset on device and moves the spectrum with them. Cold and bright when you need to think. Ember-warm when the evening starts. If the default doesn't match when your day ends, move the switch-over in the app — otherwise you never touch a thing.",
      spec: [
        { label: "Transition", value: "90 min ramp" },
        { label: "Resolution", value: "20 K steps" },
      ],
    },
    {
      kicker: "Spectral engine",
      title: "Five channels, because two cannot tell the truth",
      body: "Most tunable lights mix one warm and one cool white and call it tunable white. That is why skin goes grey and wood goes flat. The ARC adds amber, deep red and cyan and re-solves the mix at every step — CRI 97 across the whole range, not only at the ends.",
      spec: [
        { label: "CRI", value: "97 (R9 > 90)" },
        { label: "Channels", value: "5 independent" },
      ],
    },
    {
      kicker: "Optics",
      title: "Light on the desk, not in your eyes",
      body: "A 58 cm asymmetric lens throws light forward and down onto the work surface and cuts it hard above 65°. The desk is evenly lit, nothing reflects off the monitor, and anyone sitting opposite sees a lit desk rather than a lamp.",
      spec: [
        { label: "Cut-off", value: "65°" },
        { label: "Uniformity", value: "0.8 min/avg" },
      ],
    },
    {
      kicker: "The dial",
      title: "One control, and it does the obvious thing",
      body: "Turn for brightness. Push and turn for colour temperature. Press to hold the current setting against the schedule until morning. No menu, no mode switch, no second press that means something else — the dial is milled from one billet and weighted so it coasts to a stop.",
      spec: [
        { label: "Detents", value: "None — continuous" },
        { label: "Travel", value: "270° usable" },
      ],
    },
  ],

  reviews: [
    {
      role: "Architect",
      location: "Rotterdam",
      title: "The 21:00 shift is the whole point",
      body: "I bought it for the light quality and stayed for the schedule. Around nine the bar drops into something close to candlelight and I notice I stop squinting. Drawing detail at 2700 K is still perfectly readable.",
      ownedFor: "7 months",
    },
    {
      role: "Colour grader",
      location: "Berlin",
      title: "Passes a colour checker, which I did not expect",
      body: "I test everything against a colour chart before it goes near my suite. Skin tones hold at 5000 K and there is no green cast in the mid-range. The first lamp I have not had to gel.",
      ownedFor: "a year",
    },
    {
      role: "PhD candidate",
      location: "Zurich",
      title: "Excellent light, app merely solid",
      body: "The hardware is genuinely lovely and the auto mode has helped my sleep more than I wanted to admit. The app took two updates before the schedule editor felt finished. Worth it, but not flawless.",
      ownedFor: "5 months",
    },
    {
      role: "Software engineer",
      location: "Oslo",
      title: "No flicker on camera",
      body: "I am on calls half the day and every previous lamp banded on camera. This one is clean at every brightness, apparently because of the DC dimming. Small thing, fixed a daily annoyance.",
      ownedFor: "4 months",
    },
    {
      role: "Goldsmith",
      location: "Vienna",
      title: "Finally see the metal properly",
      body: "Bench work needs honest colour and a lot of it. At full output the ARC MAX covers the whole bench with no hot spot, and thanks to the high CRI a stone looks the same here as it does outside.",
      ownedFor: "9 months",
    },
    {
      role: "Copywriter",
      location: "Malmö",
      title: "Beautiful object, considered purchase",
      body: "It is a lot of money for a desk lamp and I hesitated. Six months on I use it every day and the desk feels different in the evening. I would buy it again, but I would not pretend it is cheap.",
      ownedFor: "6 months",
    },
  ],

  faq: [
    {
      q: "What does the app do?",
      a: "Turns the light on and off without you getting up. Sets brightness and colour temperature by hand. And above all: decides when evening mode kicks in — in 15-minute steps between 17:00 and 23:00, separately for each weekday. Plus presets and firmware updates. It connects over Bluetooth directly, with no account and no cloud.",
    },
    {
      q: "Does it work without a phone?",
      a: "Completely. Out of the box the ARC runs its solar schedule from its own clock, and the dial on the base overrides brightness and colour temperature at any time — turn for brightness, push and turn for warmth. Flat phone, no Wi-Fi, app never installed: the lamp still does its job.",
    },
    {
      q: "How does it know where the sun is?",
      a: "During setup you give it a location once. From then on it computes sunrise and sunset from a solar table on the device itself — no network request, no location tracking, and correct across daylight saving changes.",
    },
    {
      q: "Is this really better than a good bulb?",
      a: "For room light, a good bulb is entirely fine. The ARC is built for the metre of desk in front of you: CRI 97 so colours stay honest, optics that put the light on the work rather than in your eyes, flicker-free dimming to 0.1%, and a spectrum that changes across the day. If none of that matters to you, buy the bulb.",
    },
    {
      q: "Will it fit my desk?",
      a: "The ARC has a 58 cm bar and lights roughly 120 × 60 cm — one monitor plus keyboard. The ARC MAX has 84 cm for 180 × 75 cm, so a dual-monitor setup. Both clamp to desks up to 62 mm, and a weighted base is included. With the CLIP it hangs on the monitor, with the ARCH above the desk.",
    },
    {
      q: "What about tired eyes in the evening?",
      a: "That is exactly why it exists. After sunset the ARC drops to 1800–2200 K and keeps melanopic output low, so the light stops telling your body it is midday. Fine detail stays readable — it goes warm, not dark.",
    },
    {
      q: "How long does it last?",
      a: "The LED array is rated L90 at 50,000 hours: after roughly seventeen years of eight-hour days it still gives 90% of its original output. Driver, diffuser and dial are individually replaceable, and we stock parts for ten years.",
    },
    {
      q: "How do returns work?",
      a: "Sixty nights. Use it at your actual desk across a seasonal shift — if it is not for you, we arrange the pickup and refund in full, including the original shipping.",
    },
    {
      q: "Do you ship worldwide?",
      a: "Yes. We ship to over 90 countries and shipping is included in the price. Within the EU, Switzerland, the UK and Norway we deliver in two to four working days; to the US, Canada, Australia and Japan in four to six. Duties and import VAT are already included in the price shown — nothing is charged on delivery. The power supply ships with the plug type for your country.",
    },
  ],

  specs: [
    {
      group: "Light",
      rows: [
        { label: "Colour temperature", value: "1800 – 6500 K, continuous" },
        { label: "Colour rendering", value: "CRI 97, R9 > 90" },
        { label: "Output", value: "1100 lm (ARC) · 1750 lm (ARC MAX)" },
        { label: "Dimming", value: "DC, flicker-free, 100% – 0.1%" },
        { label: "Illuminance at 40 cm", value: "820 lx (ARC) · 1150 lx (ARC MAX)" },
        { label: "Glare", value: "UGR < 16" },
      ],
    },
    {
      group: "Body",
      rows: [
        { label: "Bar length", value: "58 cm (ARC) · 84 cm (ARC MAX)" },
        { label: "Height range", value: "38 – 54 cm" },
        { label: "Material", value: "Extruded 6063 aluminium, brass counterweight" },
        { label: "Finish", value: "Type II anodised, bead-blasted" },
        { label: "Weight", value: "2.4 kg (ARC) · 3.1 kg (ARC MAX)" },
        { label: "Mounting", value: "Desk clamp to 62 mm, free-standing base included" },
      ],
    },
    {
      group: "Electronics",
      rows: [
        { label: "LED array", value: "5 channels: 2 × white, amber, deep red, cyan" },
        { label: "Sensors", value: "Ambient lux, presence, colour temperature" },
        { label: "Wireless", value: "Bluetooth LE 5.3, Matter-ready" },
        { label: "Power", value: "24 V DC, 32 W peak, USB-C PD input" },
        { label: "Lifetime", value: "L90 at 50,000 hours" },
        { label: "Firmware", value: "Over-the-air, signed" },
      ],
    },
    {
      group: "Control",
      rows: [
        { label: "App", value: "AUREL for iOS 16+ and Android 10+" },
        { label: "Functions", value: "On/off, brightness, colour temperature, schedule, presets" },
        { label: "Evening mode", value: "Free choice 17:00 – 23:00, 15-minute steps, per weekday" },
        { label: "Connection", value: "Bluetooth LE 5.3, direct — no account, no cloud" },
        { label: "Range", value: "approx. 10 m, one room" },
        { label: "Without a phone", value: "The dial on the base sets brightness and warmth" },
      ],
    },
    {
      group: "Shipping & box",
      rows: [
        { label: "Included", value: "ARC, desk clamp, base, 2 m USB-C cable, 45 W adapter" },
        { label: "Adapter", value: "Plug type matched to the destination" },
        { label: "Shipping", value: "Over 90 countries, included in the price" },
        { label: "Transit", value: "2 – 4 working days EU/UK/CH · 4 – 6 worldwide" },
        { label: "Duties", value: "Duties and import VAT included" },
        { label: "Warranty", value: "5 years, parts stocked for 10" },
        { label: "Trial", value: "60 nights, return shipping paid" },
        { label: "Certification", value: "CE, UKCA, FCC, RoHS, TÜV photobiological RG0" },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   MUDROOM catalogue.

   Every price, dimension and throughput figure in this file is a concept
   value for a product that does not exist yet. They are internally
   consistent and plausible for industrial wash equipment, but they are
   not quotes. The UI says so wherever a number is shown.
   ═══════════════════════════════════════════════════════════════════ */

export type ConfigId = "core" | "pro" | "park";
export type ShellId = "graphite" | "bone" | "hivis" | "forest";
export type OptionId =
  | "reclaim"
  | "dry"
  | "drain"
  | "lube"
  | "terminal"
  | "solar";
export type InstallId = "self" | "guided" | "onsite";

export interface Configuration {
  id: ConfigId;
  name: string;
  strap: string;
  priceCents: number;
  blurb: string;
  includes: string[];
  cycleSeconds: number;
  programs: number;
  bestFor: string;
}

export interface Shell {
  id: ShellId;
  name: string;
  /** Main body colour handed to <WashBox shell> */
  hex: string;
  /** Small swatch ring so light shells stay visible on dark. */
  ring: string;
  note: string;
}

export interface Extra {
  id: OptionId;
  name: string;
  priceCents: number;
  blurb: string;
  /** Already contained in these configurations — shown as included. */
  includedIn: ConfigId[];
}

export interface Install {
  id: InstallId;
  name: string;
  priceCents: number;
  blurb: string;
  lead: string;
}

export const CONFIGURATIONS: Configuration[] = [
  {
    id: "core",
    name: "ONE CORE",
    strap: "The box, doing the job.",
    priceCents: 1890000,
    blurb:
      "Rotating brush set, high-pressure ring, four wash programs, mechanical start button. Everything needed to get a filthy bike clean and nothing else.",
    includes: [
      "3 brush units (1 top, 2 side)",
      "12-nozzle high-pressure ring",
      "4 programs incl. MUD MODE",
      "Mains water + drain connection",
      "3-year parts warranty",
    ],
    cycleSeconds: 150,
    programs: 4,
    bestFor: "Home garages, small shops",
  },
  {
    id: "pro",
    name: "ONE PRO",
    strap: "Closed loop, faster turnaround.",
    priceCents: 2450000,
    blurb:
      "Adds a filtration and water-reclaim loop, an air-blade drying pass and app or RFID start — for places where the box runs more than twice a day.",
    includes: [
      "Everything in ONE CORE",
      "Water reclaim + 3-stage filtration",
      "Air-blade drying pass",
      "App / RFID start, usage log",
      "5-year parts warranty",
    ],
    cycleSeconds: 135,
    programs: 6,
    bestFor: "Bike shops, clubs, hotels",
  },
  {
    id: "park",
    name: "ONE PARK",
    strap: "Built to be outside, all season.",
    priceCents: 3190000,
    blurb:
      "Outdoor-rated shell, frost protection down to −15 °C, queue lighting and an optional payment terminal. The version bike parks and trail centres run.",
    includes: [
      "Everything in ONE PRO",
      "Outdoor shell, IP-rated cabinet",
      "Frost protection to −15 °C",
      "Queue lighting + status beacon",
      "Telemetry dashboard, 5-year warranty",
    ],
    cycleSeconds: 135,
    programs: 6,
    bestFor: "Bike parks, trail centres, resorts",
  },
];

export const SHELLS: Shell[] = [
  { id: "graphite", name: "Graphite", hex: "#2c3236", ring: "#4b5358", note: "Standard. Hides water marks best." },
  { id: "bone", name: "Bone", hex: "#cfd0c8", ring: "#e9eae5", note: "Reflects heat. Popular outdoors." },
  { id: "hivis", name: "Hi-Vis", hex: "#b6dd45", ring: "#c8f249", note: "Findable from the far end of a car park." },
  { id: "forest", name: "Deep Forest", hex: "#22322a", ring: "#3d5a49", note: "Disappears into a trail centre." },
];

export const EXTRAS: Extra[] = [
  {
    id: "reclaim",
    name: "Water reclaim module",
    priceCents: 349000,
    blurb: "Settles out grit and recirculates up to an estimated 80 % of each cycle's water.",
    includedIn: ["pro", "park"],
  },
  {
    id: "dry",
    name: "Air-blade drying pass",
    priceCents: 289000,
    blurb: "Adds a 25-second blow-off so the bike leaves damp, not dripping.",
    includedIn: ["pro", "park"],
  },
  {
    id: "drain",
    name: "Floor drain + sump kit",
    priceCents: 129000,
    blurb: "Free-standing sump for sites without a floor drain. No ground work needed.",
    includedIn: [],
  },
  {
    id: "lube",
    name: "Chain care station",
    priceCents: 89000,
    blurb: "Wall rail with degreaser, chain lube and a rag dispenser, mounted at the exit.",
    includedIn: [],
  },
  {
    id: "terminal",
    name: "Payment terminal",
    priceCents: 179000,
    blurb: "Card and phone payment per wash, with a simple takings dashboard.",
    includedIn: ["park"],
  },
  {
    id: "solar",
    name: "Solar roof panel",
    priceCents: 219000,
    blurb: "Covers the pump and control load on sunny days. Grid stays connected as backup.",
    includedIn: [],
  },
];

export const INSTALLS: Install[] = [
  {
    id: "self",
    name: "Self-install",
    priceCents: 0,
    blurb: "Delivered on a pallet with the manual and a video walkthrough. Two people, roughly a day.",
    lead: "6–8 weeks",
  },
  {
    id: "guided",
    name: "Guided install",
    priceCents: 119000,
    blurb: "Your fitter, our engineer on a video call for the plumbing, power and first calibration.",
    lead: "6–8 weeks",
  },
  {
    id: "onsite",
    name: "On-site install",
    priceCents: 289000,
    blurb: "We come, we level it, we connect it, we hand you a running box and a signed test cycle.",
    lead: "8–10 weeks",
  },
];

export const WARRANTY_EXTENSION_CENTS = 159000;
export const SHIPPING_CENTS = 89000;
export const VAT_RATE = 0.19;

/* ── lookups ─────────────────────────────────────────────────────────── */

export function getConfiguration(id: ConfigId): Configuration {
  return CONFIGURATIONS.find((c) => c.id === id) ?? CONFIGURATIONS[0];
}
export function getShell(id: ShellId): Shell {
  return SHELLS.find((s) => s.id === id) ?? SHELLS[0];
}
export function getExtra(id: OptionId): Extra {
  return EXTRAS.find((e) => e.id === id) ?? EXTRAS[0];
}
export function getInstall(id: InstallId): Install {
  return INSTALLS.find((i) => i.id === id) ?? INSTALLS[0];
}

export function extraIsIncluded(option: OptionId, config: ConfigId): boolean {
  return getExtra(option).includedIn.includes(config);
}

/* ── money ───────────────────────────────────────────────────────────── */

export function formatPrice(cents: number, opts?: { decimals?: boolean }): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: opts?.decimals ? 2 : 0,
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(cents / 100);
}

/* ── SKU ─────────────────────────────────────────────────────────────── */

export interface BoxSpec {
  config: ConfigId;
  shell: ShellId;
  extras: OptionId[];
  install: InstallId;
  warrantyExtension: boolean;
}

export function boxSku(spec: BoxSpec): string {
  const extras = spec.extras.filter((e) => !extraIsIncluded(e, spec.config)).slice().sort();
  return [
    "box",
    spec.config,
    spec.shell,
    spec.install,
    spec.warrantyExtension ? "w5" : "w3",
    extras.length ? extras.join("+") : "none",
  ].join(":");
}

export function parseBoxSku(sku: string): BoxSpec | null {
  const parts = sku.split(":");
  if (parts.length !== 6 || parts[0] !== "box") return null;
  const [, config, shell, install, warranty, extras] = parts;
  if (!CONFIGURATIONS.some((c) => c.id === config)) return null;
  if (!SHELLS.some((s) => s.id === shell)) return null;
  if (!INSTALLS.some((i) => i.id === install)) return null;
  return {
    config: config as ConfigId,
    shell: shell as ShellId,
    install: install as InstallId,
    warrantyExtension: warranty === "w5",
    extras:
      extras === "none"
        ? []
        : (extras.split("+").filter((e) => EXTRAS.some((x) => x.id === e)) as OptionId[]),
  };
}

/** Unit price of one configured box, in cents, excluding shipping. */
export function specPriceCents(spec: BoxSpec): number {
  let total = getConfiguration(spec.config).priceCents;
  for (const id of spec.extras) {
    if (!extraIsIncluded(id, spec.config)) total += getExtra(id).priceCents;
  }
  total += getInstall(spec.install).priceCents;
  if (spec.warrantyExtension && spec.config === "core") total += WARRANTY_EXTENSION_CENTS;
  return total;
}

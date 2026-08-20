/* ═══════════════════════════════════════════════════════════════════════
   Event rental — pricing model and request seam.

   The numbers below are an indicative model, not a quote. Real jobs get
   priced by a human once travel, water access and power are known; the
   calculator exists so an organiser can see the order of magnitude before
   filling in a form.
   ═══════════════════════════════════════════════════════════════════ */

export type EventTypeId = "festival" | "race" | "bikepark" | "camp" | "private";
export type DurationId = "day" | "weekend" | "week" | "custom";
export type VolumeId = "10" | "50" | "100" | "500" | "1000";

export interface EventType {
  id: EventTypeId;
  name: string;
  blurb: string;
  /** Multiplier on the base rate — crew size, hours on site, mess factor. */
  factor: number;
}

export interface Duration {
  id: DurationId;
  name: string;
  days: number;
  /** Discount applied to the per-day rate for longer bookings. */
  dayRate: number;
}

export interface Volume {
  id: VolumeId;
  name: string;
  bikes: number;
  /** Boxes we would send for that throughput. */
  boxes: number;
}

export const EVENT_TYPES: EventType[] = [
  { id: "festival", name: "Festival", blurb: "Multi-day, mixed crowd, long queues at dusk.", factor: 1.15 },
  { id: "race", name: "Race", blurb: "Practice, quali, race day. Peaks between runs.", factor: 1.3 },
  { id: "bikepark", name: "Bike park", blurb: "Season or weekend residency at a lift-served park.", factor: 1.0 },
  { id: "camp", name: "Bike camp", blurb: "Small group, every evening, same faces.", factor: 0.9 },
  { id: "private", name: "Private / club", blurb: "Club weekend, team day, brand shoot.", factor: 0.85 },
];

export const DURATIONS: Duration[] = [
  { id: "day", name: "1 day", days: 1, dayRate: 1 },
  { id: "weekend", name: "Weekend", days: 3, dayRate: 0.82 },
  { id: "week", name: "1 week", days: 7, dayRate: 0.66 },
  { id: "custom", name: "Custom", days: 14, dayRate: 0.55 },
];

export const VOLUMES: Volume[] = [
  { id: "10", name: "Up to 10", bikes: 10, boxes: 1 },
  { id: "50", name: "Up to 50", bikes: 50, boxes: 1 },
  { id: "100", name: "Up to 100", bikes: 100, boxes: 2 },
  { id: "500", name: "Up to 500", bikes: 500, boxes: 4 },
  { id: "1000", name: "1000+", bikes: 1000, boxes: 6 },
];

/** Per box, per day, before duration discount. */
const BASE_DAY_RATE_CENTS = 89000;
/** Delivery, rigging, water + power hookup, collection. Per box. */
const SETUP_CENTS = 145000;
/** One operator per two boxes, per day. */
const CREW_DAY_CENTS = 42000;

export interface RentalQuote {
  boxes: number;
  days: number;
  boxCents: number;
  setupCents: number;
  crewCents: number;
  totalCents: number;
  /** Indicative range shown to the user: ±12 %. */
  lowCents: number;
  highCents: number;
  perBikeCents: number;
}

export function quoteRental(
  eventType: EventTypeId,
  duration: DurationId,
  volume: VolumeId,
): RentalQuote {
  const type = EVENT_TYPES.find((e) => e.id === eventType) ?? EVENT_TYPES[0];
  const dur = DURATIONS.find((d) => d.id === duration) ?? DURATIONS[0];
  const vol = VOLUMES.find((v) => v.id === volume) ?? VOLUMES[0];

  const boxes = vol.boxes;
  const days = dur.days;

  const boxCents = Math.round(BASE_DAY_RATE_CENTS * dur.dayRate * days * boxes * type.factor);
  const setupCents = SETUP_CENTS * boxes;
  const crewCents = Math.round(CREW_DAY_CENTS * days * Math.ceil(boxes / 2));
  const totalCents = boxCents + setupCents + crewCents;

  return {
    boxes,
    days,
    boxCents,
    setupCents,
    crewCents,
    totalCents,
    lowCents: Math.round((totalCents * 0.88) / 5000) * 5000,
    highCents: Math.round((totalCents * 1.12) / 5000) * 5000,
    perBikeCents: Math.round(totalCents / vol.bikes),
  };
}

/* ── request seam ────────────────────────────────────────────────────── */

export interface RentalRequest {
  eventType: EventTypeId;
  duration: DurationId;
  volume: VolumeId;
  eventName: string;
  startDate: string;
  location: string;
  country: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface RentalReceipt {
  reference: string;
  receivedAtIso: string;
  replyWithinHours: number;
}

/**
 * Demo submission. A real deployment POSTs this to a CRM or an inbox —
 * one fetch, same signature, nothing in the form components changes.
 */
export async function submitRentalRequest(request: RentalRequest): Promise<RentalReceipt> {
  if (!request.email.includes("@")) throw new Error("A reachable email is required");
  await new Promise((resolve) => setTimeout(resolve, 1400));
  const rand = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, "0");
  const y = String(new Date().getFullYear()).slice(2);
  return {
    reference: `EV-${y}-${rand}`,
    receivedAtIso: new Date().toISOString(),
    replyWithinHours: 24,
  };
}

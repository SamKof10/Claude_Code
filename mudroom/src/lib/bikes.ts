/**
 * Bike catalogue.
 *
 * Every bike is drawn from these numbers rather than hand-authored, so the
 * seven silhouettes are genuinely different instead of one shape recoloured.
 * Geometry is in viewBox units on a 460 × 300 canvas with the ground at
 * y = 250; the customer-facing figures live in `spec`.
 */

export type BikeId = "mtb" | "enduro" | "downhill" | "xc" | "gravel" | "road" | "ebike" | "bmx";
export type BarType = "flat" | "riser" | "drop" | "bmx";

export interface Bike {
  id: BikeId;
  name: string;
  blurb: string;
  /** Wheel radius including tyre. */
  wheelR: number;
  /** Tyre carcass thickness. */
  tyre: number;
  /** Knob depth — 0 is a slick. */
  knob: number;
  wheelbase: number;
  /** Bottom-bracket height above the ground. */
  bbY: number;
  /** Saddle height above the ground. */
  seatY: number;
  /** Handlebar height above the ground. */
  barY: number;
  /** Head angle in degrees from horizontal — slacker reads more gravity. */
  headAngle: number;
  /** Seat tube angle in degrees from horizontal. */
  seatAngle: number;
  /** Chainstay length as a fraction of the wheelbase. */
  csRatio: number;
  /** Fork stanchion length; 0 is a rigid fork. */
  travel: number;
  /**
   * Vertical rise from the front axle to the fork crown. This is the
   * axle-to-crown length resolved onto the vertical, which is what places
   * the head tube — using the raw axle-to-crown puts the front end far too
   * high on a slack bike.
   */
  crownRise: number;
  fullSus: boolean;
  /** Rear travel, in canvas units — drives the shock and rocker. */
  rearTravel: number;
  /** Two crowns above and below the head tube. */
  dualCrown: boolean;
  /** Telescoping seatpost, drawn in two tones. */
  dropper: boolean;
  /** Disc rotor radius; 0 draws rim brakes' worth of nothing. */
  rotorR: number;
  /** Rear cassette radius. */
  cassetteR: number;
  /** Chainring radius. */
  ringR: number;
  bar: BarType;
  battery: boolean;
  spec: {
    wheelSize: string;
    length: string;
    barWidth: string;
    frameSizes: string;
    weight: string;
    ebike: boolean;
  };
}

export const BIKES: Bike[] = [
  {
    id: "mtb",
    name: "Trail",
    blurb: "Balanced, agile, made for trails — and the bike most people actually own. The mud sits everywhere.",
    wheelR: 62, tyre: 7, knob: 3, wheelbase: 205, bbY: 57, seatY: 167, barY: 173,
    headAngle: 65.5, seatAngle: 76, csRatio: 0.354, travel: 23, crownRise: 83,
    fullSus: true, rearTravel: 20, dualCrown: false, dropper: true,
    rotorR: 16, cassetteR: 16, ringR: 11, bar: "riser", battery: false,
    spec: { wheelSize: '29"', length: "182 cm", barWidth: "780 mm", frameSizes: "S – XL", weight: "12 – 15 kg", ebike: false },
  },
  {
    id: "enduro",
    name: "Enduro",
    blurb: "Robust, versatile, ready for any terrain. Long, slack, full suspension — and the linkage is where the mud hides.",
    wheelR: 63, tyre: 9, knob: 3.6, wheelbase: 214, bbY: 58, seatY: 171, barY: 179,
    headAngle: 63.5, seatAngle: 77.5, csRatio: 0.348, travel: 29, crownRise: 87,
    fullSus: true, rearTravel: 26, dualCrown: false, dropper: true,
    rotorR: 17, cassetteR: 16, ringR: 11, bar: "riser", battery: false,
    spec: { wheelSize: '29" / mullet', length: "188 cm", barWidth: "800 mm", frameSizes: "S – XL", weight: "14 – 16 kg", ebike: false },
  },
  {
    id: "downhill",
    name: "Downhill",
    blurb: "Maximum performance in the harshest conditions. Dual crown, huge tyres, and one wet run makes it unrecognisable.",
    wheelR: 64, tyre: 11, knob: 4.5, wheelbase: 224, bbY: 60, seatY: 120, barY: 186,
    headAngle: 62, seatAngle: 74, csRatio: 0.342, travel: 34, crownRise: 91,
    fullSus: true, rearTravel: 32, dualCrown: true, dropper: false,
    rotorR: 18, cassetteR: 14, ringR: 10, bar: "riser", battery: false,
    spec: { wheelSize: '29" / 27.5"', length: "196 cm", barWidth: "800 mm", frameSizes: "S – L", weight: "16 – 18 kg", ebike: false },
  },
  {
    id: "xc",
    name: "Cross country",
    blurb: "Light, fast, efficient, built for race day. Fine dust in every bearing by the second lap.",
    wheelR: 62, tyre: 5.5, knob: 2, wheelbase: 190, bbY: 55, seatY: 175, barY: 167,
    headAngle: 68, seatAngle: 75, csRatio: 0.377, travel: 17, crownRise: 79,
    fullSus: false, rearTravel: 0, dualCrown: false, dropper: true,
    rotorR: 15, cassetteR: 16, ringR: 11, bar: "flat", battery: false,
    spec: { wheelSize: '29"', length: "176 cm", barWidth: "740 mm", frameSizes: "XS – XL", weight: "9 – 12 kg", ebike: false },
  },
  {
    id: "gravel",
    name: "Gravel",
    blurb: "Versatile, comfortable, ready for the long way round. Drop bars and a drivetrain that collects grit like a magnet.",
    wheelR: 63, tyre: 6, knob: 1.5, wheelbase: 178, bbY: 47, seatY: 175, barY: 171,
    headAngle: 71, seatAngle: 73.5, csRatio: 0.404, travel: 0, crownRise: 63,
    fullSus: false, rearTravel: 0, dualCrown: false, dropper: false,
    rotorR: 14, cassetteR: 14, ringR: 13, bar: "drop", battery: false,
    spec: { wheelSize: "700 × 45c", length: "178 cm", barWidth: "460 mm", frameSizes: "XS – XL", weight: "8 – 11 kg", ebike: false },
  },
  {
    id: "road",
    name: "Road",
    blurb: "Top-end performance on tarmac. Slicks and tight clearances — rarely muddy, always covered in road film.",
    wheelR: 63, tyre: 4, knob: 0, wheelbase: 179, bbY: 49, seatY: 180, barY: 178,
    headAngle: 73, seatAngle: 73.5, csRatio: 0.413, travel: 0, crownRise: 64,
    fullSus: false, rearTravel: 0, dualCrown: false, dropper: false,
    rotorR: 13, cassetteR: 13, ringR: 15, bar: "drop", battery: false,
    spec: { wheelSize: "700 × 28c", length: "175 cm", barWidth: "420 mm", frameSizes: "XS – XL", weight: "7 – 9 kg", ebike: false },
  },
  {
    id: "ebike",
    name: "E-MTB",
    blurb: "Motor, battery and 25 kg of bike. The program keeps the water away from the ports and the motor seals.",
    wheelR: 63, tyre: 10, knob: 3.6, wheelbase: 217, bbY: 58, seatY: 171, barY: 180,
    headAngle: 64.5, seatAngle: 77, csRatio: 0.346, travel: 27, crownRise: 86,
    fullSus: true, rearTravel: 24, dualCrown: false, dropper: true,
    rotorR: 17, cassetteR: 16, ringR: 10, bar: "riser", battery: true,
    spec: { wheelSize: '29"', length: "190 cm", barWidth: "800 mm", frameSizes: "S – XL", weight: "22 – 27 kg", ebike: true },
  },
  {
    id: "bmx",
    name: "BMX",
    blurb: "Small, low and awkward for anything built around a full-size frame. Fits fine.",
    wheelR: 44, tyre: 8, knob: 1.8, wheelbase: 172, bbY: 52, seatY: 107, barY: 147,
    headAngle: 74.5, seatAngle: 71, csRatio: 0.331, travel: 0, crownRise: 57,
    fullSus: false, rearTravel: 0, dualCrown: false, dropper: false,
    rotorR: 0, cassetteR: 9, ringR: 12, bar: "bmx", battery: false,
    spec: { wheelSize: '20"', length: "148 cm", barWidth: "740 mm", frameSizes: "One size", weight: "10 – 12 kg", ebike: false },
  },
];

export function getBike(id: BikeId): Bike {
  const b = BIKES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown bike: ${id}`);
  return b;
}

/** What the box will and will not take — the honest limits. */
export const COMPATIBILITY = {
  maxLength: "215 cm",
  maxWidth: "92 cm",
  maxHeight: "135 cm",
  maxWeight: "45 kg",
  wheelSizes: '16" – 29", tyres to 3.0"',
  notes: [
    "Cargo bikes up to 215 cm fit; longtails beyond that do not.",
    "Tandems and recumbents are outside the envelope.",
    "Bar width above 92 cm needs the bars turned in the clamp.",
  ],
};

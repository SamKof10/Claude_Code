/* Copy and demo data for the marketing sections. Kept out of the
   components so the wording can be changed without touching layout. */

export interface Program {
  id: string;
  name: string;
  duration: string;
  water: string;
  pressure: string;
  blurb: string;
  brushes: string;
}

export const PROGRAMS: Program[] = [
  {
    id: "quick",
    name: "Quick wash",
    duration: "2 – 3 min",
    water: "≈ 18 l",
    pressure: "40 bar",
    brushes: "Side pass only",
    blurb: "After-work dust and a dry trail. One brush pass, one rinse, out.",
  },
  {
    id: "mud",
    name: "Mud mode",
    duration: "4 – 5 min",
    water: "≈ 34 l",
    pressure: "55 bar",
    brushes: "Full set, two passes",
    blurb: "A wet-race bike. Soak first so the clay lets go, then brush, then rinse.",
  },
  {
    id: "deep",
    name: "Deep clean",
    duration: "5 – 6 min",
    water: "≈ 40 l",
    pressure: "55 bar",
    brushes: "Full set, three passes",
    blurb: "Drivetrain-focused. Slower brush speed, longer dwell, more rinse.",
  },
  {
    id: "ebike",
    name: "E-bike mode",
    duration: "3 – 4 min",
    water: "≈ 26 l",
    pressure: "25 bar",
    brushes: "Full set, reduced force",
    blurb: "Pressure capped and the jets angled away from the motor and battery seals.",
  },
];

export interface TechPillar {
  title: string;
  copy: string;
  spec: string;
}

export const TECH: TechPillar[] = [
  {
    title: "Rotating brush system",
    copy: "One horizontal brush over the top, two vertical brushes on the sides. Soft filament, not car-wash bristle, and the force is limited so a dropper post or a rear mech is never leaned on.",
    spec: "3 units · soft filament · force-limited",
  },
  {
    title: "High-pressure water",
    copy: "A twelve-nozzle ring aimed at the drivetrain and the underside, where a hand wash never quite reaches. Pressure is set per program rather than left at maximum.",
    spec: "12 nozzles · 25 – 55 bar",
  },
  {
    title: "Bike-safe by design",
    copy: "No jet is aimed straight at a bearing seal, a hub, or a motor housing. E-bike mode drops the pressure again and shifts the angles. It is the same reasoning a good mechanic uses with a hose.",
    spec: "Sealed-bearing aware · e-bike safe",
  },
  {
    title: "Automatic programs",
    copy: "Four programs cover most of what comes off a trail. The controller stores them; a shop can have a custom one written for a fleet.",
    spec: "4 programs · custom on request",
  },
];

export interface ShowcaseItem {
  title: string;
  copy: string;
}

export const SHOWCASE: ShowcaseItem[] = [
  { title: "Wet clay", copy: "The kind that dries to concrete in the boot of the car." },
  { title: "Tyres", copy: "Knobs packed solid, so the grip you paid for is gone." },
  { title: "Drivetrain", copy: "Grit in the chain wears a cassette out in a season." },
  { title: "Frame", copy: "Splatter that sets in the linkage and the shock stanchions." },
  { title: "Post-race", copy: "Two hundred bikes, all filthy, all at once, all now." },
];

export interface Review {
  quote: string;
  name: string;
  role: string;
  place: string;
}

export const REVIEWS: Review[] = [
  {
    quote:
      "We put one at the bottom of the lift. The queue for it is longer than the queue for the bar, and nobody hoses down the car park any more.",
    name: "Lena Bruckner",
    role: "Operations",
    place: "Bikepark Hochkar, AT",
  },
  {
    quote:
      "Race weekend, four hundred bikes. Two boxes ran from Friday to Sunday and my crew stopped losing evenings to a jet washer.",
    name: "Marco Sailer",
    role: "Event lead",
    place: "Alpine Enduro Series",
  },
  {
    quote:
      "The e-bike program is the reason we bought it. I was not letting a machine near customers' motors until I saw where the jets point.",
    name: "Priya Raman",
    role: "Workshop owner",
    place: "Two Spokes, Bristol",
  },
  {
    quote:
      "I ride wet six months a year. Three minutes in the box beats twenty in the garden with cold hands, every single time.",
    name: "Tomas Lindqvist",
    role: "Rider",
    place: "Åre, SE",
  },
  {
    quote:
      "Camp of twenty guests, every bike clean before dinner. It changed the shape of our evenings.",
    name: "Sofia Brenner",
    role: "Camp host",
    place: "Finale Ligure, IT",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: "Is it safe for e-bikes?",
    a: "Yes — that is what E-bike mode is for. It caps pressure at 25 bar and angles the jets away from the motor housing, battery rails and display contacts. Take the battery out if the manufacturer asks you to; the bay has a shelf for it.",
  },
  {
    q: "Does a downhill bike fit?",
    a: "Yes. The envelope is 215 × 92 × 135 cm, which takes a dual-crown downhill bike with the bars straight. Bars wider than 92 cm need turning in the clamp.",
  },
  {
    q: "How long does a wash take?",
    a: "Two to three minutes on Quick wash, four to five on Mud mode, five to six on Deep clean. Add roughly twenty seconds for the door either side.",
  },
  {
    q: "Can I rent one for a festival?",
    a: "Yes. Rental covers delivery, water and power hookup, an operator, and collection. Use the calculator for an indicative figure, then send the request — a real quote comes back inside a day.",
  },
  {
    q: "How much water does it use?",
    a: "Between 18 and 40 litres per cycle depending on the program, which is roughly what a garden hose uses in three minutes. With the reclaim module fitted, an estimated 80 % of that is filtered and reused.",
  },
  {
    q: "Is installation included?",
    a: "It depends on what you choose. Self-install ships on a pallet with the manual. Guided install puts an engineer on a video call with your fitter. On-site install is us, on your floor, handing over a running machine.",
  },
  {
    q: "Can it stand outdoors?",
    a: "The PARK configuration can: outdoor-rated cabinet, frost protection to −15 °C, and a status beacon so the queue knows when it is free. CORE and PRO want a roof over them.",
  },
  {
    q: "Can we get a custom program?",
    a: "Yes, on PRO and PARK. Tell us the fleet and the dirt, and a program gets written and loaded. It shows up as a fifth button on the panel.",
  },
];

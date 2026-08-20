import { COMPATIBILITY } from "@/lib/bikes";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { DemoNote, Section, SectionMarker, SpecRow } from "@/components/ui/Primitives";

const GROUPS: { title: string; rows: [string, string][] }[] = [
  {
    title: "Dimensions",
    rows: [
      ["External (W × D × H)", "260 × 145 × 235 cm"],
      ["Bay opening", "230 × 195 cm"],
      ["Footprint incl. clearance", "3.4 m²"],
      ["Weight, empty", "610 kg"],
      ["Shipping", "1 pallet, tail-lift or forklift"],
    ],
  },
  {
    title: "Capacity",
    rows: [
      ["Per cycle", "1 bike"],
      ["Cycle time", "2 – 6 min by program"],
      ["Throughput, sustained", "≈ 12 bikes / hour"],
      ["Duty cycle", "Continuous"],
      ["Bikes between services", "≈ 4,000"],
    ],
  },
  {
    title: "Compatibility",
    rows: [
      ["Max bike length", COMPATIBILITY.maxLength],
      ["Max handlebar width", COMPATIBILITY.maxWidth],
      ["Max bike height", COMPATIBILITY.maxHeight],
      ["Max bike weight", COMPATIBILITY.maxWeight],
      ["Wheels", COMPATIBILITY.wheelSizes],
    ],
  },
  {
    title: "Cleaning",
    rows: [
      ["Brushes", "1 horizontal, 2 vertical, soft filament"],
      ["Nozzles", "12-nozzle ring + 8 side jets"],
      ["Pressure range", "25 – 55 bar, per program"],
      ["Programs", "4 stored, custom on PRO / PARK"],
      ["Detergent", "Optional, biodegradable, dosed"],
    ],
  },
  {
    title: "Power & water",
    rows: [
      ["Supply", "400 V / 16 A, 3-phase"],
      ["Standby draw", "35 W"],
      ["Peak draw", "4.2 kW"],
      ["Water connection", "¾″, 3 bar minimum"],
      ["Drain", "DN 50 or sump kit"],
    ],
  },
  {
    title: "Water saving",
    rows: [
      ["Per cycle, mains", "18 – 40 l"],
      ["With reclaim module", "≈ 80 % recirculated"],
      ["Filtration", "3-stage, grit + sediment + carbon"],
      ["Filter service", "≈ every 500 cycles"],
      ["Frost protection", "To −15 °C on PARK"],
    ],
  },
];

export function TechnicalSpecs() {
  return (
    <Section id="specs" tone="light">
      <SectionMarker number="06" label="Specifications" dark={false} />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal text="Technical specs" className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
        <Reveal>
          <p className="lede text-steel/60">
            The whole sheet, in one place, including the numbers that make the
            machine sound less impressive. Those are usually the useful ones.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group, i) => (
          <Reveal key={group.title} index={i % 3}>
            <h3 className="mono text-steel/40">{group.title}</h3>
            <div className="mt-3">
              {group.rows.map(([k, v]) => (
                <SpecRow key={k} label={k} value={v} light />
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <DemoNote className="mt-10 !text-steel/40">
        MUDROOM ONE is a design study. Every figure on this page is a concept
        value chosen to be plausible for equipment of this kind — none of it is
        measured, certified or contractual.
      </DemoNote>
    </Section>
  );
}

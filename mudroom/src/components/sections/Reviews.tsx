import { REVIEWS } from "@/lib/content";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoNote, Mono, Section, SectionMarker } from "@/components/ui/Primitives";

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 41, suffix: "", label: "Boxes in the field" },
  { value: 12482, suffix: "", label: "Bikes cleaned" },
  { value: 96, suffix: " %", label: "Would recommend" },
  { value: 24, suffix: " h", label: "Quote turnaround" },
];

export function Reviews() {
  return (
    <Section id="reviews" tone="dark" className="overflow-hidden">
      <SectionMarker number="09" label="Field reports" />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal
          text="Riders, shops, bike parks."
          className="h-section text-[clamp(2.1rem,5.6vw,4rem)]"
        />
        <Reveal>
          <p className="lede text-concrete/50">
            The people who have to deal with the mess every weekend, and what
            they say once the box has been there a month.
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[5px] border border-[var(--edge)] bg-[var(--edge)] sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-steel p-5 sm:p-6">
            <AnimatedNumber
              value={s.value}
              suffix={s.suffix}
              className="display tnum text-[clamp(1.6rem,3.4vw,2.4rem)] text-hivis"
            />
            <p className="mono mt-2 text-concrete/40">{s.label}</p>
          </div>
        ))}
      </Reveal>

      <div className="mt-10">
        <Marquee duration={64} className="relative left-1/2 w-screen -translate-x-1/2">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="mx-2 flex w-[300px] shrink-0 flex-col justify-between rounded-[5px] border border-[var(--edge)] bg-steel-2/50 p-6 sm:w-[380px]"
            >
              <blockquote className="text-[15px] leading-relaxed text-concrete/75">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-[var(--edge)] pt-4">
                <p className="text-sm font-semibold tracking-tight">{r.name}</p>
                <Mono className="mt-1 block text-concrete/35">
                  {r.role} · {r.place}
                </Mono>
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>

      <DemoNote className="mt-8">
        Concept site — the quotes and counters above are written for the demo,
        not collected from customers.
      </DemoNote>
    </Section>
  );
}

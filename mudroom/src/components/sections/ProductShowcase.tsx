"use client";

import { SHOWCASE } from "@/lib/content";
import { MessArt } from "@/components/product/MessArt";
import { WashScene } from "@/components/product/WashScene";
import { Reveal, RevealGroup, RevealItem, TextReveal } from "@/components/ui/Reveal";
import { Mono, Section, SectionMarker } from "@/components/ui/Primitives";

export function ProductShowcase() {
  return (
    <Section tone="darker">
      <SectionMarker number="05" label="Why" />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal text="Built for the mess." className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
        <Reveal>
          <p className="lede text-concrete/50">
            Not for a showroom bike with a light coating of dust. For the one
            that came off a wet trail in November with the drivetrain packed
            solid.
          </p>
        </Reveal>
      </div>

      <RevealGroup className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SHOWCASE.map((item, i) => (
          <RevealItem key={item.title}>
            <figure className="group h-full overflow-hidden rounded-[4px] border border-[var(--edge)] bg-steel-2">
              <div className="aspect-square overflow-hidden">
                <MessArt
                  index={i}
                  className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                />
              </div>
              <figcaption className="p-4">
                <Mono className="text-mud">{item.title}</Mono>
                <p className="mt-2 text-[13px] leading-relaxed text-concrete/45">{item.copy}</p>
              </figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* the answer */}
      <Reveal className="mt-16">
        <div className="grid items-center gap-10 rounded-[6px] border border-[var(--edge)] bg-steel p-6 sm:p-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <Mono className="text-hivis">And then there is the box</Mono>
            <h3 className="display mt-4 text-[clamp(1.8rem,3.6vw,2.8rem)]">
              Dirt belongs on the trail.
              <span className="block text-concrete/35">Not in your garage.</span>
            </h3>
            <p className="mt-5 max-w-[44ch] text-sm leading-relaxed text-concrete/50">
              One machine, bolted to a floor, that ends the argument about whose
              turn it is to hose the bikes down. It runs on a button and it
              finishes before you have taken your shoes off.
            </p>
          </div>
          <div className="rounded-[5px] border border-[var(--edge)] bg-[#0a0c0d] p-4">
            <WashScene progress={0.45} bikeId="mtb" />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

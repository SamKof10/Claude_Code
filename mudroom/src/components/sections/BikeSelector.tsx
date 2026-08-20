"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { BIKES, COMPATIBILITY, getBike, type BikeId } from "@/lib/bikes";
import { BikeArt } from "@/components/product/BikeArt";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, Section, SectionMarker, SpecRow } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

export function BikeSelector() {
  const [id, setId] = useState<BikeId>("enduro");
  const bike = getBike(id);

  return (
    <Section id="product" tone="dark">
      <SectionMarker number="01" label="Compatibility" />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal text="One box. Every bike." className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
        <Reveal>
          <p className="lede text-concrete/50">
            The bay is sized around the longest bike most people own, not around
            the shortest. Pick a discipline and see how it sits inside.
          </p>
        </Reveal>
      </div>

      {/* selector */}
      <Reveal className="mt-10">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {BIKES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setId(b.id)}
              aria-pressed={id === b.id}
              className={cn(
                "mono relative shrink-0 rounded-[3px] border px-4 py-3 transition-colors duration-200",
                id === b.id
                  ? "border-hivis text-hivis"
                  : "border-[var(--edge)] text-concrete/50 hover:border-[var(--edge-strong)] hover:text-concrete",
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* the bike, in the bay */}
        <Reveal className="relative">
          <div className="plate relative overflow-hidden rounded-[5px] border border-[var(--edge)]">
            {/* bay outline: the envelope the bike has to live in */}
            <div className="absolute inset-6 rounded-[3px] border border-dashed border-hivis/25" aria-hidden />
            <div className="absolute inset-x-6 bottom-6 h-px bg-hivis/40" aria-hidden />
            <Mono className="absolute left-7 top-8 text-hivis/50">Bay envelope</Mono>

            <motion.div
              key={bike.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="px-10 pb-6 pt-14 sm:px-14"
            >
              <BikeArt bikeId={bike.id} dirt={0} wet={false} />
            </motion.div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-concrete/45">{bike.blurb}</p>
        </Reveal>

        {/* specs */}
        <Reveal index={1}>
          <div className="flex items-center justify-between">
            <Mono className="text-concrete/45">Bike compatibility</Mono>
            <span className="mono inline-flex items-center gap-1.5 rounded-full border border-hivis/40 px-2.5 py-1 text-hivis">
              <Check className="h-3 w-3" strokeWidth={3} />
              Fits
            </span>
          </div>

          <div className="mt-4">
            <SpecRow label="Wheel size" value={bike.spec.wheelSize} />
            <SpecRow label="Bike length" value={bike.spec.length} />
            <SpecRow label="Handlebar width" value={bike.spec.barWidth} />
            <SpecRow label="Frame sizes" value={bike.spec.frameSizes} />
            <SpecRow label="Weight" value={bike.spec.weight} />
            <SpecRow
              label="E-bike compatible"
              value={
                <span className={bike.spec.ebike ? "text-hivis" : undefined}>
                  {bike.spec.ebike ? "Yes — motor and battery sealed" : "N/A"}
                </span>
              }
            />
          </div>

          <div className="mt-8 rounded-[4px] border border-[var(--edge)] bg-steel-2/50 p-5">
            <Mono className="text-concrete/40">The envelope</Mono>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ["Max length", COMPATIBILITY.maxLength],
                ["Max width", COMPATIBILITY.maxWidth],
                ["Max height", COMPATIBILITY.maxHeight],
                ["Max weight", COMPATIBILITY.maxWeight],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-concrete/40">{k}</dt>
                  <dd className="tnum font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-[var(--edge)] pt-3 text-xs text-concrete/40">
              Wheels {COMPATIBILITY.wheelSizes}.
            </p>
            <ul className="mt-3 space-y-1.5">
              {COMPATIBILITY.notes.map((note) => (
                <li key={note} className="flex gap-2 text-xs leading-relaxed text-concrete/35">
                  <span className="mt-[7px] h-px w-2.5 shrink-0 bg-concrete/25" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PROGRAMS, TECH } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem, TextReveal } from "@/components/ui/Reveal";
import { DemoNote, Mono, Section, SectionMarker } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

export function CleaningTech() {
  const [programId, setProgramId] = useState(PROGRAMS[1].id);
  const program = PROGRAMS.find((p) => p.id === programId) ?? PROGRAMS[0];

  return (
    <Section id="tech" tone="dark">
      <SectionMarker number="03" label="Technology" />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal text="Cleaning technology" className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
        <Reveal>
          <p className="lede text-concrete/50">
            Nothing here is magic. It is a brush set, a pressure ring and a
            controller that knows which of the two to trust for a given kind of
            dirt.
          </p>
        </Reveal>
      </div>

      <RevealGroup className="mt-12 grid gap-px overflow-hidden rounded-[5px] border border-[var(--edge)] bg-[var(--edge)] md:grid-cols-2">
        {TECH.map((pillar) => (
          <RevealItem key={pillar.title} className="bg-steel">
            <div className="h-full p-6 sm:p-8">
              <Mono className="text-hivis/70">{pillar.spec}</Mono>
              <h3 className="display mt-4 text-[22px]">{pillar.title}</h3>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-concrete/50">
                {pillar.copy}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* ── programs ─────────────────────────────────────────────────── */}
      <Reveal className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h3 className="display text-[26px]">Automatic programs</h3>
          <Mono className="text-concrete/35">Select to compare</Mono>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {PROGRAMS.map((p) => {
              const selected = p.id === program.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProgramId(p.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-[4px] border px-4 py-4 text-left transition-colors duration-200",
                    selected
                      ? "border-hivis bg-hivis/[0.06]"
                      : "border-[var(--edge)] bg-steel-2/40 hover:border-[var(--edge-strong)]",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        selected ? "bg-hivis" : "bg-concrete/20",
                      )}
                    />
                    <span className="text-sm font-semibold tracking-tight">{p.name}</span>
                  </span>
                  <span className="tnum mono text-concrete/45">{p.duration}</span>
                </button>
              );
            })}
          </div>

          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="anim-edge rounded-[5px] border border-[var(--edge)] bg-steel-2/50 p-6 sm:p-8"
          >
            <Mono className="text-hivis">Program · {program.name}</Mono>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-concrete/65">
              {program.blurb}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                ["Cycle time", program.duration],
                ["Water per cycle", program.water],
                ["Peak pressure", program.pressure],
                ["Brushes", program.brushes],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="mono text-concrete/35">{k}</dt>
                  <dd className="tnum mt-1 text-lg font-semibold tracking-tight">{v}</dd>
                </div>
              ))}
            </dl>
            <DemoNote className="mt-6">
              Concept figures for a prototype machine — not certified performance data.
            </DemoNote>
          </motion.div>
        </div>
      </Reveal>
    </Section>
  );
}

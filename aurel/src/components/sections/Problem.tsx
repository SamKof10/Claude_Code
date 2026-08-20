"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { useT } from "@/lib/i18n";

const EVIDENCE = [
  { value: 6500, suffix: " K" },
  { value: 83, suffix: " %" },
  { value: 38, prefix: "+", suffix: " min" },
];

export function Problem() {
  const t = useT();

  return (
    <section
      data-nav-theme="dark"
      className="grain relative overflow-hidden bg-night py-24 text-paper sm:py-32"
    >
      {/* a cold ceiling light, bleeding in from above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(52% 100% at 50% 0%, rgba(185,213,245,0.20), transparent 70%)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="01" label={t.problem.kicker} night />
        </Reveal>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <TextReveal
            as="h2"
            text={t.problem.title}
            className="h-section max-w-[16ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />

          <div className="lg:pt-3">
            <Reveal index={1}>
              <p className="text-[16px] leading-relaxed text-paper/70 sm:text-[17px]">
{t.problem.body1}
              </p>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-5 text-[16px] leading-relaxed text-paper/70 sm:text-[17px]">
{t.problem.body2}
              </p>
            </Reveal>
          </div>
        </div>

        {/* evidence */}
        <div className="mt-16 grid gap-px sm:mt-20 sm:grid-cols-3" style={{ background: "var(--line-night)" }}>
          {EVIDENCE.map((item, i) => {
            const copy = t.problem.evidence[i];
            return (
            <motion.div
              key={copy.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="bg-night px-1 py-8 sm:px-7"
            >
              <div className="text-[clamp(2.4rem,1.6rem+2.6vw,3.4rem)] leading-none font-medium tracking-[-0.04em] tabular-nums">
                <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix} />
              </div>
              <p className="mt-3 text-[15px] font-medium">{copy.label}</p>
              <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-paper/50">
{copy.note}
              </p>
            </motion.div>
            );
          })}
        </div>

        <Reveal>
          <Mono className="mt-10 block text-paper/35">
{t.problem.source}
          </Mono>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, Section, SectionMarker } from "@/components/ui/Primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    n: "01",
    title: "Ride in",
    copy: "Roll the bike in and put it on the rail. No stand, no straps, no taking the wheels out.",
    meta: "≈ 10 seconds",
  },
  {
    n: "02",
    title: "Close",
    copy: "The shutter comes down on a light curtain. If anything is still in the doorway, it does not move.",
    meta: "≈ 6 seconds",
  },
  {
    n: "03",
    title: "One click",
    copy: "Pick a program, press the button. Brushes close in, the ring runs, the water finds the drivetrain.",
    meta: "2 – 5 minutes",
  },
  {
    n: "04",
    title: "Ride out",
    copy: "The shutter lifts, the run-off goes to the filter, the bay is ready for the next bike.",
    meta: "≈ 10 seconds",
  },
];

/* Each step gets its own loop. They are deliberately small and cheap —
   four copies of the hero scene running at once would cost more than the
   whole rest of the page. */
function StepArt({ index }: { index: number }) {
  const shell = (
    <>
      <rect x="6" y="14" width="108" height="58" rx="3" fill="#151a1d" stroke="#2a3134" strokeWidth="1.5" />
      <rect x="2" y="8" width="116" height="8" rx="2" fill="#333c41" />
      <rect x="6" y="72" width="108" height="3" fill="#c8f249" opacity="0.65" />
    </>
  );

  return (
    <svg viewBox="0 0 120 84" className="h-20 w-full" aria-hidden>
      {shell}

      {index === 0 ? (
        <motion.g
          initial={{ x: -46, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, margin: "-20%" }}
          transition={{ duration: 1.1, ease: EASE, repeat: Infinity, repeatDelay: 0.7 }}
        >
          <MiniBike />
        </motion.g>
      ) : null}

      {index === 1 ? (
        <>
          <MiniBike />
          <motion.rect
            x="6"
            y="14"
            width="108"
            fill="#252c30"
            initial={{ height: 4 }}
            whileInView={{ height: 58 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 1, ease: EASE, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
          />
        </>
      ) : null}

      {index === 2 ? (
        <>
          <MiniBike />
          {[26, 44, 62, 80, 96].map((x, k) => (
            <motion.line
              key={x}
              x1={x}
              y1="20"
              x2={x}
              y2="66"
              stroke="#7fd4e8"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 0.55, 0] }}
              viewport={{ once: false, margin: "-20%" }}
              transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.12 }}
            />
          ))}
          <motion.circle
            cx="106"
            cy="60"
            r="5"
            fill="#c8f249"
            initial={{ scale: 1 }}
            whileInView={{ scale: [1, 0.82, 1] }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </>
      ) : null}

      {index === 3 ? (
        <motion.g
          initial={{ x: 0, opacity: 1 }}
          whileInView={{ x: 52, opacity: [1, 1, 0] }}
          viewport={{ once: false, margin: "-20%" }}
          transition={{ duration: 1.2, ease: EASE, repeat: Infinity, repeatDelay: 0.6 }}
        >
          <MiniBike clean />
        </motion.g>
      ) : null}
    </svg>
  );
}

function MiniBike({ clean = false }: { clean?: boolean }) {
  const stroke = clean ? "#c9ccc3" : "#6d757a";
  return (
    <g stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round">
      <circle cx="42" cy="58" r="11" />
      <circle cx="78" cy="58" r="11" />
      <path d="M42 58 L56 40 L72 40 L78 58 M56 40 L62 58 L78 58 M62 58 L52 44" />
      <path d="M70 36 L74 36" />
    </g>
  );
}

export function HowItWorks() {
  return (
    <Section id="how" tone="light">
      <SectionMarker number="02" label="Operation" dark={false} />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal text="How it works" className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
        <Reveal>
          <p className="lede text-steel/60">
            Four steps. Three of them are the bike moving. The machine handles
            exactly one thing, and it handles it the same way every time.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[5px] border border-[var(--edge-light)] bg-[var(--edge-light)] sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} index={i} className="bg-concrete">
            <div className="group flex h-full flex-col p-6">
              <div className="flex items-baseline justify-between">
                <span className="display tnum text-[42px] leading-none text-steel/12">{step.n}</span>
                <Mono className="text-steel/40">{step.meta}</Mono>
              </div>

              <div className="mt-6 rounded-[3px] bg-steel/95 p-3">
                <StepArt index={i} />
              </div>

              <h3 className="display mt-6 text-2xl text-steel">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel/55">{step.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

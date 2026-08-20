"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { chartKelvinCss } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

/** Points along the day, as the ARC actually schedules them. */
const STOPS = [
  { t: 0.0, clock: "06:00", k: 2000 },
  { t: 0.28, clock: "10:45", k: 5200 },
  { t: 0.52, clock: "14:50", k: 6500 },
  { t: 0.76, clock: "18:55", k: 3400 },
  { t: 1.0, clock: "23:00", k: 1800 },
];

/** The curve the marker rides — a shallow arc across the section. */
function arcPoint(t: number) {
  const x = 60 + t * 880;
  const y = 150 - Math.sin(Math.PI * Math.pow(t, 0.92)) * 96;
  return { x, y };
}

export function Solution() {
  const { t, locale } = useI18n();
  const localeTag = locale === "de" ? "de-DE" : "en-GB";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // Complete the draw by the time the chart reaches the middle of the
    // viewport — otherwise the later stops sit there labelled but unconnected.
    offset: ["start 0.95", "center 0.62"],
  });

  const dashOffset = useTransform(scrollYProgress, [0, 1], [1200, 0]);
  const markerT = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const markerX = useTransform(markerT, (t) => arcPoint(t).x);
  const markerY = useTransform(markerT, (t) => arcPoint(t).y);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="02" label={t.solution.kicker} />
        </Reveal>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <TextReveal
            as="h2"
            text={t.solution.title}
            className="h-section max-w-[17ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <div className="lg:pt-3">
            <Reveal index={1}>
              <p className="lede">
{t.solution.lede}
              </p>
            </Reveal>
          </div>
        </div>

        {/* ── the day, drawn ─────────────────────────────────────────── */}
        <div ref={ref} className="mt-16 sm:mt-20">
          <div
            className="relative overflow-hidden rounded-2xl border px-2 py-8 sm:px-6 sm:py-10"
            style={{ borderColor: "var(--line)", background: "var(--color-paper-2)" }}
          >
            <svg viewBox="0 0 1000 200" className="w-full" role="img" aria-label={t.solution.chartAlt}>
              <defs>
                <linearGradient id="sol-arc" x1="0" y1="0" x2="1" y2="0">
                  {STOPS.map((s) => (
                    <stop key={s.clock} offset={`${s.t * 100}%`} stopColor={chartKelvinCss(s.k)} />
                  ))}
                </linearGradient>
                <filter id="sol-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
              </defs>

              {/* baseline */}
              <line x1="60" y1="168" x2="940" y2="168" stroke="var(--line)" strokeWidth="1" />

              {/* the curve */}
              <motion.path
                d={`M ${Array.from({ length: 61 }, (_, i) => {
                  const p = arcPoint(i / 60);
                  return `${i === 0 ? "" : "L "}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
                }).join(" ")}`}
                fill="none"
                stroke="url(#sol-arc)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1200"
                style={{ strokeDashoffset: dashOffset }}
              />

              {/* stops */}
              {STOPS.map((s) => {
                const p = arcPoint(s.t);
                return (
                  <g key={s.clock}>
                    <line
                      x1={p.x}
                      y1={p.y + 8}
                      x2={p.x}
                      y2="162"
                      stroke="var(--line-strong)"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />
                    <circle cx={p.x} cy={p.y} r="4.5" fill={chartKelvinCss(s.k)} />
                    <circle cx={p.x} cy={p.y} r="4.5" fill="none" stroke="var(--color-paper)" strokeWidth="1.5" />
                    <text
                      x={p.x}
                      y="186"
                      textAnchor="middle"
                      className="fill-ink-3 font-mono"
                      style={{ fontSize: 11, letterSpacing: "0.08em" }}
                    >
                      {s.clock}
                    </text>
                    <text
                      x={p.x}
                      y={p.y - 16}
                      textAnchor="middle"
                      className="fill-ink-2"
                      style={{ fontSize: 12 }}
                    >
                      {s.k.toLocaleString(localeTag)} K
                    </text>
                  </g>
                );
              })}

              {/* The marker rides the curve as the section scrolls. Both the
                  draw and this marker are scroll-linked rather than
                  autonomous, and are rendered identically on server and
                  client so hydration stays intact. */}
              <motion.g style={{ x: markerX, y: markerY }}>
                <circle r="16" fill="var(--color-ember)" opacity="0.28" filter="url(#sol-glow)" />
                <circle r="6" fill="var(--color-ember)" />
                <circle r="6" fill="none" stroke="var(--color-paper)" strokeWidth="2" />
              </motion.g>
            </svg>

            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 px-4">
              {t.solution.stops.map((label) => (
                <Mono key={label} className="text-ink-3">
                  {label}
                </Mono>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

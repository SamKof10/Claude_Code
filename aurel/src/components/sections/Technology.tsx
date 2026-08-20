"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Cpu, Radio, Sun, Thermometer } from "lucide-react";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, PixelGrid, SectionKicker, StatusDot } from "@/components/ui/Primitives";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatDecimal, kelvinToCss, wavelengthToCss } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { DecryptedLabel } from "@/components/ui/reactbits";

const PILLARS = [
  {
    icon: Sun,
  },
  {
    icon: Cpu,
  },
  {
    icon: Thermometer,
  },
  {
    icon: Radio,
  },
];

/** Values that drift a little, so the panel reads as live instrumentation. */
function useTelemetry(enabled: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, [enabled]);

  const wobble = (base: number, amp: number, phase: number) =>
    base + Math.sin((tick + phase) * 1.7) * amp;

  return {
    kelvin: Math.round(wobble(3380, 60, 0) / 20) * 20,
    lux: Math.round(wobble(812, 24, 2)),
    duty: formatDecimal(wobble(62.4, 2.2, 4)),
    thermal: formatDecimal(wobble(41.2, 1.1, 6)),
  };
}

export function Technology() {
  const reduce = useReducedMotion();
  const tel = useTelemetry(!reduce);
  const t = useT();

  return (
    <section
      id="technologie"
      data-nav-theme="dark"
      className="grain relative scroll-mt-20 overflow-hidden bg-night py-24 text-paper sm:py-32"
    >
      <PixelGrid night className="absolute inset-0 opacity-[0.35]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh]"
        style={{
          background: "radial-gradient(56% 100% at 50% 100%, rgba(232,163,61,0.14), transparent 72%)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="06" label={t.technology.kicker} night />
        </Reveal>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.technology.title}
            className="h-section max-w-[15ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <Reveal index={1}>
            <p className="text-[16px] leading-relaxed text-paper/65">
{t.technology.lede}
            </p>
          </Reveal>
        </div>

        {/* ── instrumentation panel ──────────────────────────────────── */}
        <Reveal>
          <div
            className="crt mt-14 overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--line-night-strong)", background: "#0f0f11" }}
          >
            <div
              className="flex items-center justify-between gap-4 border-b px-5 py-3.5"
              style={{ borderColor: "var(--line-night)" }}
            >
              <div className="flex items-center gap-2.5">
                <StatusDot />
                <Mono className="text-paper/70"><DecryptedLabel text={t.technology.status} /></Mono>
              </div>
              <Mono className="text-paper/35">{t.technology.firmware}</Mono>
            </div>

            <div
              className="grid gap-px sm:grid-cols-2 lg:grid-cols-4"
              style={{ background: "var(--line-night)" }}
            >
              {[
                { label: t.technology.readouts.colourTemp, value: tel.kelvin.toLocaleString("de-DE"), unit: "K", lit: true },
                { label: t.technology.readouts.illuminance, value: String(tel.lux), unit: "lx" },
                { label: t.technology.readouts.duty, value: tel.duty, unit: "%" },
                { label: t.technology.readouts.heatsink, value: tel.thermal, unit: "°C" },
              ].map((row) => (
                <div key={row.label} className="bg-[#0f0f11] px-5 py-6">
                  <Mono className="text-paper/40">{row.label}</Mono>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span
                      className="font-mono text-[26px] leading-none tabular-nums transition-colors duration-700"
                      style={{ color: row.lit ? kelvinToCss(tel.kelvin, 0.35) : undefined }}
                    >
                      {row.value}
                    </span>
                    <span className="font-mono text-[13px] text-paper/45">{row.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* spectral power distribution */}
            <div className="border-t px-5 py-6 sm:px-7" style={{ borderColor: "var(--line-night)" }}>
              <div className="flex items-baseline justify-between">
                <Mono className="text-paper/40">{fmt(t.technology.spd, { kelvin: tel.kelvin.toLocaleString("de-DE") })}</Mono>
                <Mono className="text-ember">{t.technology.cri}</Mono>
              </div>
              <div className="mt-4 flex h-[92px] items-end gap-[2px]">
                {Array.from({ length: 64 }).map((_, i) => {
                  // a plausible 5-channel SPD: two white humps, amber lift, red tail
                  const nm = 380 + (i / 63) * 350;
                  const g = (c: number, w: number, a: number) =>
                    a * Math.exp(-Math.pow(nm - c, 2) / (2 * w * w));
                  const h =
                    g(452, 16, 0.62) + g(545, 62, 0.86) + g(600, 34, 0.72) + g(658, 26, 0.44) + 0.05;
                  return (
                    <motion.span
                      key={i}
                      className="flex-1 rounded-t-[1px]"
                      style={{
                        background: wavelengthToCss(nm, 0.44),
                        opacity: 0.82,
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.min(100, h * 88)}%` }}
                      viewport={{ once: true, margin: "-15% 0px" }}
                      transition={{ duration: 0.7, delay: i * 0.008, ease: [0.22, 1, 0.36, 1] }}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between">
                <Mono className="text-paper/30">380 nm</Mono>
                <Mono className="text-paper/30">550 nm</Mono>
                <Mono className="text-paper/30">730 nm</Mono>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── pillars ────────────────────────────────────────────────── */}
        <div className="mt-5 grid gap-px sm:grid-cols-2" style={{ background: "var(--line-night)" }}>
          {PILLARS.map((p, i) => {
            const copy = t.technology.pillars[i];
            const Icon = p.icon;
            return (
              <motion.div
                key={copy.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="bg-night p-7 sm:p-9"
              >
                <Icon size={19} strokeWidth={1.5} className="text-ember" />
                <h3 className="mt-4 text-[17px] font-medium tracking-[-0.02em]">{copy.title}</h3>
                <p className="mt-2.5 max-w-[42ch] text-[14.5px] leading-relaxed text-paper/60">
{copy.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* manufacturing */}
        <Reveal>
          <div
            className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t pt-8"
            style={{ borderColor: "var(--line-night)" }}
          >
            {[50000, 5, 10, 97].map((value, i) => {
              const s = t.technology.stats[i];
              return (
              <div key={s.label}>
                <div className="text-[26px] leading-none font-medium tracking-[-0.03em] tabular-nums">
                  <AnimatedNumber value={value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <Mono className="mt-2 block text-paper/45">{s.label}</Mono>
              </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

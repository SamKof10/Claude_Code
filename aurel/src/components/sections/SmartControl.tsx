"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bluetooth, Minus, Plus, Power } from "lucide-react";
import { PhoneMock } from "@/components/product/PhoneMock";
import { ArcLamp } from "@/components/product/ArcLamp";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker, StatusDot } from "@/components/ui/Primitives";
import { kelvinToCss } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { cn } from "@/components/ui/cn";

/** The moment the preview is frozen at, so the setting has something to act on. */
const REFERENCE_MIN = 20 * 60 + 30; // 20:30
const MIN_EVENING = 17 * 60;
const MAX_EVENING = 23 * 60;
const STEP = 15;
const RAMP = 90; // the ARC eases across, it does not switch

const DAY_K = 5000;
const EVENING_K = 1900;

function clock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SmartControl() {
  const [on, setOn] = useState(true);
  const [eveningAt, setEveningAt] = useState(20 * 60);
  const reduce = useReducedMotion();
  const t = useT();

  // How far into the evening ramp the reference moment already is.
  const progress = Math.min(1, Math.max(0, (REFERENCE_MIN - eveningAt) / RAMP));
  const kelvin = Math.round((DAY_K + (EVENING_K - DAY_K) * progress) / 20) * 20;
  const intensity = on ? 1 - 0.28 * progress : 0;
  const glow = kelvinToCss(kelvin);

  const shift = (delta: number) =>
    setEveningAt((v) => Math.min(MAX_EVENING, Math.max(MIN_EVENING, v + delta)));

  const state = !on
    ? t.smart.states.off
    : progress >= 1
      ? t.smart.states.evening
      : progress > 0
        ? t.smart.states.shifting
        : t.smart.states.daylight;

  return (
    <section
      id="steuerung"
      data-nav-theme="dark"
      className="grain relative scroll-mt-20 overflow-hidden bg-night py-24 text-paper sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(46% 40% at 26% 46%, color-mix(in srgb, ${glow} ${
            on ? 20 : 4
          }%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="05" label={t.smart.kicker} night />
        </Reveal>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.smart.title}
            className="h-section max-w-[15ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <Reveal index={1}>
            <p className="text-[16px] leading-relaxed text-paper/65">
{t.smart.lede}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          {/* ── the phone ─────────────────────────────────────────────── */}
          <Reveal>
            <PhoneMock>
              <div className="flex h-full flex-col px-6 pt-7 pb-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-paper/70">{clock(REFERENCE_MIN)}</span>
                  <Bluetooth size={13} strokeWidth={2} className="text-paper/50" />
                </div>

                <div className="mt-7 flex items-center gap-2">
                  <StatusDot />
                  <Mono className="text-paper/50">{t.smart.room}</Mono>
                </div>
                <p className="mt-2 text-[19px] font-medium tracking-[-0.02em] text-paper">
                  AUREL ARC
                </p>

                {/* power */}
                <button
                  type="button"
                  onClick={() => setOn((v) => !v)}
                  aria-pressed={on}
                  className="group mt-8 flex flex-col items-center"
                >
                  <span
                    className="grid h-[104px] w-[104px] place-items-center rounded-full transition-all duration-500"
                    style={{
                      background: on
                        ? `radial-gradient(circle at 50% 42%, color-mix(in srgb, ${glow} 78%, transparent), color-mix(in srgb, ${glow} 22%, transparent) 62%, transparent 74%)`
                        : "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.06), transparent 70%)",
                      boxShadow: on
                        ? `0 0 44px -6px color-mix(in srgb, ${glow} 55%, transparent)`
                        : "none",
                    }}
                  >
                    <span
                      className="grid h-[62px] w-[62px] place-items-center rounded-full border transition-colors duration-500"
                      style={{
                        borderColor: on
                          ? `color-mix(in srgb, ${glow} 70%, transparent)`
                          : "rgba(246,244,240,0.22)",
                        background: on ? "rgba(11,11,12,0.35)" : "transparent",
                      }}
                    >
                      <Power
                        size={22}
                        strokeWidth={1.75}
                        style={{ color: on ? glow : "rgba(246,244,240,0.45)" }}
                      />
                    </span>
                  </span>
                  <span className="mt-4 text-[14px] text-paper/80">{on ? t.smart.on : t.smart.off}</span>
                  <Mono className="mt-1 text-paper/40">
                    {on ? `${kelvin.toLocaleString("de-DE")} K · ${state}` : t.smart.tapToTurnOn}
                  </Mono>
                </button>

                {/* evening switch-over */}
                <div
                  className="mt-auto rounded-2xl border p-4"
                  style={{ borderColor: "var(--line-night)", background: "rgba(255,255,255,0.03)" }}
                >
                  <Mono className="text-paper/45">{t.smart.eveningFrom}</Mono>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => shift(-STEP)}
                      disabled={eveningAt <= MIN_EVENING}
                      aria-label={t.smart.earlier}
                      className="grid h-11 w-11 place-items-center rounded-full border transition-colors duration-200 hover:bg-white/10 disabled:opacity-30"
                      style={{ borderColor: "var(--line-night-strong)" }}
                    >
                      <Minus size={14} strokeWidth={2} />
                    </button>
                    <span className="font-mono text-[26px] tracking-tight tabular-nums">
                      {clock(eveningAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => shift(STEP)}
                      disabled={eveningAt >= MAX_EVENING}
                      aria-label={t.smart.later}
                      className="grid h-11 w-11 place-items-center rounded-full border transition-colors duration-200 hover:bg-white/10 disabled:opacity-30"
                      style={{ borderColor: "var(--line-night-strong)" }}
                    >
                      <Plus size={14} strokeWidth={2} />
                    </button>
                  </div>

                  {/* the day, with the switch-over marked */}
                  <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${((eveningAt - MIN_EVENING) / (MAX_EVENING - MIN_EVENING)) * 100}%`,
                        background: `linear-gradient(to right, ${kelvinToCss(5200, 0.2)}, ${kelvinToCss(
                          2600,
                          0.1,
                        )})`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between">
                    <Mono className="text-paper/30">17:00</Mono>
                    <Mono className="text-paper/30">23:00</Mono>
                  </div>
                </div>
              </div>
            </PhoneMock>
          </Reveal>

          {/* ── what it does to the lamp ──────────────────────────────── */}
          <div>
            <Reveal index={1}>
              <div
                className="relative overflow-hidden rounded-2xl border"
                style={{ borderColor: "var(--line-night)", background: "#111113" }}
              >
                <div className="px-6 pt-8 pb-4 sm:px-10">
                  <motion.div
                    animate={{ opacity: on ? 1 : 0.5 }}
                    transition={{ duration: reduce ? 0 : 0.5 }}
                  >
                    <ArcLamp
                      finishId="graphite"
                      modelId="arc-max"
                      kelvin={kelvin}
                      intensity={intensity}
                      className="w-full"
                    />
                  </motion.div>
                </div>
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 sm:px-10"
                  style={{ borderColor: "var(--line-night)" }}
                >
                  <Mono className="text-paper/45">
{fmt(t.smart.deskAt, { clock: clock(REFERENCE_MIN) })}
                  </Mono>
                  <Mono
                    className={cn("transition-colors duration-500")}
                    style={{ color: on ? glow : "rgba(246,244,240,0.4)" }}
                  >
                    {on ? `${kelvin.toLocaleString("de-DE")} K · ${state}` : t.smart.switchedOff}
                  </Mono>
                </div>
              </div>
            </Reveal>

            <Reveal index={2}>
              <dl className="mt-8 grid gap-px sm:grid-cols-3" style={{ background: "var(--line-night)" }}>
                {t.smart.points.map((item) => (
                  <div key={item.t} className="bg-night py-5 sm:px-5">
                    <dt className="text-[14.5px] font-medium">{item.t}</dt>
                    <dd className="mt-1.5 text-[13px] leading-relaxed text-paper/55">{item.d}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 max-w-[52ch] text-[14px] leading-relaxed text-paper/50">
{t.smart.tryIt}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

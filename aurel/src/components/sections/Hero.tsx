"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ArcLamp } from "@/components/product/ArcLamp";
import { Badge, Mono, StatusDot } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { dayProgressToClock, dayProgressToKelvin, kelvinToCss } from "@/lib/format";
import { useHasPointer, usePointerParallax } from "@/hooks";
import { fmt, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { MODELS } from "@/lib/products";
import { ShinyLabel } from "@/components/ui/reactbits";

/** Where we are in the 06:00–23:00 waking window, right now. */
function currentDayProgress(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.min(1, Math.max(0, (minutes - 6 * 60) / (17 * 60)));
}

const FLOATER_SPOTS = [
  { side: "left" as const, top: "12%", depth: 26 },
  { side: "right" as const, top: "6%", depth: 38 },
  { side: "right" as const, top: "50%", depth: 30 },
  { side: "left" as const, top: "56%", depth: 20 },
];

export function Hero() {
  const [progress, setProgress] = useState(0.42);
  const [touched, setTouched] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { t, locale } = useI18n();
  const localeTag = locale === "de" ? "de-DE" : "en-GB";
  const cheapest = Math.min(...MODELS.map((m) => m.priceCents));
  const hasPointer = useHasPointer();
  const { ref: parallaxRef, offset } = usePointerParallax<HTMLDivElement>(hasPointer && !reduce);

  // Start from the real clock, so the lamp is doing now what it would do now.
  // This has to happen after mount: rendering the client's local time on the
  // server would mismatch during hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setProgress(currentDayProgress()), []);

  const kelvin = dayProgressToKelvin(progress);
  const clock = dayProgressToClock(progress);
  const glow = kelvinToCss(kelvin);
  const glowSoft = kelvinToCss(kelvin, 0.55);
  const intensity = 0.62 + 0.38 * Math.sin(Math.PI * Math.pow(progress, 0.92));

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 96]);
  const lampY = useSpring(rawY, { stiffness: 140, damping: 28, mass: 0.6 });
  const lampScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const lampFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  const px = reduce ? 0 : offset.x;
  const py = reduce ? 0 : offset.y;

  return (
    <section
      ref={sectionRef}
      className="grain relative overflow-hidden pt-24 pb-14 sm:pt-28 sm:pb-16"
      style={
        {
          "--k-glow": glow,
          "--k-glow-soft": glowSoft,
        } as React.CSSProperties
      }
    >
      {/* ambient wash — one element, colour driven by the scrubber */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[78vh] transition-[background] duration-700 ease-out"
        style={{
          background: `radial-gradient(60% 46% at 50% 34%, color-mix(in srgb, ${glow} 22%, transparent), transparent 72%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--line)" }}
      />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* ── copy ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[54rem] text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge animated className="overflow-hidden">
              <StatusDot />
<ShinyLabel text={t.hero.badge} />
              <ArrowRight size={12} strokeWidth={2} className="text-ink-3" />
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="display mt-6 text-[clamp(2.5rem,1.5rem+4.5vw,4.6rem)]"
          >
{t.hero.headline[0]}
            <br />
            {t.hero.headline[1]}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="lede mx-auto mt-5 max-w-[50ch]"
          >
{t.hero.lede}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <ButtonLink href="/produkt" size="lg" magnetic shimmer className="w-full sm:w-auto">
              {fmt(t.nav.buyFrom, { price: formatPrice(cheapest) })}
            </ButtonLink>
            <ButtonLink href="#produkt" variant="secondary" size="lg" className="w-full sm:w-auto">
              {t.hero.ctaSecondary}
              <ArrowDown size={15} strokeWidth={1.75} />
            </ButtonLink>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1"
          >
{t.common.trust.map((item, i) => (
              <span key={item} className="flex items-center gap-2.5">
                {i > 0 ? <span className="text-ink-3/50">·</span> : null}
                <span className="mono-label text-ink-3">{item}</span>
              </span>
            ))}
          </motion.p>
        </div>

        {/* ── product ──────────────────────────────────────────────── */}
        <motion.div
          ref={parallaxRef}
          style={{ y: lampY, scale: lampScale, opacity: lampFade }}
          className="relative mx-auto mt-2 max-w-[1000px] sm:mt-3"
        >
          {/* floating technical chips */}
          {FLOATER_SPOTS.map((f, i) => {
            const copy = t.hero.floaters[i];
            return (
            <motion.div
              key={copy.label}
              aria-hidden
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute hidden lg:block"
              style={{
                [f.side]: 0,
                top: f.top,
                transform: `translate3d(${px * f.depth}px, ${py * f.depth}px, 0)`,
                transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div
                className="glass rounded-xl border px-3.5 py-2.5 shadow-[0_8px_28px_-16px_rgba(19,18,17,0.5)]"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="text-[14px] leading-none font-medium tabular-nums">{copy.label}</div>
                <Mono className="mt-1.5 block text-ink-3">{copy.sub}</Mono>
              </div>
            </motion.div>
            );
          })}

          {/* the desk: without a surface, light on paper-white reads as nothing */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[2%] bottom-[14%] h-[26%] blur-[70px]"
            style={{
              background:
                "radial-gradient(46% 52% at 50% 60%, color-mix(in srgb, var(--color-ink) 8%, transparent), transparent 74%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{
              transform: `translate3d(${px * -14}px, ${py * -10}px, 0)`,
              transition: "transform 520ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <ArcLamp
              finishId="graphite"
              modelId="arc-max"
              kelvin={kelvin}
              intensity={intensity}
              className="mx-auto w-full max-w-[680px]"
              title={t.hero.lampAlt}
            />
          </motion.div>

          {/* ── the scrubber ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-1 max-w-[520px] px-2"
          >
            <div className="mb-3 flex items-end justify-between">
              <div>
                <Mono className="text-ink-3">{t.hero.timeOfDay}</Mono>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-[20px] leading-none tabular-nums">{clock}</span>
                  {!touched ? (
                    <span className="mono-label text-ember-deep">{t.hero.now}</span>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <Mono className="text-ink-3">{t.hero.colourTemp}</Mono>
                <div className="mt-1 font-mono text-[20px] leading-none tabular-nums">
                  {kelvin.toLocaleString(localeTag)} K
                </div>
              </div>
            </div>

            <div className="relative">
              {/* the track is the spectrum the lamp can actually render */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${kelvinToCss(1800, 0.15)}, ${kelvinToCss(
                    3400,
                    0.2,
                  )}, ${kelvinToCss(6500, 0.25)})`,
                }}
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(progress * 1000)}
                onChange={(e) => {
                  setProgress(Number(e.target.value) / 1000);
                  setTouched(true);
                }}
                aria-label={t.hero.scrubAria}
                aria-valuetext={fmt(t.hero.scrubValue, { clock, kelvin })}
                className="scrub relative z-[2] h-7 w-full"
              />
            </div>

            <div className="mt-2 flex justify-between">
              <Mono className="text-ink-3">{t.hero.sunrise}</Mono>
              <Mono className="text-ink-3">{t.hero.bedtime}</Mono>
            </div>
            <p className="mt-4 text-center text-[13px] text-ink-2">
{t.hero.scrubHint}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

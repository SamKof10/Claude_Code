"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { WashScene, stageOf } from "@/components/product/WashScene";
import { ButtonLink } from "@/components/ui/Button";
import { Mono, StatusDot } from "@/components/ui/Primitives";

const PHASES = [
  { key: "ride-in", label: "Ride in" },
  { key: "closing", label: "Door closing" },
  { key: "washing", label: "Washing" },
  { key: "opening", label: "Door opening" },
  { key: "ride-out", label: "Ride out" },
] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** smoothstep — takes the mechanical linearity out of the entrance. */
const ease = (v: number) => v * v * (3 - 2 * v);

/**
 * The hero is a 300vh scroll stage with a pinned viewport: page scroll *is*
 * the wash cycle. The claim stays put on the left and the machine plays
 * beside it, so the pitch and the proof are on screen at the same time.
 *
 * Progress is quantised to 160 steps and kept in React state rather than
 * piped through `useTransform`. Two reasons: a 200-node SVG scrubbed on
 * every scroll frame stutters on a phone, and Motion hands plain
 * scroll-linked style values to the browser's native scroll timeline, which
 * animates against the document range rather than this element's.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  const [intro, setIntro] = useState(0);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const stepped = Math.round(clamp01(value) * 160) / 160;
    setP((cur) => (cur === stepped ? cur : stepped));
  });

  /* The bike rides in once, on load, and parks — so the hero at rest is a
     bike sitting in a lit bay rather than an empty box. Scrolling picks the
     cycle up from there. The intro only runs after mount, so the first
     client render still matches the server's empty bay. */
  useEffect(() => {
    // Reduced motion collapses the run to zero, so the bike is simply
    // already parked on the next frame. The state is still set from inside
    // the animation callback rather than the effect body.
    const duration = reduce ? 0 : 1100;
    const start = performance.now() + (reduce ? 0 : 320);
    let frame = requestAnimationFrame(function tick(now: number) {
      const t = duration <= 0 ? 1 : clamp01((now - start) / duration);
      setIntro(ease(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  // Parked is cycle 0.18. Scrolling runs 0.18 → 1.
  const scrolled = p > 0.004;
  const cycle = scrolled ? 0.18 + clamp01(p / 0.94) * 0.82 : intro * 0.18;
  const sceneIn = ease(clamp01(Math.max(p / 0.12, intro)));

  const stage = stageOf(cycle);
  // At rest the bike is simply parked and waiting, which is not one of the
  // five cycle phases.
  const phaseIndex = scrolled ? Math.max(0, PHASES.findIndex((ph) => ph.key === stage.label)) : -1;
  const phaseLabel = scrolled ? (PHASES[phaseIndex]?.label ?? "Ready") : "Ready — press start";

  return (
    <section id="top" ref={ref} className="relative h-[300vh]">
      <div className="grain sticky top-0 flex h-svh flex-col overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 74% at 62% 52%, #171b1e 0%, #0f1214 46%, #0a0c0d 100%)",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1320px] flex-1 content-center gap-8 px-5 pb-16 pt-20 sm:px-8 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:items-center lg:gap-10">
          {/* ── the claim ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3">
              <StatusDot />
              <Mono className="text-concrete/50">MUDROOM ONE — Automatic bike wash box</Mono>
            </div>

            <h1 className="display mt-6 text-[clamp(2.5rem,7.2vw,4.6rem)]">
              <span className="block">Your bike.</span>
              <span className="block">One click.</span>
              <span className="block text-hivis">Clean.</span>
            </h1>

            <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed text-concrete/55">
              Die automatische Bike-Waschbox, die dein Fahrrad in wenigen Minuten
              wieder bereit für die nächste Runde macht.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#buy" size="lg" icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}>
                Buy the box
              </ButtonLink>
              <ButtonLink href="#rent" size="lg" variant="outline">
                Rent for events
              </ButtonLink>
            </div>
          </div>

          {/* ── the machine ──────────────────────────────────────────── */}
          <div className="hero-scene" style={{ ["--ts"]: sceneIn } as CSSProperties}>
            <WashScene progress={cycle} bikeId="enduro" />
          </div>
        </div>

        {/* ── cycle ticker ─────────────────────────────────────────── */}
        <div className="relative z-20 border-t border-[var(--edge)] bg-steel/70 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-[1320px] items-center gap-4 px-5 py-3 sm:px-8">
            <div className="flex shrink-0 items-center gap-2">
              <StatusDot tone={stage.washing ? "water" : "hivis"} />
              <Mono className="text-concrete/70">{phaseLabel}</Mono>
            </div>

            <div className="relative hidden h-px flex-1 bg-[var(--edge)] sm:block">
              <div
                className="absolute inset-y-0 left-0 bg-hivis transition-[width] duration-150 ease-linear"
                style={{ width: `${cycle * 100}%` }}
              />
              {PHASES.map((ph, i) => (
                <span
                  key={ph.key}
                  className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${(i / (PHASES.length - 1)) * 100}%`,
                    background: i <= phaseIndex ? "var(--color-hivis)" : "var(--edge-strong)",
                  }}
                />
              ))}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-4">
              <Mono className="tnum hidden text-concrete/35 md:inline">
                Cycle {String(Math.round(cycle * 100)).padStart(3, "0")}%
              </Mono>
              <div
                className="flex items-center gap-2 transition-opacity duration-200"
                style={{ opacity: 1 - clamp01(p / 0.05) }}
              >
                <Mono className="text-hivis">Scroll to wash</Mono>
                <ArrowDown className="h-3.5 w-3.5 animate-bounce text-hivis" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { WashBox } from "./WashBox";
import { BikeArt } from "./BikeArt";
import type { BikeId } from "@/lib/bikes";
import { cn } from "@/components/ui/cn";

/**
 * The cycle, expressed as one number.
 *
 *   0.00 → 0.18   ride in
 *   0.18 → 0.30   shutter down
 *   0.30 → 0.64   wash: brushes close in, jets run, the mud comes off
 *   0.64 → 0.76   shutter up
 *   0.76 → 1.00   ride out, clean
 */
export function stageOf(p: number) {
  const t = Math.min(1, Math.max(0, p));
  const span = (a: number, b: number) =>
    Math.min(1, Math.max(0, (t - a) / (b - a)));

  const rideIn = span(0, 0.18);
  const door = span(0.18, 0.3) - span(0.64, 0.76);
  const washing = t > 0.3 && t < 0.66;
  const washRamp = Math.min(span(0.3, 0.38), 1 - span(0.6, 0.66));
  const dirt = 1 - span(0.34, 0.6);
  const rideOut = span(0.78, 1);

  return {
    // -66% fully off-frame left → 10.6% parked, centred in the bay →
    // 100% off-frame right. The bay opening masks it at either end.
    bikeX: -66 + rideIn * 76.6 + rideOut * 89.4,
    door: Math.min(1, Math.max(0, door)),
    washing,
    intensity: washRamp,
    dirt,
    wet: t > 0.32 && t < 0.9,
    label:
      t < 0.18
        ? "ride-in"
        : t < 0.3
          ? "closing"
          : t < 0.66
            ? "washing"
            : t < 0.78
              ? "opening"
              : "ride-out",
  };
}

interface WashSceneProps {
  progress: number;
  bikeId?: BikeId;
  className?: string;
  /** Hide the bike entirely — used where only the machine is the subject. */
  bikeless?: boolean;
  /** Shell colour, so the configurator can recolour the machine. */
  shell?: string;
}

/*
 * Nothing here branches on `useReducedMotion()`. That hook is false during
 * SSR, so a branch would make the server emit a running wash that a
 * reduced-motion client never renders, and hydration tears. Motion honours
 * the setting through <MotionConfig reducedMotion="user">, the CSS
 * animations are stopped by the reduced-motion block in globals.css, and
 * the transition below is neutralised the same way.
 */
export function WashScene({
  progress,
  bikeId = "enduro",
  className,
  bikeless = false,
  shell,
}: WashSceneProps) {
  const s = useMemo(() => stageOf(progress), [progress]);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: "1000 / 620" }}
    >
      <WashBox
        layer="back"
        door={s.door}
        washing={s.washing}
        intensity={s.intensity}
        shell={shell}
        className="absolute inset-0 h-full w-full"
      />

      {/* The bike is clipped to the bay opening, so it appears out of the
          cabinet wall on the way in and disappears into it on the way out
          instead of sliding across the outside of the machine. */}
      {!bikeless ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: "inset(21.3% 24.8% 12.9% 8% round 1.2%)" }}
        >
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${s.bikeX}%`,
              bottom: "8.5%",
              width: "60%",
              transition: "left 120ms linear",
              // grounds the bike on the bay floor instead of floating on it
              filter: "drop-shadow(0 7px 12px rgba(0,0,0,0.5))",
            }}
          >
            <BikeArt bikeId={bikeId} dirt={s.dirt} wet={s.wet} />
          </div>
        </div>
      ) : null}

      <WashBox
        layer="front"
        door={s.door}
        washing={s.washing}
        intensity={s.intensity}
        shell={shell}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* run-off pooling at the sill while the cycle works */}
      {s.washing ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: "12%",
            right: "28%",
            bottom: "16%",
            height: "2.6%",
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-mud) 55%, transparent), transparent)",
            filter: "blur(6px)",
            opacity: 0.5 * (1 - s.dirt) + 0.25,
          }}
        />
      ) : null}

      {/* droplets thrown against the inside of the glass */}
      {s.washing ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {DROPS.map((drop, k) => (
            <motion.span
              key={k}
              className="absolute rounded-full"
              style={{
                left: `${drop.x}%`,
                top: `${drop.y}%`,
                width: drop.r,
                height: drop.r,
                background: "var(--color-water)",
              }}
              animate={{ opacity: [0, 0.75, 0], y: [0, 26 + drop.r * 5] }}
              transition={{
                duration: 0.9 + drop.d,
                repeat: Infinity,
                delay: drop.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* Fixed so the pattern is stable between renders — random per render would
   make every frame a different storm. */
const DROPS = Array.from({ length: 22 }).map((_, k) => {
  const seed = (k * 47) % 100;
  return {
    x: 11 + ((seed * 7) % 60),
    y: 26 + ((seed * 13) % 48),
    r: 2 + (seed % 3),
    d: (seed % 5) / 8,
    delay: (seed % 9) / 6,
  };
});

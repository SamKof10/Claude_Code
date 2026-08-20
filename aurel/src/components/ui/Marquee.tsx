"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full pass. */
  duration?: number;
  className?: string;
  fadeColor?: string;
}

/**
 * Duplicates its children once and translates -50%, so the loop is seamless
 * regardless of content width. Pauses on hover; disabled by reduced motion.
 */
export function Marquee({ children, duration = 42, className, fadeColor }: MarqueeProps) {
  return (
    <div className={cn("marquee-host relative overflow-hidden", className)}>
      <div
        className="marquee-track flex w-max"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center" aria-hidden={false}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
      {fadeColor ? (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32"
            style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32"
            style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }}
          />
        </>
      ) : null}
    </div>
  );
}

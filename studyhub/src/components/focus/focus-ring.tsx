"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { PHASE_LABEL, type FocusPhase, type FocusStatus } from "@/lib/store/focus";
import { formatClock } from "@/lib/utils";

const RADIUS = 86;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PHASE_STROKE: Record<FocusPhase, string> = {
  focus: "var(--color-signal)",
  "short-break": "var(--success)",
  "long-break": "var(--success)",
};

export function FocusRing({
  phase,
  status,
  msLeft,
  totalMs,
}: {
  phase: FocusPhase;
  status: FocusStatus;
  msLeft: number;
  totalMs: number;
}) {
  const reduceMotion = useReducedMotion();
  const fraction = totalMs > 0 ? Math.min(1, Math.max(0, msLeft / totalMs)) : 0;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke={PHASE_STROKE[phase]}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          // Linear, and skipped entirely under Reduce Motion: the ring is a
          // clock, so easing it would misreport where the block actually is.
          style={{ transition: reduceMotion ? "none" : "stroke-dashoffset 250ms linear" }}
          opacity={status === "paused" ? 0.45 : 1}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="mono-label">{PHASE_LABEL[phase]}</p>
        {/* aria-live is off on purpose — announcing every tick would make the
            page unusable with a screen reader. The status line below carries
            the state changes that matter. */}
        <p role="timer" aria-live="off" className="mt-1 font-mono text-[2.75rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {formatClock(msLeft)}
        </p>
        <p className="mt-2 t-caption text-ink-3">
          {status === "running" ? "Läuft" : status === "paused" ? "Pausiert" : "Bereit"}
        </p>
      </div>
    </div>
  );
}

"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` lets Motion honour the OS setting itself: transform
 * and layout animations are dropped, opacity is kept.
 *
 * Doing it here rather than per-component matters for correctness, not just
 * tidiness — `useReducedMotion()` is always false during SSR, so branching
 * `initial`/`animate` on it makes the server emit start styles that a
 * reduced-motion client never applies, and hydration fails.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

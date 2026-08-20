"use client";

/**
 * Typed wrappers around the vendored React Bits components
 * (see src/vendor/reactbits/README.md).
 *
 * The upstream files stay untouched so they remain updatable; everything
 * AUREL-specific — the palette, the restraint, the reduced-motion opt-out —
 * lives here.
 */

import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import DecryptedTextBase from "@/vendor/reactbits/DecryptedText.jsx";
import ShinyTextBase from "@/vendor/reactbits/ShinyText.jsx";
import ClickSparkBase from "@/vendor/reactbits/ClickSpark.jsx";
import "@/vendor/reactbits/ShinyText.css";

/** Characters the scramble draws from — kept to the technical alphabet. */
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—/";

/*
 * Reduced motion is switched off through props, never by returning
 * different markup. `useReducedMotion()` is false while the server renders,
 * so a structural branch would tear on hydration — which is exactly the bug
 * this shape avoids.
 */

/**
 * A technical label that resolves out of noise when it scrolls into view.
 * Used only on monospaced readouts, where it reads as instrumentation
 * settling rather than decoration.
 */
export function DecryptedLabel({
  text,
  className,
  speed = 38,
  maxIterations = 8,
}: {
  text: string;
  className?: string;
  speed?: number;
  maxIterations?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <DecryptedTextBase
      text={text}
      speed={reduce ? 0 : speed}
      maxIterations={reduce ? 0 : maxIterations}
      sequential={!reduce}
      revealDirection="start"
      characters={SCRAMBLE}
      animateOn="view"
      parentClassName={className}
      className=""
      encryptedClassName="opacity-45"
    />
  );
}

/** A slow sheen across a short piece of text. One element at a time, never a wall. */
export function ShinyLabel({
  text,
  className,
  color,
  shineColor,
  speed = 6,
}: {
  text: string;
  className?: string;
  color?: string;
  shineColor?: string;
  speed?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <ShinyTextBase
      text={text}
      disabled={reduce === true}
      className={className}
      color={color ?? "var(--color-ink-2)"}
      shineColor={shineColor ?? "var(--color-ember)"}
      speed={speed}
      spread={100}
    />
  );
}

/** Ember sparks where the pointer lands. Skipped entirely under reduced motion. */
export function ClickSparkArea({
  children,
  sparkColor = "#c4761b",
}: {
  children: ReactNode;
  sparkColor?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <ClickSparkBase
      sparkColor={sparkColor}
      sparkSize={9}
      sparkRadius={17}
      sparkCount={reduce ? 0 : 7}
      duration={430}
      easing="ease-out"
    >
      {children}
    </ClickSparkBase>
  );
}

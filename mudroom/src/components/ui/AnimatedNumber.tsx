"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Counts up once, when it scrolls into view.
 *
 * The rendered text starts at zero on the server and on the client alike —
 * `useReducedMotion()` is false during SSR, so branching the output on it
 * would produce a hydration mismatch. Reduced motion instead collapses the
 * duration to zero, so the value snaps into place on the first frame.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1400,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [eased, setEased] = useState(0);

  const runtime = reduce ? 0 : duration;

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = runtime <= 0 ? 1 : Math.min(1, (now - start) / runtime);
      // easeOutExpo — fast, then settles
      setEased(t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, runtime]);

  const formatted = (value * eased).toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

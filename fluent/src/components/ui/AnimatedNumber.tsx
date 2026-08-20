"use client";

import { useEffect, useState } from "react";
import { useInViewOnce } from "@/hooks";
import { useMediaQuery } from "@/hooks";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Counts up once, when it scrolls into view. Starts at zero on both server
 * and client, so there's no hydration mismatch — the count-up only begins
 * after mount, inside an effect. */
export function AnimatedNumber({ value, decimals = 0, duration = 1200, prefix = "", suffix = "", className }: AnimatedNumberProps) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [eased, setEased] = useState(0);
  const runtime = reduce ? 0 : duration;

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = runtime <= 0 ? 1 : Math.min(1, (now - start) / runtime);
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

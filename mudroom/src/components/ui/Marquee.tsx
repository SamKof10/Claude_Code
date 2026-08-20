import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Two identical tracks, the animation translating by exactly -50 % — the
 * seam lands where the second copy starts, so the loop is invisible.
 */
export function Marquee({
  children,
  duration = 40,
  className,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
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
    </div>
  );
}

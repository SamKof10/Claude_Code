import { cn } from "@/components/ui/cn";

/**
 * The mark is the box itself, seen head-on: an outlined cabinet, three
 * shutter slats part-way down, and a hi-vis sill. At 20 px it still reads
 * as a doorway you ride into, which is the whole idea of the brand.
 */
export function LogoMark({ className, sill = "var(--color-hivis)" }: { className?: string; sill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} aria-hidden>
      <rect
        x="1.6"
        y="2.4"
        width="20.8"
        height="19.2"
        rx="2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <g fill="currentColor" opacity="0.9">
        <rect x="5.1" y="6" width="13.8" height="1.5" rx="0.75" />
        <rect x="5.1" y="9" width="13.8" height="1.5" rx="0.75" />
        <rect x="5.1" y="12" width="13.8" height="1.5" rx="0.75" opacity="0.45" />
      </g>
      <rect x="5.1" y="17.3" width="13.8" height="2.1" rx="1.05" fill={sill} />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-[22px] w-[22px]" />
      <span className="display text-[17px] leading-none tracking-[-0.02em]">
        MUD<span className="text-hivis">ROOM</span>
      </span>
      {compact ? null : (
        <span className="mono hidden text-concrete/30 lg:inline">EST. 2026</span>
      )}
    </span>
  );
}

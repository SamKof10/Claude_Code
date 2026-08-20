import { cn } from "@/components/ui/cn";

/**
 * The mark: an aperture ring broken at the top, with a filled arc — the
 * light bar seen end-on, and the "A" of AUREL implied by the gap.
 */
export function LogoMark({ className, night = false }: { className?: string; night?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} aria-hidden focusable="false">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={night ? "#f6f4f0" : "#131211"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="38 18"
        transform="rotate(-115 12 12)"
      />
      <path
        d="M6.6 15.2 A 7 7 0 0 1 17.4 15.2 Z"
        fill="var(--color-ember)"
        opacity="0.92"
      />
      <circle cx="12" cy="12" r="1.7" fill={night ? "#f6f4f0" : "#131211"} />
    </svg>
  );
}

export function Wordmark({ className, night = false }: { className?: string; night?: boolean }) {
  return (
    <span
      className={cn(
        "text-[15px] leading-none font-medium tracking-[0.3em] uppercase",
        night ? "text-paper" : "text-ink",
        className,
      )}
    >
      Aurel
    </span>
  );
}

export function Logo({ className, night = false }: { className?: string; night?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark night={night} className="h-[22px] w-[22px]" />
      <Wordmark night={night} />
    </span>
  );
}

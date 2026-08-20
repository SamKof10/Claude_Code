import { getShell, type ShellId } from "@/lib/products";
import { cn } from "@/components/ui/cn";

/**
 * A 3-second read of the machine for cart lines and the fly-to-cart ghost:
 * cabinet, lit bay, hi-vis strip. The full <WashBox> is far too much
 * geometry for a 56 px thumbnail.
 */
export function BoxThumb({ shell, className }: { shell: ShellId; className?: string }) {
  const body = getShell(shell).hex;
  return (
    <svg viewBox="0 0 64 56" className={cn("h-full w-full", className)} aria-hidden>
      <rect width="64" height="56" fill="#0a0c0d" />
      <rect x="3" y="4" width="58" height="46" rx="5" fill={body} />
      <rect x="3" y="4" width="58" height="2" rx="1" fill="#e9eae5" opacity="0.18" />
      <rect x="7" y="13" width="38" height="28" rx="2.5" fill="#8b9498" />
      <rect x="7" y="13" width="38" height="4" fill="#1b2124" />
      <rect x="7" y="36" width="38" height="5" fill="#1b2124" />
      <g fill="#e9eae5" opacity="0.4">
        <rect x="14" y="17" width="1.5" height="19" />
        <rect x="25" y="17" width="1.5" height="19" />
        <rect x="36" y="17" width="1.5" height="19" />
      </g>
      <rect x="10" y="19" width="3" height="17" rx="1.5" fill="#20262a" />
      <rect x="39" y="19" width="3" height="17" rx="1.5" fill="#20262a" />
      <rect x="48" y="13" width="10" height="28" rx="2" fill="#0c1012" />
      <rect x="50" y="34" width="6" height="4" rx="1" fill="var(--color-hivis)" />
      <rect x="7" y="45" width="50" height="2.5" rx="1.25" fill="var(--color-hivis)" />
    </svg>
  );
}

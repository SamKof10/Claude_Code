"use client";

import { FINISHES, type FinishId } from "@/lib/products";
import { useT } from "@/lib/i18n";
import { cn } from "@/components/ui/cn";

interface FinishSwatchesProps {
  value: FinishId;
  onChange: (id: FinishId) => void;
  /** Ring offset has to match whatever surface the swatches sit on. */
  offset?: string;
  size?: "sm" | "md";
  /** Accessible group name — each set on a page needs its own. */
  label: string;
  className?: string;
}

const SIZES = {
  sm: { hit: "h-9 w-9", dot: "h-5 w-5" },
  md: { hit: "h-11 w-11", dot: "h-6 w-6" },
} as const;

/** The three anodised finishes, as a labelled radio group. */
export function FinishSwatches({
  value,
  onChange,
  offset = "ring-offset-[var(--color-paper)]",
  size = "md",
  label,
  className,
}: FinishSwatchesProps) {
  const t = useT();
  const s = SIZES[size];

  return (
    <div role="radiogroup" aria-label={label} className={cn("flex items-center gap-1.5", className)}>
      {FINISHES.map((f) => {
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.finishes[f.id].name}
            title={t.finishes[f.id].name}
            onClick={() => onChange(f.id)}
            className={cn(
              "grid place-items-center rounded-full transition-transform duration-200 hover:scale-110",
              s.hit,
              active && `ring-1 ring-ink ring-offset-2 ${offset}`,
            )}
          >
            <span
              className={cn("rounded-full border", s.dot)}
              style={{ background: f.swatch, borderColor: "var(--line-strong)" }}
            />
          </button>
        );
      })}
    </div>
  );
}

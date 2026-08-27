"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The little "×" that removes a tag, topic or goal chip.
 *
 * The glyph stays small so the chip reads as a chip, but the *hit area* is
 * padded out to 28px and pulled back with negative margins so the chip doesn't
 * grow. HIG Accessibility asks for a 20pt minimum control size on desktop and
 * treats spacing as "as important as size" — a bare 10px glyph met neither.
 */
export function RemoveChipButton({
  label,
  onClick,
  className,
}: {
  /** Names the thing being removed, e.g. "algebra" — read by screen readers. */
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Remove ${label}`}
      onClick={onClick}
      className={cn(
        "-my-1.5 -mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-md",
        "text-ink-3 transition-colors hover:text-danger-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]",
        className
      )}
    >
      <X className="size-3" />
    </button>
  );
}

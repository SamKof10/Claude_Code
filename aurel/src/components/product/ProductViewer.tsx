"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { ArcLamp } from "./ArcLamp";
import { FINISHES, getModel, type FinishId, type ModelId } from "@/lib/products";
import { Mono } from "@/components/ui/Primitives";
import { fmt, useT } from "@/lib/i18n";
import { cn } from "@/components/ui/cn";
import { useHasPointer, usePointerParallax } from "@/hooks";

/** Framings of the same geometry — cheaper and sharper than extra renders. */
const VIEWS = {
  gesamt: { scale: 1, x: "0%", y: "0%" },
  leiste: { scale: 2.15, x: "0%", y: "17%" },
  sockel: { scale: 2.6, x: "0%", y: "-22%" },
} as const;

type ViewIdKey = keyof typeof VIEWS;

type ViewId = ViewIdKey;

interface ProductViewerProps {
  finishId: FinishId;
  modelId: ModelId;
  onFinishChange?: (id: FinishId) => void;
  /** Compact drops the view tabs — used where space is tight. */
  compact?: boolean;
  className?: string;
}

export function ProductViewer({
  finishId,
  modelId,
  onFinishChange,
  compact = false,
  className,
}: ProductViewerProps) {
  const [view, setView] = useState<ViewId>("gesamt");
  const [night, setNight] = useState(false);
  const reduce = useReducedMotion();
  const hasPointer = useHasPointer();
  const { ref, offset } = usePointerParallax<HTMLDivElement>(hasPointer && !reduce);
  const model = getModel(modelId);
  const t = useT();

  const kelvin = night ? 1900 : 5400;
  const intensity = night ? 0.72 : 1;
  const frame = VIEWS[view];
  const note = fmt(t.viewer.notes[view], { cm: model.barLengthCm });

  const px = reduce ? 0 : offset.x;
  const py = reduce ? 0 : offset.y;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div
        ref={ref}
        className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl border transition-colors duration-700 sm:aspect-[16/11]"
        style={{
          borderColor: night ? "var(--line-night)" : "var(--line)",
          background: night
            ? "radial-gradient(70% 60% at 50% 42%, #1a1a1d, #0b0b0c 78%)"
            : "radial-gradient(70% 60% at 50% 38%, #faf9f6, var(--color-paper-2) 82%)",
        }}
      >
        {/* day / night */}
        <button
          type="button"
          onClick={() => setNight((n) => !n)}
          aria-pressed={night}
          className={cn(
            "absolute top-3 right-3 z-[3] inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[12.5px] transition-colors duration-300 sm:h-9 sm:px-3",
            night
              ? "border-[var(--line-night-strong)] bg-white/[0.06] text-paper"
              : "border-[var(--line-strong)] bg-white/60 text-ink",
          )}
        >
          {night ? <Moon size={13} strokeWidth={1.75} /> : <Sun size={13} strokeWidth={1.75} />}
          {night ? t.viewer.night : t.viewer.day}
        </button>

        <div className="absolute inset-0 grid place-items-center px-6 py-4">
          <motion.div
            className="w-full"
            animate={{ scale: frame.scale, x: frame.x, y: frame.y }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 200, damping: 30, mass: 0.8 }
            }
            style={{
              transform: `translate3d(${px * -12}px, ${py * -8}px, 0)`,
            }}
          >
            <ArcLamp
              finishId={finishId}
              modelId={modelId}
              kelvin={kelvin}
              intensity={intensity}
              className="w-full"
            />
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-4 z-[3]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + String(night)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <Mono className={night ? "text-paper/50" : "text-ink-3"}>{note}</Mono>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* views */}
          <div
            className="inline-flex rounded-full border p-1"
            style={{ borderColor: "var(--line-strong)" }}
            role="tablist"
            aria-label={t.viewer.view}
          >
            {(Object.keys(VIEWS) as ViewId[]).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={cn(
                  "relative min-h-[40px] rounded-full px-4 py-2.5 text-[12.5px] transition-colors duration-200 sm:min-h-0 sm:px-3.5 sm:py-1.5",
                  view === id ? "text-paper" : "text-ink-2 hover:text-ink",
                )}
              >
                {view === id ? (
                  <motion.span
                    layoutId="viewer-tab"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-[2]">{t.viewer.views[id]}</span>
              </button>
            ))}
          </div>

          {/* finishes */}
          {onFinishChange ? (
            <div className="flex items-center gap-2.5">
              <Mono className="mr-1 text-ink-3">{t.common.finishLabel}</Mono>
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFinishChange(f.id)}
                  aria-label={t.finishes[f.id].name}
                  aria-pressed={finishId === f.id}
                  title={t.finishes[f.id].name}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 hover:scale-110",
                    finishId === f.id && "ring-1 ring-ink ring-offset-2 ring-offset-[var(--color-paper)]",
                  )}
                >
                  <span
                    className="h-6 w-6 rounded-full border"
                    style={{ background: f.swatch, borderColor: "var(--line-strong)" }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <Mono className="text-ink-3">{fmt(t.viewer.coverage, { coverage: t.models[modelId].coverage })}</Mono>
          )}
        </div>
      ) : null}
    </div>
  );
}

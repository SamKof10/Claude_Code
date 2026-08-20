"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArcLamp } from "./ArcLamp";
import { Mono } from "@/components/ui/Primitives";
import { useT } from "@/lib/i18n";
import type { FinishId } from "@/lib/products";

const POINTS: { id: string; x: number; y: number }[] = [
  {
    id: "diffusor",
    x: 38,
    y: 30,
  },
  {
    id: "gelenk",
    x: 50,
    y: 39,
  },
  {
    id: "rad",
    x: 50,
    y: 88,
  },
  {
    id: "endkappe",
    x: 79,
    y: 29,
  },
];

export function Hotspots({ finishId }: { finishId: FinishId }) {
  const [active, setActive] = useState<string | null>(null);
  const t = useT();

  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--line)", background: "var(--color-paper-2)" }}
    >
      <div className="px-6 pt-10 pb-12 sm:px-10">
        <ArcLamp finishId={finishId} modelId="arc-max" kelvin={3400} intensity={0.7} className="w-full" />
      </div>

      {POINTS.map((p, index) => {
        const copy = t.viewer.hotspots[index];
        const isOpen = active === p.id;
        return (
          <div key={p.id} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <button
              type="button"
              onClick={() => setActive(isOpen ? null : p.id)}
              aria-expanded={isOpen}
              aria-label={copy.title}
              className="relative grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            >
              <span
                className="absolute h-6 w-6 rounded-full transition-transform duration-300"
                style={{
                  background: "color-mix(in srgb, var(--color-ember) 26%, transparent)",
                  transform: isOpen ? "scale(1.25)" : "scale(1)",
                }}
              />
              <span className="relative h-2.5 w-2.5 rounded-full bg-ink" />
            </button>

            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="glass absolute z-[4] w-[248px] -translate-x-1/2 rounded-xl border p-4 shadow-[0_16px_40px_-24px_rgba(19,18,17,0.6)]"
                  style={{
                    borderColor: "var(--line-strong)",
                    top: 22,
                    left: p.x > 70 ? -80 : p.x < 30 ? 80 : 0,
                  }}
                >
                  <p className="text-[14px] font-medium">{copy.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{copy.body}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}

      <Mono className="absolute bottom-4 left-5 text-ink-3">
        {active ? t.viewer.hotspotClose : t.viewer.hotspotHint}
      </Mono>
    </div>
  );
}

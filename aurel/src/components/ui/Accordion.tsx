"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "./cn";

export interface AccordionEntry {
  q: string;
  a: string;
}

export function Accordion({ items, className }: { items: AccordionEntry[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("divide-y", className)} style={{ borderColor: "var(--line)" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-t" style={{ borderColor: "var(--line)" }}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-200 hover:text-ink-2 sm:py-7"
              >
                <span className="text-[17px] leading-snug font-medium tracking-[-0.015em] sm:text-[19px]">
                  {item.q}
                </span>
                <span
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-200"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  <Plus
                    size={14}
                    strokeWidth={1.75}
                    className={cn(
                      "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen && "rotate-45",
                    )}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pr-10 pb-7 text-[15px] leading-relaxed text-ink-2">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

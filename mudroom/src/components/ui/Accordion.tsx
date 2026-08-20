"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "./cn";

export interface AccordionItem {
  q: string;
  a: string;
}

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-[var(--edge)] border-y border-[var(--edge)]", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-hivis"
              >
                <span className="text-[15px] font-medium tracking-tight sm:text-base">{item.q}</span>
                <span className="relative h-4 w-4 shrink-0">
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                  <motion.span
                    className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current"
                    animate={{ scaleY: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[62ch] pb-6 pr-8 text-sm leading-relaxed text-concrete/55">
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

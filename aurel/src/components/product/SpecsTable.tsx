"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

export function SpecsTable() {
  const t = useT();
  const [open, setOpen] = useState<string | null>(t.specs[0].group);

  return (
    <div className="border-t" style={{ borderColor: "var(--line)" }}>
      {t.specs.map((group) => {
        const isOpen = open === group.group;
        return (
          <div key={group.group} className="border-b" style={{ borderColor: "var(--line)" }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : group.group)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-[16px] font-medium tracking-[-0.015em]">{group.group}</span>
              <ChevronDown
                size={16}
                strokeWidth={1.75}
                className={cn(
                  "shrink-0 text-ink-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <dl className="pb-5">
                    {group.rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col gap-1 border-t py-3 sm:flex-row sm:items-baseline sm:gap-6"
                        style={{ borderColor: "var(--line)" }}
                      >
                        <dt className="sm:w-[42%] sm:shrink-0">
                          <Mono className="text-ink-3">{row.label}</Mono>
                        </dt>
                        <dd className="text-[14.5px] text-ink-2">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { NATURAL_UPGRADES } from "@/lib/content/natural";
import { useStore } from "@/lib/store";

export function NaturalList() {
  const { markActivity } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      {NATURAL_UPGRADES.map((item) => {
        const isOpen = open === item.id;
        return (
          <Card key={item.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => {
                const next = isOpen ? null : item.id;
                setOpen(next);
                if (next) markActivity("natural");
              }}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <Mono className="block truncate text-ink-3">{item.context}</Mono>
                <span className="mt-0.5 block truncate text-[14px] text-ink-1">{item.basic}</span>
              </div>
              <span className={cn("shrink-0 text-ink-3 transition-transform", isOpen && "rotate-180")}>⌄</span>
            </button>
            {isOpen ? (
              <div className="border-t border-[var(--line)] px-5 py-4">
                <div className="rounded-xl border border-signal/25 bg-signal/[0.06] px-4 py-3">
                  <Mono className="text-signal">Natural</Mono>
                  <p className="mt-1 text-[14.5px] text-ink-1">{item.natural}</p>
                </div>
                <div className="mt-2.5 rounded-xl border border-mint/25 bg-mint/[0.06] px-4 py-3">
                  <Mono className="text-mint">Advanced</Mono>
                  <p className="mt-1 text-[14.5px] text-ink-1">{item.advanced}</p>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{item.toneNote}</p>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

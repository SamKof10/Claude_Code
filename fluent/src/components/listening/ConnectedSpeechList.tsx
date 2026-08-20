"use client";

import { useState } from "react";
import { Card, Mono } from "@/components/ui/Primitives";
import { CONNECTED_SPEECH } from "@/lib/content/listening";
import { cn } from "@/components/ui/cn";

export function ConnectedSpeechList() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="lede max-w-xl">
        This is how English actually sounds when people speak fast — never write these forms in an email or essay.
      </p>
      {CONNECTED_SPEECH.map((item) => {
        const isOpen = open === item.id;
        return (
          <Card key={item.id} className="overflow-hidden">
            <button type="button" onClick={() => setOpen(isOpen ? null : item.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
              <span className="text-[12.5px] text-ink-3 line-through">{item.formal}</span>
              <span className="text-[16px] font-medium text-signal">{item.spoken}</span>
              <span className={cn("ml-auto text-ink-3 transition-transform", isOpen && "rotate-180")}>⌄</span>
            </button>
            {isOpen ? (
              <div className="border-t border-[var(--line)] px-5 py-4">
                <p className="text-[13.5px] text-ink-1">&ldquo;{item.example}&rdquo;</p>
                <Mono className="mt-3 block text-ink-3">Note</Mono>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{item.note}</p>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

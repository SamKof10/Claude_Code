"use client";

import { useState } from "react";
import { MessagesSquare } from "lucide-react";
import { Card } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { DebatePractice } from "@/components/debate/DebatePractice";
import { DEBATE_TOPICS } from "@/lib/content/debate";

export default function DebatePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const topic = DEBATE_TOPICS.find((t) => t.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Debate</h1>
          <p className="lede mt-2 max-w-xl">
            Argue a position, then see a stronger version — with the phrases fluent speakers actually use to debate.
          </p>
        </div>
      </Reveal>

      {topic ? (
        <DebatePractice topic={topic} onBack={() => setSelected(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DEBATE_TOPICS.map((t) => (
            <Card key={t.id} className="p-5">
              <button type="button" onClick={() => setSelected(t.id)} className="flex w-full items-start gap-3 text-left">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-signal">
                  <MessagesSquare size={16} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink-1">{t.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-3">{t.context}</p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

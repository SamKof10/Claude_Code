"use client";

import { ArrowRight, RefreshCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { CONFUSABLE_PAIRS } from "@/lib/content/review";
import { useStore } from "@/lib/store";
import { VOCAB_WORDS } from "@/lib/content/vocabulary";

export function SmartReviewPreview() {
  const { state } = useStore();
  const strugglingWords = Object.entries(state.vocab)
    .filter(([, p]) => p.state === "learning" && p.lastResult === "incorrect")
    .map(([id]) => VOCAB_WORDS.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))
    .slice(0, 2);

  const pairs = CONFUSABLE_PAIRS.slice(0, 2);

  return (
    <Reveal delay={0.18}>
      <Card className="p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <RefreshCcw size={14} strokeWidth={2} className="text-amber" />
          <Mono className="text-ink-3">You should review these</Mono>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {strugglingWords.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink-1">{w.word}</p>
                <p className="text-[12.5px] text-ink-3">{w.meaning}</p>
              </div>
              <Badge tone="coral">learning</Badge>
            </div>
          ))}
          {pairs.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3">
              <p className="text-[14px] font-medium text-ink-1">
                {p.a.word} <span className="text-ink-3">vs</span> {p.b.word}
              </p>
              <Badge tone="amber">confusable</Badge>
            </div>
          ))}
        </div>
        <ButtonLink href="/progress/weak-areas" variant="secondary" className="mt-5 w-full">
          Review weak spots <ArrowRight size={15} />
        </ButtonLink>
      </Card>
    </Reveal>
  );
}

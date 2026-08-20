"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { TRANSLATION_CHALLENGES } from "@/lib/content/translation";
import { useStore } from "@/lib/store";
import { pickOne } from "@/lib/utils";

export function TranslationPractice() {
  const { markActivity } = useStore();
  // Starts on a fixed item so server and client render the same thing on
  // first paint, then rerolls to a random one once mounted (no SSR/CSR mismatch).
  const [item, setItem] = useState(TRANSLATION_CHALLENGES[0]);
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only reroll after the SSR-safe initial render
    setItem(pickOne(TRANSLATION_CHALLENGES));
  }, []);

  const next = () => {
    setItem(pickOne(TRANSLATION_CHALLENGES));
    setValue("");
    setRevealed(false);
  };

  const submit = () => {
    setRevealed(true);
    markActivity("translate");
  };

  return (
    <Card className="mx-auto max-w-xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <Mono className="text-signal">German → natural English</Mono>
        <Badge tone="signal">{item.level}</Badge>
      </div>
      <p className="mt-3 text-[17px] leading-relaxed text-ink-1">{item.german}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Your translation..."
        className="mt-4 w-full resize-none rounded-xl border border-[var(--line-strong)] bg-surface-2 p-4 text-[14px] leading-relaxed text-ink-1 outline-none focus:border-signal"
      />

      {!revealed ? (
        <Button onClick={submit} disabled={!value.trim()} className="mt-3 w-full" size="lg">
          Compare with natural version
        </Button>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3">
            <div>
              <Mono className="text-ink-3">Your version</Mono>
              <p className="mt-1 text-[14px] text-ink-2">{value}</p>
            </div>
            <div className="rounded-xl border border-mint/25 bg-mint/[0.06] p-4">
              <Mono className="text-mint">Natural version</Mono>
              <p className="mt-1 text-[15px] font-medium text-ink-1">{item.natural}</p>
            </div>
            <p className="text-[12.5px] text-ink-3">
              Literal trap: <span className="text-coral">&ldquo;{item.literalTrap}&rdquo;</span>
            </p>
            <div className="rounded-xl bg-surface-2/60 p-4">
              <p className="text-[13.5px] font-medium text-ink-1">{item.idiom}</p>
              <p className="mt-1 text-[12.5px] text-ink-3">{item.idiomMeaningDe}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{item.note}</p>
            </div>
          </div>
          <Button onClick={next} variant="secondary" className="mt-5 w-full" size="lg">
            <RefreshCcw size={15} /> Next sentence
          </Button>
        </>
      )}
    </Card>
  );
}

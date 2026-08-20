"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono } from "@/components/ui/Primitives";
import { DEBATE_PHRASES, DEBATE_PHRASE_LABELS, type DebatePhrase, type DebateTopic } from "@/lib/content/debate";
import { useStore } from "@/lib/store";

const ORDER: DebatePhrase["function"][] = ["opening", "counter", "concede", "conclude"];

export function DebatePractice({ topic, onBack }: { topic: DebateTopic; onBack: () => void }) {
  const { markActivity } = useStore();
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);

  const submit = () => {
    setRevealed(true);
    markActivity("debate");
  };

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3 hover:text-ink-1">
        <ArrowLeft size={14} /> All topics
      </button>

      <h2 className="mt-4 text-[19px] leading-snug font-medium text-ink-1">{topic.title}</h2>
      <p className="mt-2 text-[13.5px] text-ink-3">{topic.context}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder="Argue your position..."
        className="mt-4 w-full resize-none rounded-xl border border-[var(--line-strong)] bg-surface-2 p-4 text-[14px] leading-relaxed text-ink-1 outline-none focus:border-signal"
      />

      {!revealed ? (
        <Button onClick={submit} disabled={!value.trim()} className="mt-3 w-full" size="lg">
          Compare with a stronger version
        </Button>
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          <div>
            <Mono className="text-ink-3">Your argument</Mono>
            <p className="mt-1.5 text-[13.5px] text-ink-2">{value}</p>
          </div>
          <div className="rounded-xl border border-signal/25 bg-signal/[0.06] p-4">
            <Mono className="text-signal">Stronger version</Mono>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-1">{topic.sampleStrong}</p>
          </div>

          <div>
            <Mono className="text-ink-3">Useful phrases</Mono>
            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ORDER.map((fn) => (
                <div key={fn} className="rounded-xl bg-surface-2/60 p-3.5">
                  <Mono className="text-ink-3">{DEBATE_PHRASE_LABELS[fn]}</Mono>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {DEBATE_PHRASES.filter((p) => p.function === fn).map((p) => (
                      <li key={p.id} className="text-[12.5px] text-ink-2">{p.phrase}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

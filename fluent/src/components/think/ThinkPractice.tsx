"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono } from "@/components/ui/Primitives";
import { THINK_PROMPTS } from "@/lib/content/think";
import { useStore } from "@/lib/store";
import { pickOne } from "@/lib/utils";

export function ThinkPractice() {
  const { markActivity } = useStore();
  // Starts on a fixed prompt so server and client render the same thing on
  // first paint, then rerolls to a random one once mounted (no SSR/CSR mismatch).
  const [prompt, setPrompt] = useState(THINK_PROMPTS[0]);
  const [response, setResponse] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only reroll after the SSR-safe initial render
    setPrompt(pickOne(THINK_PROMPTS));
  }, []);

  const next = () => {
    setPrompt(pickOne(THINK_PROMPTS));
    setResponse("");
    setRevealed(false);
  };

  const submit = () => {
    setRevealed(true);
    markActivity("think");
  };

  return (
    <Card className="mx-auto max-w-xl p-6 sm:p-8">
      <Mono className="text-signal">Situation</Mono>
      <p className="mt-2 text-[16px] leading-relaxed text-ink-1">{prompt.situation}</p>

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={4}
        placeholder="Respond in English — don't translate from German in your head, just answer."
        className="mt-4 w-full resize-none rounded-xl border border-[var(--line-strong)] bg-surface-2 p-4 text-[14px] leading-relaxed text-ink-1 outline-none focus:border-signal"
      />

      {!revealed ? (
        <Button onClick={submit} disabled={!response.trim()} className="mt-3 w-full" size="lg">
          Submit response
        </Button>
      ) : (
        <>
          <div className="mt-5">
            <Mono className="text-ink-3">Useful phrases</Mono>
            <div className="mt-2 flex flex-col gap-2.5">
              {prompt.usefulPhrases.map((p) => (
                <div key={p.phrase} className="rounded-xl bg-surface-2/60 p-3.5">
                  <p className="text-[14px] font-medium text-ink-1">{p.phrase}</p>
                  <p className="mt-1 text-[12.5px] text-ink-3">{p.note}</p>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={next} variant="secondary" className="mt-5 w-full" size="lg">
            <RefreshCcw size={15} /> Next situation
          </Button>
        </>
      )}
    </Card>
  );
}

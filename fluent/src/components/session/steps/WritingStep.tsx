"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Mono, Badge } from "@/components/ui/Primitives";
import { ScoreGauge } from "@/components/ui/Charts";
import { StepCard, StepKicker } from "../StepChrome";
import { WRITING_TASKS } from "@/lib/content/writing";
import { analyzeWriting } from "@/lib/scoring";

const TASK = WRITING_TASKS.find((t) => t.id === "w-catch-up-message")!;

export function WritingStep({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeWriting> | null>(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <StepCard>
      <StepKicker>Writing</StepKicker>
      <Badge tone="signal">{TASK.minWords}–{TASK.maxWords} words</Badge>
      <h2 className="mt-3 text-[16px] font-medium text-ink-1">{TASK.prompt}</h2>

      {!result ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Start writing..."
            className="mt-4 w-full resize-none rounded-xl border border-[var(--line-strong)] bg-surface-2 p-4 text-[14px] leading-relaxed text-ink-1 outline-none focus:border-signal"
          />
          <div className="mt-2 flex items-center justify-between">
            <Mono className={wordCount >= TASK.minWords ? "text-mint" : "text-ink-3"}>{wordCount} words</Mono>
          </div>
          <Button onClick={() => setResult(analyzeWriting(text, TASK))} disabled={wordCount < 12} className="mt-3 w-full" size="lg">
            Submit
          </Button>
        </>
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <ScoreGauge label="Grammar" value={result.grammar} tone="mint" />
            <ScoreGauge label="Vocabulary" value={result.vocabulary} tone="signal" />
            <ScoreGauge label="Structure" value={result.structure} tone="signal" />
            <ScoreGauge label="Naturalness" value={result.naturalness} tone="amber" />
          </div>
          <div className="rounded-xl bg-surface-2/60 p-4">
            <Mono className="text-ink-3">Suggestions</Mono>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.suggestions.map((s) => (
                <li key={s} className="text-[13px] leading-relaxed text-ink-2">· {s}</li>
              ))}
            </ul>
          </div>
          <Button onClick={onComplete} size="lg">Continue</Button>
        </div>
      )}
    </StepCard>
  );
}

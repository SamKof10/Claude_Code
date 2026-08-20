"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { ScoreGauge } from "@/components/ui/Charts";
import { analyzeWriting } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { WRITING_TYPE_LABELS, type WritingTask } from "@/lib/content/writing";

export function WritingEditor({ task, onBack }: { task: WritingTask; onBack: () => void }) {
  const { markActivity, bumpSkill } = useStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeWriting> | null>(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const submit = () => {
    const r = analyzeWriting(text, task);
    setResult(r);
    markActivity("writing");
    bumpSkill("writing", 0.4);
  };

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3 hover:text-ink-1">
        <ArrowLeft size={14} /> All tasks
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="signal">{WRITING_TYPE_LABELS[task.type]}</Badge>
        <Badge>{task.minWords}–{task.maxWords} words</Badge>
      </div>
      <h2 className="mt-3 text-[16px] leading-relaxed font-medium text-ink-1">{task.prompt}</h2>

      <div className="mt-3 flex flex-col gap-1">
        {task.tips.map((tip) => (
          <p key={tip} className="text-[12.5px] text-ink-3">· {tip}</p>
        ))}
      </div>

      {!result ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Start writing..."
            className="mt-4 w-full resize-none rounded-xl border border-[var(--line-strong)] bg-surface-2 p-4 text-[14px] leading-relaxed text-ink-1 outline-none focus:border-signal"
          />
          <div className="mt-2 flex items-center justify-between">
            <Mono className={wordCount >= task.minWords && wordCount <= task.maxWords ? "text-mint" : "text-ink-3"}>{wordCount} words</Mono>
          </div>
          <Button onClick={submit} disabled={wordCount < 15} className="mt-3 w-full" size="lg">
            Submit for feedback
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

          {result.c1Features.length ? (
            <div>
              <Mono className="text-ink-3">C1 features detected</Mono>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.c1Features.map((f) => (
                  <span key={f} className="rounded-full border border-mint/30 bg-mint/[0.08] px-2.5 py-1 text-[12px] text-mint">{f}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl bg-surface-2/60 p-4">
            <Mono className="text-ink-3">Suggestions</Mono>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.suggestions.map((s) => (
                <li key={s} className="text-[13px] leading-relaxed text-ink-2">· {s}</li>
              ))}
            </ul>
          </div>

          <Button onClick={() => setResult(null)} variant="secondary" size="lg">
            Edit and resubmit
          </Button>
        </div>
      )}
    </Card>
  );
}

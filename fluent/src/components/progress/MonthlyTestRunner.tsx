"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { ScoreGauge } from "@/components/ui/Charts";
import { cn } from "@/components/ui/cn";
import { looseMatch } from "@/lib/utils";
import { analyzeWriting, type WritingAnalysis } from "@/lib/scoring";
import { buildMonthlyTest, type McqTestItem, type FixTestItem, type WriteTestItem } from "@/lib/content/monthlyTest";
import { useStore, levelAfterTest, type MonthlyTestRecord } from "@/lib/store";
import { MonthlyTestResults } from "./MonthlyTestResults";

function McqStep({ item, skillLabel, onDone }: { item: McqTestItem; skillLabel: string; onDone: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
      <Badge tone="signal">{skillLabel}</Badge>
      {item.context ? <p className="mt-3 rounded-xl bg-surface-2/60 p-4 text-[13px] leading-relaxed text-ink-2">{item.context}</p> : null}
      <p className="mt-3 text-[15px] leading-relaxed text-ink-1">{item.prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {item.options.map((opt, i) => {
          const isAnswer = i === item.answerIndex;
          const isSelected = i === selected;
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => {
                setSelected(i);
                setChecked(true);
              }}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition-colors",
                !checked && "border-[var(--line-strong)] text-ink-1 hover:border-signal/50 hover:bg-signal/5",
                checked && isAnswer && "border-mint/40 bg-mint/[0.08] text-mint",
                checked && isSelected && !isAnswer && "border-coral/40 bg-coral/[0.08] text-coral",
                checked && !isSelected && !isAnswer && "border-[var(--line)] text-ink-3",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {checked ? (
        <>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{item.explanation}</p>
          <Button onClick={() => onDone(selected === item.answerIndex)} className="mt-5 w-full" size="lg">
            Next
          </Button>
        </>
      ) : null}
    </Card>
  );
}

function GrammarStep({ item, onDone }: { item: FixTestItem; onDone: (correct: boolean) => void }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  const submit = () => {
    if (!value.trim()) return;
    setChecked(looseMatch(value, item.fixed));
  };

  return (
    <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
      <Badge tone="coral">Grammar</Badge>
      <p className="mt-3 rounded-xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-[14.5px] text-ink-1">{item.broken}</p>

      {checked === null ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type the corrected sentence..."
            className="h-12 flex-1 rounded-xl border border-[var(--line-strong)] bg-surface-2 px-4 text-[14.5px] text-ink-1 outline-none focus:border-signal"
          />
          <Button onClick={submit}>Check</Button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13.5px] font-medium",
              checked ? "border-mint/30 bg-mint/[0.07] text-mint" : "border-coral/30 bg-coral/[0.07] text-coral",
            )}
          >
            {checked ? <Check size={15} /> : <X size={15} />}
            {checked ? "Correct" : "Not quite"}
          </div>
          <div className="mt-3 rounded-xl bg-surface-2/60 p-4">
            <p className="text-[14px] font-medium text-mint">{item.fixed}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{item.explanation}</p>
          </div>
          <Button onClick={() => onDone(checked)} className="mt-5 w-full" size="lg">
            Next
          </Button>
        </>
      )}
    </Card>
  );
}

function WritingStep({ item, onDone }: { item: WriteTestItem; onDone: (analysis: WritingAnalysis) => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<WritingAnalysis | null>(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
      <Badge tone="mint">Writing</Badge>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-1">{item.task.prompt}</p>

      {!result ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Start writing..."
            className="mt-4 w-full resize-none rounded-xl border border-[var(--line-strong)] bg-surface-2 p-4 text-[14px] leading-relaxed text-ink-1 outline-none focus:border-signal"
          />
          <div className="mt-2 flex items-center justify-between">
            <Mono className={wordCount >= item.task.minWords ? "text-mint" : "text-ink-3"}>{wordCount} words</Mono>
          </div>
          <Button onClick={() => setResult(analyzeWriting(text, item.task))} disabled={wordCount < 15} className="mt-3 w-full" size="lg">
            Submit
          </Button>
        </>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <ScoreGauge label="Grammar" value={result.grammar} tone="mint" />
            <ScoreGauge label="Vocabulary" value={result.vocabulary} tone="signal" />
            <ScoreGauge label="Structure" value={result.structure} tone="signal" />
            <ScoreGauge label="Naturalness" value={result.naturalness} tone="amber" />
          </div>
          <Button onClick={() => onDone(result)} className="mt-5 w-full" size="lg">
            See results
          </Button>
        </>
      )}
    </Card>
  );
}

interface Tally {
  vocabCorrect: number;
  vocabTotal: number;
  grammarCorrect: number;
  grammarTotal: number;
  listeningCorrect: number;
  listeningTotal: number;
  writing: WritingAnalysis | null;
}

const EMPTY_TALLY: Tally = {
  vocabCorrect: 0,
  vocabTotal: 0,
  grammarCorrect: 0,
  grammarTotal: 0,
  listeningCorrect: 0,
  listeningTotal: 0,
  writing: null,
};

export function MonthlyTestRunner({ monthIndex }: { monthIndex: number }) {
  const { state, completeMonthlyTest } = useStore();
  const [items] = useState(() => buildMonthlyTest(monthIndex));
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);
  const [record, setRecord] = useState<MonthlyTestRecord | null>(null);
  const [previous, setPrevious] = useState<MonthlyTestRecord | null>(null);

  const finish = (t: Tally) => {
    const vocabularyScore = t.vocabTotal ? Math.round((t.vocabCorrect / t.vocabTotal) * 100) : 0;
    const grammarScore = t.grammarTotal ? Math.round((t.grammarCorrect / t.grammarTotal) * 100) : 0;
    const listeningScore = t.listeningTotal ? Math.round((t.listeningCorrect / t.listeningTotal) * 100) : 0;
    const writingScore = t.writing ? Math.round((t.writing.structure + t.writing.grammar + t.writing.vocabulary) / 3) : 0;
    const naturalnessScore = t.writing ? t.writing.naturalness : 0;
    const overallScore = Math.round((vocabularyScore + grammarScore + listeningScore + writingScore + naturalnessScore) / 5);
    const { level, leveledUp } = levelAfterTest(state.level, overallScore);

    const rec: MonthlyTestRecord = {
      date: new Date().toISOString().slice(0, 10),
      monthIndex,
      overallScore,
      skillScores: { vocabulary: vocabularyScore, grammar: grammarScore, listening: listeningScore, writing: writingScore, naturalness: naturalnessScore },
      level,
      leveledUp,
    };
    setPrevious(state.monthlyTests[0] ?? null);
    completeMonthlyTest(rec);
    setRecord(rec);
  };

  if (record) return <MonthlyTestResults record={record} previous={previous} />;

  const item = items[index];
  const advance = (patch: Partial<Tally>) => {
    const next = { ...tally, ...patch };
    setTally(next);
    if (index + 1 >= items.length) finish(next);
    else setIndex((i) => i + 1);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6 sm:px-8">
      <div className="flex items-center gap-4">
        <Link
          href="/progress"
          aria-label="Exit check-in"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink-1"
        >
          <X size={18} />
        </Link>
        <div className="flex flex-1 gap-1.5">
          {items.map((it, i) => (
            <span
              key={it.id}
              className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < index ? "bg-signal" : i === index ? "bg-signal/50" : "bg-surface-3")}
            />
          ))}
        </div>
        <Mono className="shrink-0 text-ink-3">
          {index + 1}/{items.length}
        </Mono>
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        {item.kind === "vocab" ? (
          <McqStep
            key={item.id}
            item={item}
            skillLabel="Vocabulary"
            onDone={(correct) => advance({ vocabCorrect: tally.vocabCorrect + (correct ? 1 : 0), vocabTotal: tally.vocabTotal + 1 })}
          />
        ) : null}
        {item.kind === "listening" ? (
          <McqStep
            key={item.id}
            item={item}
            skillLabel="Listening"
            onDone={(correct) => advance({ listeningCorrect: tally.listeningCorrect + (correct ? 1 : 0), listeningTotal: tally.listeningTotal + 1 })}
          />
        ) : null}
        {item.kind === "grammar" ? (
          <GrammarStep
            key={item.id}
            item={item}
            onDone={(correct) => advance({ grammarCorrect: tally.grammarCorrect + (correct ? 1 : 0), grammarTotal: tally.grammarTotal + 1 })}
          />
        ) : null}
        {item.kind === "writing" ? <WritingStep key={item.id} item={item} onDone={(analysis) => advance({ writing: analysis })} /> : null}
      </div>
    </div>
  );
}

"use client";

import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function QuestionView({
  question,
  index,
  total,
  answer,
  onAnswer,
  reveal,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  answer: string;
  onAnswer: (value: string) => void;
  reveal?: boolean;
}) {
  const isCorrect = (opt: string) => opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="outline">
          {index + 1}/{total}
        </Badge>
        <Badge variant="outline">{question.topic}</Badge>
        <Badge variant="outline">{question.type.replace("-", " ")}</Badge>
      </div>
      <h2 className="t-title-2 font-medium leading-snug text-ink text-pretty">{question.prompt}</h2>

      <div className="mt-5 space-y-2">
        {(question.type === "mcq" || question.type === "true-false") &&
          question.options?.map((opt) => {
            const selected = answer === opt;
            const showCorrect = reveal && isCorrect(opt);
            const showWrong = reveal && selected && !isCorrect(opt);
            return (
              <button
                key={opt}
                onClick={() => !reveal && onAnswer(opt)}
                disabled={reveal}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left t-body transition-colors",
                  selected && !reveal && "border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] text-ink",
                  !selected && !reveal && "border-border bg-surface-2 text-ink-2 hover:border-border-strong",
                  showCorrect && "border-success bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-ink",
                  showWrong && "border-danger bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-ink"
                )}
              >
                {opt}
              </button>
            );
          })}

        {(question.type === "short-answer" || question.type === "fill-blank") && (
          <Input
            placeholder={question.type === "fill-blank" ? "Fill in the blank…" : "Your answer…"}
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            disabled={reveal}
          />
        )}

        {reveal && (question.type === "short-answer" || question.type === "fill-blank") && (
          <p className="t-callout text-ink-3">
            Model answer: <span className="text-ink">{question.correctAnswer}</span>
          </p>
        )}
      </div>

      {reveal && <p className="mt-4 rounded-lg bg-surface-2 px-3.5 py-2.5 t-callout text-ink-2">{question.explanation}</p>}
    </div>
  );
}

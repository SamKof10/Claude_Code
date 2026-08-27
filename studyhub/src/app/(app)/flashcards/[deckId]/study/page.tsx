"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { isDue, type ReviewGrade } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";

const GRADES: { grade: ReviewGrade; label: string; hint: string; className: string }[] = [
  { grade: 1, label: "Again", hint: "1", className: "border-danger/40 text-danger-text hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]" },
  { grade: 2, label: "Difficult", hint: "2", className: "border-warning/40 text-warning-text hover:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]" },
  { grade: 3, label: "Good", hint: "3", className: "border-[var(--color-signal)]/40 text-[var(--color-signal-2)] hover:bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)]" },
  { grade: 4, label: "Easy", hint: "4", className: "border-success/40 text-success-text hover:bg-[color-mix(in_srgb,var(--success)_10%,transparent)]" },
];

export default function StudyModePage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const decks = useStudyStore((s) => s.decks);
  const flashcards = useStudyStore((s) => s.flashcards);
  const reviewFlashcard = useStudyStore((s) => s.reviewFlashcard);
  const logStudySession = useStudyStore((s) => s.logStudySession);

  const deck = decks.find((d) => d.id === params.deckId);
  const allCards = React.useMemo(() => flashcards.filter((c) => c.deckId === params.deckId), [flashcards, params.deckId]);
  const dueCards = React.useMemo(() => allCards.filter((c) => isDue(c)), [allCards]);
  // Queue is frozen on mount so reviewing a card (which pushes its next review
  // into the future) doesn't reshuffle the session under the student.
  // Most-overdue first — that's what spaced repetition actually wants.
  const [queue] = React.useState(() => {
    const source = dueCards.length > 0 ? dueCards : allCards;
    return [...source].sort((a, b) => +new Date(a.nextReview) - +new Date(b.nextReview)).map((c) => c.id);
  });

  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [results, setResults] = React.useState<ReviewGrade[]>([]);
  const startRef = React.useRef(0);

  React.useEffect(() => {
    startRef.current = Date.now();
  }, []);

  const cardId = queue[index];
  const card = allCards.find((c) => c.id === cardId);
  const done = index >= queue.length;

  const grade = React.useCallback(
    (g: ReviewGrade) => {
      if (!card || !revealed) return;
      reviewFlashcard(card.id, g);
      setResults((r) => [...r, g]);
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [card, revealed, reviewFlashcard]
  );

  React.useEffect(() => {
    if (done && queue.length > 0 && deck) {
      const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
      logStudySession({ subjectId: deck.subjectId, type: "flashcards", durationMinutes: minutes, relatedId: deck.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === " ") {
        e.preventDefault();
        setRevealed((r) => !r);
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        if (revealed) grade(Number(e.key) as ReviewGrade);
      } else if (e.key === "Escape") {
        router.push(deck ? `/flashcards/${deck.id}` : "/flashcards");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, revealed, grade, router, deck]);

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="t-body font-medium text-ink">Deck not found</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/flashcards">Back to flashcards</Link>
        </Button>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Nothing to study"
        description="This deck doesn't have any cards yet."
        action={
          <Button asChild>
            <Link href={`/flashcards/${deck.id}`}>Back to deck</Link>
          </Button>
        }
      />
    );
  }

  if (done) {
    const correct = results.filter((r) => r >= 3).length;
    const accuracy = Math.round((correct / results.length) * 100);
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl signal-gradient">
          <CheckCircle2 className="size-7 text-white" />
        </div>
        <h1 className="t-title font-semibold text-ink">Session complete</h1>
        <p className="mt-1.5 t-callout text-ink-3">
          You reviewed {results.length} card{results.length === 1 ? "" : "s"} from {deck.name}.
        </p>
        <div className="mt-6 grid w-full grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-lg font-semibold text-ink">{accuracy}%</p>
            <p className="t-caption text-ink-3">Accuracy</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-lg font-semibold text-ink">{results.filter((r) => r === 1).length}</p>
            <p className="t-caption text-ink-3">Again</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-lg font-semibold text-ink">{results.filter((r) => r === 4).length}</p>
            <p className="t-caption text-ink-3">Easy</p>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RotateCcw className="size-3.5" /> Study again
          </Button>
          <Button asChild>
            <Link href={`/flashcards/${deck.id}`}>Back to deck</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      <div className="mb-6 flex w-full items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/flashcards/${deck.id}`}>
            <X className="size-4" />
          </Link>
        </Button>
        <Progress value={((index + (revealed ? 0.5 : 0)) / queue.length) * 100} className="flex-1" />
        <span className="shrink-0 t-caption tabular-nums text-ink-3">
          {index + 1}/{queue.length}
        </span>
      </div>

      {/* The flip is a z-axis depth change, which HIG Accessibility calls out
          by name under Reduce Motion ("Avoiding animating depth changes in
          z-axis layers"). With it on, the two faces cross-fade in place. */}
      <div className="w-full" style={reduceMotion ? undefined : { perspective: 1200 }}>
        <motion.button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-live="polite"
          aria-label={revealed ? `Answer: ${card?.back}. Press to hide.` : `Question: ${card?.front}. Press to reveal the answer.`}
          className="relative flex h-72 w-full items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center shadow-xl focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] focus-visible:outline-none"
          animate={reduceMotion ? {} : { rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={reduceMotion ? undefined : { transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl p-8 transition-opacity duration-150"
            style={
              reduceMotion
                ? { opacity: revealed ? 0 : 1, pointerEvents: "none" }
                : { backfaceVisibility: "hidden" }
            }
          >
            <span className="mono-label">Question</span>
            <p className="t-title font-medium text-ink text-balance">{card?.front}</p>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-surface-2 p-8 transition-opacity duration-150"
            style={
              reduceMotion
                ? { opacity: revealed ? 1 : 0, pointerEvents: "none" }
                : { backfaceVisibility: "hidden", transform: "rotateY(180deg)" }
            }
          >
            <span className="mono-label">Answer</span>
            <p className="t-title-2 font-normal leading-relaxed text-ink text-pretty">{card?.back}</p>
          </div>
        </motion.button>
      </div>

      <p className="mt-4 t-caption text-ink-3">
        Press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">Space</kbd> to flip
      </p>

      <div className="mt-6 grid w-full grid-cols-4 gap-2">
        {GRADES.map((g) => (
          <button
            key={g.grade}
            onClick={() => grade(g.grade)}
            disabled={!revealed}
            className={`flex flex-col items-center gap-1 rounded-xl border bg-surface px-3 py-3 t-callout font-medium transition-colors disabled:pointer-events-none disabled:opacity-30 ${g.className}`}
          >
            {g.label}
            <kbd className="t-caption text-ink-3">{g.hint}</kbd>
          </button>
        ))}
      </div>
    </div>
  );
}

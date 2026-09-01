"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSearch, Layers3, ListChecks, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { aiDocumentQA, AIClientError, aiExplain, aiFlashcards, aiQuiz, aiSummarize } from "@/lib/ai/client";
import { htmlToText } from "@/lib/html-to-text";
import type { Note, QuizQuestion, QuizQuestionType } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Markdown } from "@/components/shared/markdown";
import { AIErrorCaveat, AIFeedback, AISourceBadge } from "@/components/shared/ai-disclosure";
import { Button } from "@/components/ui/button";

type Kind = "improve" | "summarize" | "explain" | "flashcards" | "quiz" | "missing";

interface Turn {
  id: string;
  kind: Kind;
  status: "loading" | "done" | "error";
  source?: "live" | "demo";
  errorMessage?: string;
  text?: string;
  keyPoints?: string[];
  cards?: { front: string; back: string }[];
  questions?: QuizQuestion[];
}

const ACTIONS: { kind: Kind; label: string; icon: React.ElementType }[] = [
  { kind: "improve", label: "Notizen verbessern", icon: Wand2 },
  { kind: "summarize", label: "Zusammenfassen", icon: Sparkles },
  { kind: "explain", label: "Erklären", icon: FileSearch },
  { kind: "flashcards", label: "Karteikarten anlegen", icon: Layers3 },
  { kind: "quiz", label: "Quiz erzeugen", icon: ListChecks },
  { kind: "missing", label: "Lücken finden", icon: FileSearch },
];

export function NoteAIPanel({ note }: { note: Note }) {
  const router = useRouter();
  const addDeck = useStudyStore((s) => s.addDeck);
  const addFlashcard = useStudyStore((s) => s.addFlashcard);
  const addQuiz = useStudyStore((s) => s.addQuiz);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const busy = turns.some((t) => t.status === "loading");

  function patch(id: string, p: Partial<Turn>) {
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }

  async function run(kind: Kind) {
    const plainText = htmlToText(note.contentHTML);
    if (!plainText) {
      toast.error("Schreib zuerst ein bisschen was — die KI hat sonst nichts zum Arbeiten.");
      return;
    }
    const id = uid("turn");
    setTurns((prev) => [...prev, { id, kind, status: "loading" }]);
    try {
      if (kind === "summarize") {
        const { data, source } = await aiSummarize(plainText, note.title);
        patch(id, { status: "done", source, text: data.summary, keyPoints: data.keyPoints });
      } else if (kind === "explain") {
        const { data, source } = await aiExplain(note.title, plainText, "normal");
        patch(id, { status: "done", source, text: data.explanation });
      } else if (kind === "improve") {
        const { data, source } = await aiDocumentQA(
          "Suggest specific, concrete improvements to make these notes clearer, better organized and more complete. Use a short bulleted list.",
          plainText,
          note.title
        );
        patch(id, { status: "done", source, text: data.answer });
      } else if (kind === "missing") {
        const { data, source } = await aiDocumentQA(
          "What important information seems missing, unclear or incomplete in these notes? List specific gaps as bullet points.",
          plainText,
          note.title
        );
        patch(id, { status: "done", source, text: data.answer });
      } else if (kind === "flashcards") {
        const { data, source } = await aiFlashcards(plainText, note.title, 8);
        patch(id, { status: "done", source, cards: data.cards });
      } else if (kind === "quiz") {
        const { data, source } = await aiQuiz({
          content: plainText,
          sourceName: note.title,
          topics: note.tags,
          count: 6,
          difficulty: "medium",
          questionTypes: ["mcq", "true-false", "short-answer"],
          timeLimitMinutes: null,
        });
        patch(id, { status: "done", source, questions: data.questions });
      }
      spendAICredits(kind === "flashcards" || kind === "quiz" ? 3 : 1);
    } catch (err) {
      patch(id, { status: "error", errorMessage: err instanceof AIClientError ? err.message : "Etwas ist schiefgelaufen. Versuch es bitte nochmal." });
    }
  }

  function saveFlashcards(cards: { front: string; back: string }[]) {
    const deck = addDeck({ subjectId: note.subjectId, name: `${note.title} — flashcards`, description: `Generated from note "${note.title}"`, sourceNoteId: note.id });
    cards.forEach((c) => addFlashcard({ deckId: deck.id, front: c.front, back: c.back }));
    toast.success(`${cards.length} Karteikarten gespeichert`, { action: { label: "Jetzt lernen", onClick: () => router.push(`/flashcards/${deck.id}/study`) } });
  }

  function saveQuiz(questions: QuizQuestion[] | undefined) {
    if (!questions) return;
    const quiz = addQuiz({
      subjectId: note.subjectId,
      title: `${note.title} — quiz`,
      topics: [...new Set(questions.map((q) => q.topic))],
      difficulty: "medium",
      questionTypes: [...new Set(questions.map((q) => q.type))] as QuizQuestionType[],
      timeLimitMinutes: null,
      questions,
    });
    toast.success("Quiz gespeichert", { action: { label: "Quiz starten", onClick: () => router.push(`/quizzes/${quiz.id}`) } });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-lg signal-gradient">
          <Sparkles className="size-3.5 text-white" />
        </div>
        <div>
          <p className="t-callout font-semibold text-ink">AI actions</p>
          <p className="t-caption text-ink-3">Works on this note&apos;s content</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {turns.length === 0 && <p className="t-callout text-ink-3">Pick an action below to get help with this note.</p>}
        {turns.map((t) => (
          <TurnCard key={t.id} turn={t} onSaveFlashcards={saveFlashcards} onSaveQuiz={saveQuiz} />
        ))}
      </div>

      <div className="border-t border-border px-3 pt-2.5">
        <AIErrorCaveat />
      </div>
      <div className="grid grid-cols-2 gap-1.5 px-3 pb-3 pt-2.5">
        {ACTIONS.map((a) => (
          <Button key={a.kind} variant="secondary" size="sm" disabled={busy} onClick={() => run(a.kind)} className="justify-start gap-1.5">
            <a.icon className="size-3.5" /> {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function TurnCard({
  turn,
  onSaveFlashcards,
  onSaveQuiz,
}: {
  turn: Turn;
  onSaveFlashcards: (cards: { front: string; back: string }[]) => void;
  onSaveQuiz: (q: QuizQuestion[] | undefined) => void;
}) {
  const meta = ACTIONS.find((a) => a.kind === turn.kind)!;

  if (turn.status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-3 t-callout text-ink-3">
        <Loader2 className="size-3.5 animate-spin" /> {meta.label}…
      </div>
    );
  }
  if (turn.status === "error") {
    return <div className="rounded-xl border border-danger/30 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-3 t-callout text-danger-text">{turn.errorMessage}</div>;
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="mb-2 flex items-center gap-1.5">
        <meta.icon className="size-3.5 text-[var(--color-signal-2)]" />
        <span className="t-caption font-medium text-ink-2">{meta.label}</span>
        <AISourceBadge source={turn.source} className="ml-auto" />
      </div>

      {turn.text && <Markdown>{turn.text}</Markdown>}
      {turn.text && <AIFeedback className="mt-1.5 -ml-1" />}
      {turn.keyPoints && turn.keyPoints.length > 0 && (
        <ul className="mt-2 space-y-1 t-callout text-ink-2">
          {turn.keyPoints.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-3" />
              {p}
            </li>
          ))}
        </ul>
      )}

      {turn.cards && (
        <div className="space-y-2.5">
          <div className="space-y-2">
            {turn.cards.slice(0, 3).map((c, i) => (
              <div key={i} className="rounded-lg bg-surface-2 px-3 py-2">
                <p className="t-callout font-medium text-ink">{c.front}</p>
                <p className="mt-0.5 t-caption text-ink-3">{c.back}</p>
              </div>
            ))}
            {turn.cards.length > 3 && <p className="t-caption text-ink-3">+{turn.cards.length - 3} more</p>}
          </div>
          <Button size="sm" onClick={() => onSaveFlashcards(turn.cards!)}>
            <Layers3 className="size-3.5" /> Save {turn.cards.length} cards
          </Button>
        </div>
      )}

      {turn.questions && (
        <div className="space-y-2.5">
          <ul className="space-y-1.5">
            {turn.questions.slice(0, 4).map((q) => (
              <li key={q.id} className="t-callout text-ink-2">
                {q.prompt}
              </li>
            ))}
          </ul>
          <Button size="sm" onClick={() => onSaveQuiz(turn.questions)}>
            <ListChecks className="size-3.5" /> Save quiz ({turn.questions.length})
          </Button>
        </div>
      )}
    </div>
  );
}

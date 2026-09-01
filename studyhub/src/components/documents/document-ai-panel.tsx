"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarClock,
  Lightbulb,
  Layers3,
  ListChecks,
  Loader2,
  Send,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { aiConcepts, aiExplain, aiFlashcards, AIClientError, aiDocumentQA, aiQuiz, aiStudyPlan, aiSummarize } from "@/lib/ai/client";
import type { QuizQuestion, QuizQuestionType, StudyDocument } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Markdown } from "@/components/shared/markdown";
import { AIDataNotice, AIErrorCaveat, AIFeedback, AISourceBadge, useAILiveStatus } from "@/components/shared/ai-disclosure";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type TurnKind = "summarize" | "explain" | "flashcards" | "quiz" | "concepts" | "studyplan" | "qa";

interface Turn {
  id: string;
  kind: TurnKind;
  question?: string;
  status: "loading" | "done" | "error";
  source?: "live" | "demo";
  errorMessage?: string;
  summary?: { summary: string; keyPoints: string[] };
  explanation?: string;
  concepts?: { term: string; definition: string }[];
  cards?: { front: string; back: string }[];
  questions?: QuizQuestion[];
  weeks?: { label: string; topics: string[]; focus: string }[];
  answer?: string;
}

/** Default horizon for the ad-hoc "create study plan" action on a document. */
function twoWeeksFromNow(): string {
  return new Date(Date.now() + 14 * 86_400_000).toISOString();
}

const ACTIONS: { kind: TurnKind; label: string; icon: React.ElementType }[] = [
  { kind: "summarize", label: "Zusammenfassen", icon: Sparkles },
  { kind: "explain", label: "Einfach erklären", icon: Wand2 },
  { kind: "flashcards", label: "Karteikarten erzeugen", icon: Layers3 },
  { kind: "quiz", label: "Quiz erzeugen", icon: ListChecks },
  { kind: "concepts", label: "Kernbegriffe finden", icon: Lightbulb },
  { kind: "studyplan", label: "Lernplan erstellen", icon: CalendarClock },
];

export function DocumentAIPanel({ document }: { document: StudyDocument }) {
  const router = useRouter();
  const subjects = useStudyStore((s) => s.subjects);
  const addDeck = useStudyStore((s) => s.addDeck);
  const addFlashcard = useStudyStore((s) => s.addFlashcard);
  const addQuiz = useStudyStore((s) => s.addQuiz);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);
  const logStudySession = useStudyStore((s) => s.logStudySession);

  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [question, setQuestion] = React.useState("");
  const busy = turns.some((t) => t.status === "loading");
  const subject = subjects.find((s) => s.id === document.subjectId);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const aiLive = useAILiveStatus();

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  function patchTurn(id: string, patch: Partial<Turn>) {
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function runAction(kind: TurnKind, question?: string) {
    const id = uid("turn");
    setTurns((prev) => [...prev, { id, kind, question, status: "loading" }]);
    logStudySession({ subjectId: document.subjectId, type: "document", durationMinutes: 2, relatedId: document.id });
    try {
      switch (kind) {
        case "summarize": {
          const { data, source } = await aiSummarize(document.content, document.name);
          patchTurn(id, { status: "done", source, summary: data });
          break;
        }
        case "explain": {
          const { data, source } = await aiExplain(`the content of "${document.name}"`, document.content, "simple");
          patchTurn(id, { status: "done", source, explanation: data.explanation });
          break;
        }
        case "concepts": {
          const { data, source } = await aiConcepts(document.content);
          patchTurn(id, { status: "done", source, concepts: data.concepts });
          break;
        }
        case "flashcards": {
          const { data, source } = await aiFlashcards(document.content, document.name, 10);
          patchTurn(id, { status: "done", source, cards: data.cards });
          break;
        }
        case "quiz": {
          const { data, source } = await aiQuiz({
            content: document.content,
            sourceName: document.name,
            topics: document.tags,
            count: 8,
            difficulty: "medium",
            questionTypes: ["mcq", "true-false", "short-answer"],
            timeLimitMinutes: 10,
          });
          patchTurn(id, { status: "done", source, questions: data.questions });
          break;
        }
        case "studyplan": {
          const { data, source } = await aiStudyPlan({
            subjectName: subject?.name ?? "Dieses Fach",
            examTitle: `${document.name} — Wiederholung`,
            examDate: twoWeeksFromNow(),
            topics: document.tags.length ? document.tags : [document.name],
            currentLevel: "intermediate",
            availableHoursPerWeek: 4,
            createdAt: new Date().toISOString(),
          });
          patchTurn(id, { status: "done", source, weeks: data.weeks });
          break;
        }
        case "qa": {
          const { data, source } = await aiDocumentQA(question ?? "", document.content, document.name);
          patchTurn(id, { status: "done", source, answer: data.answer });
          break;
        }
      }
      spendAICredits(kind === "flashcards" || kind === "quiz" ? 3 : 1);
    } catch (err) {
      patchTurn(id, { status: "error", errorMessage: err instanceof AIClientError ? err.message : "Etwas ist schiefgelaufen. Versuch es bitte nochmal." });
    }
  }

  function saveFlashcards(cards: { front: string; back: string }[]) {
    const deck = addDeck({ subjectId: document.subjectId, name: `${document.name} — Karteikarten`, description: `Erzeugt aus ${document.name}`, sourceDocumentId: document.id });
    cards.forEach((c) => addFlashcard({ deckId: deck.id, front: c.front, back: c.back }));
    toast.success(`${cards.length} Karteikarten gespeichert`, { action: { label: "Jetzt lernen", onClick: () => router.push(`/flashcards/${deck.id}/study`) } });
  }

  function saveQuiz(questions: QuizQuestion[] | undefined) {
    if (!questions) return;
    const quiz = addQuiz({
      subjectId: document.subjectId,
      documentId: document.id,
      title: `${document.name} — quiz`,
      topics: [...new Set(questions.map((q) => q.topic))],
      difficulty: "medium",
      questionTypes: [...new Set(questions.map((q) => q.type))] as QuizQuestionType[],
      timeLimitMinutes: 10,
      questions,
    });
    toast.success("Quiz gespeichert", { action: { label: "Quiz starten", onClick: () => router.push(`/quizzes/${quiz.id}`) } });
  }

  function submitQuestion() {
    const q = question.trim();
    if (!q || busy) return;
    setQuestion("");
    void runAction("qa", q);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-lg signal-gradient">
          <Sparkles className="size-3.5 text-white" />
        </div>
        <div>
          <p className="t-callout font-semibold text-ink">AI Assistant</p>
          <p className="t-caption text-ink-3">Basiert auf diesem Dokument</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {turns.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-4 t-callout text-ink-3">
              Stell eine Frage zu &bdquo;{document.name}&ldquo; oder nimm eine Aktion unten — zusammenfassen, einfach erklären lassen oder Karteikarten und ein Quiz daraus machen.
              <AIDataNotice live={aiLive === true} what="Der Text dieses Dokuments" className="mt-2.5" />
            </div>
          )}
          {turns.map((turn) => (
            <TurnView key={turn.id} turn={turn} onSaveFlashcards={saveFlashcards} onSaveQuiz={saveQuiz} />
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <AIErrorCaveat className="mb-2.5" />
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {ACTIONS.map((a) => (
            <Button key={a.kind} variant="secondary" size="sm" disabled={busy} onClick={() => runAction(a.kind)} className="gap-1.5">
              <a.icon className="size-3.5" /> {a.label}
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Frag irgendetwas zu diesem Dokument…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitQuestion();
              }
            }}
            rows={1}
            className="min-h-9 resize-none py-2"
          />
          <Button size="icon" onClick={submitQuestion} disabled={busy || !question.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TurnHeader({ icon: Icon, label, source }: { icon: React.ElementType; label: string; source?: "live" | "demo" }) {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <Icon className="size-3.5 text-[var(--color-signal-2)]" />
      <span className="t-caption font-medium text-ink-2">{label}</span>
      <AISourceBadge source={source} className="ml-auto" />
    </div>
  );
}

function TurnView({
  turn,
  onSaveFlashcards,
  onSaveQuiz,
}: {
  turn: Turn;
  onSaveFlashcards: (cards: { front: string; back: string }[]) => void;
  onSaveQuiz: (questions: QuizQuestion[] | undefined) => void;
}) {
  if (turn.status === "loading") {
    const meta = ACTIONS.find((a) => a.kind === turn.kind);
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-3 t-callout text-ink-3">
        <Loader2 className="size-3.5 animate-spin" /> {turn.kind === "qa" ? "Thinking…" : `${meta?.label ?? "Working"}…`}
      </div>
    );
  }

  if (turn.status === "error") {
    return <div className="rounded-xl border border-danger/30 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-3 t-callout text-danger-text">{turn.errorMessage}</div>;
  }

  if (turn.kind === "qa") {
    return (
      <div className="space-y-2.5">
        <div className="flex items-start gap-2 rounded-xl bg-surface-2 px-3.5 py-2.5">
          <User className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
          <p className="t-callout text-ink">{turn.question}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3.5">
          <TurnHeader icon={Sparkles} label="Antwort" source={turn.source} />
          <Markdown>{turn.answer ?? ""}</Markdown>
          <AIFeedback className="mt-1.5 -ml-1" />
        </div>
      </div>
    );
  }

  const meta = ACTIONS.find((a) => a.kind === turn.kind)!;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <TurnHeader icon={meta.icon} label={meta.label} source={turn.source} />

      {turn.kind === "summarize" && turn.summary && (
        <div className="space-y-3">
          <Markdown>{turn.summary.summary}</Markdown>
          {turn.summary.keyPoints.length > 0 && (
            <ul className="space-y-1.5 t-callout text-ink-2">
              {turn.summary.keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-3" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {turn.kind === "explain" && turn.explanation && <Markdown>{turn.explanation}</Markdown>}

      {turn.kind === "concepts" && turn.concepts && (
        <div className="space-y-2">
          {turn.concepts.map((c, i) => (
            <div key={i} className="rounded-lg bg-surface-2 px-3 py-2">
              <p className="t-callout font-semibold text-ink">{c.term}</p>
              <p className="t-callout text-ink-2">{c.definition}</p>
            </div>
          ))}
        </div>
      )}

      {turn.kind === "flashcards" && turn.cards && (
        <div className="space-y-3">
          <div className="space-y-2">
            {turn.cards.slice(0, 4).map((c, i) => (
              <div key={i} className="rounded-lg bg-surface-2 px-3 py-2">
                <p className="t-callout font-medium text-ink">{c.front}</p>
                <p className="mt-0.5 t-caption text-ink-3">{c.back}</p>
              </div>
            ))}
            {turn.cards.length > 4 && <p className="t-caption text-ink-3">+{turn.cards.length - 4} weitere</p>}
          </div>
          <Button size="sm" onClick={() => onSaveFlashcards(turn.cards!)}>
            <Layers3 className="size-3.5" /> {turn.cards.length} Karten in einen Stapel speichern
          </Button>
        </div>
      )}

      {turn.kind === "quiz" && turn.questions && (
        <div className="space-y-3">
          <ul className="space-y-1.5">
            {turn.questions.slice(0, 5).map((q) => (
              <li key={q.id} className="flex items-start gap-2 t-callout text-ink-2">
                <Badge variant="outline" className="mt-0.5 shrink-0">
                  {q.type}
                </Badge>
                {q.prompt}
              </li>
            ))}
          </ul>
          <Button size="sm" onClick={() => onSaveQuiz(turn.questions)}>
            <ListChecks className="size-3.5" /> Quiz speichern ({turn.questions.length} Fragen)
          </Button>
        </div>
      )}

      {turn.kind === "studyplan" && turn.weeks && (
        <div className="space-y-2">
          {turn.weeks.map((w, i) => (
            <div key={i} className="rounded-lg bg-surface-2 px-3 py-2">
              <p className="t-callout font-semibold text-ink">{w.label}</p>
              <p className="t-caption text-ink-2">{w.topics.join(", ")}</p>
              <p className="mt-0.5 t-caption text-ink-3">{w.focus}</p>
            </div>
          ))}
          <p className="t-caption text-ink-3">Head to Exams to turn this into a full, trackable prep timeline.</p>
        </div>
      )}
    </div>
  );
}

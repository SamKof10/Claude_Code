"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ListChecks, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { aiFlashcards, AIClientError } from "@/lib/ai/client";
import { QuestionView } from "@/components/quizzes/question-view";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function QuizDetailPage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const subjects = useStudyStore((s) => s.subjects);
  const quizzes = useStudyStore((s) => s.quizzes);
  const startQuiz = useStudyStore((s) => s.startQuiz);
  const answerQuizQuestion = useStudyStore((s) => s.answerQuizQuestion);
  const completeQuiz = useStudyStore((s) => s.completeQuiz);
  const addQuiz = useStudyStore((s) => s.addQuiz);
  const addDeck = useStudyStore((s) => s.addDeck);
  const addFlashcard = useStudyStore((s) => s.addFlashcard);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);
  const logStudySession = useStudyStore((s) => s.logStudySession);

  const quiz = quizzes.find((q) => q.id === params.quizId);
  const subject = quiz?.subjectId ? subjects.find((s) => s.id === quiz.subjectId) : null;
  const [index, setIndex] = React.useState(0);
  const [nowMs, setNowMs] = React.useState<number | null>(null);
  const [revisionLoading, setRevisionLoading] = React.useState(false);
  const loggedRef = React.useRef(false);

  const submit = React.useCallback(() => {
    if (!quiz) return;
    completeQuiz(quiz.id);
    if (!loggedRef.current) {
      loggedRef.current = true;
      logStudySession({ subjectId: quiz.subjectId, type: "quiz", durationMinutes: Math.max(2, quiz.questions.length * 1.5), relatedId: quiz.id });
    }
  }, [quiz, completeQuiz, logStudySession]);

  // The countdown is derived from a ticking clock rather than stored directly,
  // so no state is written during render or synchronously inside an effect.
  const timedRun = quiz?.status === "in-progress" && quiz.timeLimitMinutes != null && quiz.startedAt != null;
  const startedMs = timedRun ? new Date(quiz.startedAt as string).getTime() : null;
  const deadlineMs = timedRun && startedMs != null ? startedMs + (quiz.timeLimitMinutes as number) * 60_000 : null;

  React.useEffect(() => {
    if (!timedRun) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timedRun]);

  // Before the first tick lands, fall back to the start time so the badge
  // shows the full limit instead of flashing a wrong value.
  const remainingSec =
    deadlineMs == null ? null : Math.max(0, Math.round((deadlineMs - (nowMs ?? startedMs ?? 0)) / 1000));

  React.useEffect(() => {
    if (remainingSec === 0) submit();
  }, [remainingSec, submit]);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="text-[14px] font-medium text-ink">Quiz not found</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/quizzes">
            <ArrowLeft className="size-3.5" /> Back to quizzes
          </Link>
        </Button>
      </div>
    );
  }

  async function generateRevisionDeck() {
    if (!quiz || !quiz.weakTopics?.length) return;
    setRevisionLoading(true);
    try {
      const missed = quiz.questions.filter((q) => quiz.weakTopics!.includes(q.topic));
      const content = missed.map((q) => `${q.prompt} ${q.explanation}`).join(" ");
      const { data } = await aiFlashcards(content, quiz.title, Math.min(10, Math.max(4, missed.length * 2)));
      const deck = addDeck({ subjectId: quiz.subjectId, name: `${quiz.title} — revision`, description: `Weak topics: ${quiz.weakTopics!.join(", ")}` });
      data.cards.forEach((c) => addFlashcard({ deckId: deck.id, front: c.front, back: c.back }));
      spendAICredits(3);
      toast.success("Revision deck created", { action: { label: "Study now", onClick: () => router.push(`/flashcards/${deck.id}/study`) } });
    } catch (err) {
      toast.error(err instanceof AIClientError ? err.message : "Couldn't create a revision deck. Try again.");
    } finally {
      setRevisionLoading(false);
    }
  }

  function retake() {
    if (!quiz) return;
    const fresh = addQuiz({
      subjectId: quiz.subjectId,
      documentId: quiz.documentId,
      title: quiz.title,
      topics: quiz.topics,
      difficulty: quiz.difficulty,
      questionTypes: quiz.questionTypes,
      timeLimitMinutes: quiz.timeLimitMinutes,
      questions: quiz.questions,
    });
    router.push(`/quizzes/${fresh.id}`);
  }

  // ── Draft: overview + start ──────────────────────────────────────
  if (quiz.status === "draft") {
    return (
      <div className="mx-auto max-w-xl">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/quizzes">
            <ArrowLeft className="size-3.5" /> Back
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl signal-gradient">
              <ListChecks className="size-6 text-white" />
            </div>
            <h1 className="text-[19px] font-semibold text-ink">{quiz.title}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {subject && <SubjectPill subject={subject} />}
              <Badge variant="outline">{quiz.questions.length} questions</Badge>
              <Badge variant="outline">{quiz.difficulty}</Badge>
              {quiz.timeLimitMinutes && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="size-2.5" /> {quiz.timeLimitMinutes} min
                </Badge>
              )}
            </div>
            {quiz.topics.length > 0 && <p className="mt-3 text-[12.5px] text-ink-3">Topics: {quiz.topics.join(", ")}</p>}
            <Button className="mt-6 w-full" onClick={() => startQuiz(quiz.id)}>
              Start quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── In progress: take the quiz ───────────────────────────────────
  if (quiz.status === "in-progress") {
    const q = quiz.questions[index];
    const isLast = index === quiz.questions.length - 1;
    const answered = Object.keys(quiz.answers).length;

    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center gap-3">
          <Progress value={((index + 1) / quiz.questions.length) * 100} className="flex-1" />
          {remainingSec != null && (
            <Badge variant={remainingSec < 60 ? "danger" : "outline"} className="gap-1 shrink-0">
              <Clock className="size-2.5" /> {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <QuestionView question={q} index={index} total={quiz.questions.length} answer={quiz.answers[q.id] ?? ""} onAnswer={(v) => answerQuizQuestion(quiz.id, q.id, v)} />
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            <ArrowLeft className="size-3.5" /> Previous
          </Button>
          <span className="text-[12px] text-ink-3">{answered}/{quiz.questions.length} answered</span>
          {isLast ? (
            <Button onClick={submit}>Submit quiz</Button>
          ) : (
            <Button onClick={() => setIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}>
              Next <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Completed: results ───────────────────────────────────────────
  const correctCount = quiz.questions.filter((q) => (quiz.answers[q.id] ?? "").trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()).length;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/quizzes">
          <ArrowLeft className="size-3.5" /> Back to quizzes
        </Link>
      </Button>

      <Card className="mb-5">
        <CardContent className="pt-6 text-center">
          <p className="mono-label">Your score</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">{quiz.score}%</p>
          <p className="mt-1 text-[13px] text-ink-3">
            {correctCount} of {quiz.questions.length} correct
          </p>
          {quiz.weakTopics && quiz.weakTopics.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[12px] text-ink-3">Focus on:</span>
              {quiz.weakTopics.map((t) => (
                <Badge key={t} variant="warning">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={retake}>
              <RotateCcw className="size-3.5" /> Retake
            </Button>
            {quiz.weakTopics && quiz.weakTopics.length > 0 && (
              <Button onClick={generateRevisionDeck} disabled={revisionLoading}>
                {revisionLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} Create revision deck
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {quiz.questions.map((q, i) => {
          const given = quiz.answers[q.id] ?? "";
          const correct = given.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          return (
            <Card key={q.id}>
              <CardContent className="pt-5">
                <div className="mb-2 flex items-start gap-2">
                  {correct ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-ink">
                      {i + 1}. {q.prompt}
                    </p>
                    <p className="mt-1 text-[12.5px] text-ink-3">
                      Your answer: <span className={correct ? "text-success" : "text-danger"}>{given || "—"}</span>
                    </p>
                    {!correct && (
                      <p className="text-[12.5px] text-ink-3">
                        Correct: <span className="text-ink">{q.correctAnswer}</span>
                      </p>
                    )}
                    <p className="mt-1.5 text-[12px] text-ink-3">{q.explanation}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {q.topic}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { aiQuiz, AIClientError } from "@/lib/ai/client";
import type { Difficulty, QuizQuestionType } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: "mcq", label: "Multiple choice" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Short answer" },
  { value: "fill-blank", label: "Fill in the blank" },
];

export default function NewQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const documents = useStudyStore((s) => s.documents);
  const notes = useStudyStore((s) => s.notes);
  const addQuiz = useStudyStore((s) => s.addQuiz);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);

  const [subjectId, setSubjectId] = React.useState(searchParams.get("subject") ?? subjects[0]?.id ?? "");
  const [sourceKind, setSourceKind] = React.useState<"topic" | "document" | "note">("topic");
  const [sourceId, setSourceId] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [count, setCount] = React.useState("8");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");
  const [types, setTypes] = React.useState<QuizQuestionType[]>(["mcq", "true-false"]);
  const [timeLimit, setTimeLimit] = React.useState("10");
  const [loading, setLoading] = React.useState(false);

  const subjectDocs = documents.filter((d) => d.subjectId === subjectId);
  const subjectNotes = notes.filter((n) => n.subjectId === subjectId);

  function toggleType(t: QuizQuestionType) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function generate() {
    const subject = subjects.find((s) => s.id === subjectId);
    let content = "";
    let sourceName = "";
    let documentId: string | undefined;

    if (sourceKind === "document") {
      const doc = documents.find((d) => d.id === sourceId);
      if (!doc) return;
      content = doc.content;
      sourceName = doc.name;
      documentId = doc.id;
    } else if (sourceKind === "note") {
      const note = notes.find((n) => n.id === sourceId);
      if (!note) return;
      content = note.contentHTML.replace(/<[^>]+>/g, " ");
      sourceName = note.title;
    } else {
      if (!topic.trim()) return;
      content = `${topic}. ${detail}`;
      sourceName = topic;
    }

    if (types.length === 0) {
      toast.error("Pick at least one question type.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await aiQuiz({
        content,
        sourceName,
        topics: subject ? [subject.name] : [],
        count: Number(count),
        difficulty,
        questionTypes: types,
        timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
      });
      const quiz = addQuiz({
        subjectId: subjectId || null,
        documentId,
        title: `${sourceName || subject?.name || "Quiz"}`,
        topics: [...new Set(data.questions.map((q) => q.topic))],
        difficulty,
        questionTypes: types,
        timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
        questions: data.questions,
      });
      spendAICredits(3);
      router.push(`/quizzes/${quiz.id}`);
    } catch (err) {
      toast.error(err instanceof AIClientError ? err.message : "Couldn't generate the quiz. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Generate a quiz" description="Choose what to be quizzed on, and how." />

      <Card>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setSourceId(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Quiz me on</Label>
            <ToggleGroup type="single" value={sourceKind} onValueChange={(v) => v && setSourceKind(v as never)} className="w-full">
              <ToggleGroupItem value="topic" className="flex-1">
                A topic
              </ToggleGroupItem>
              <ToggleGroupItem value="document" className="flex-1">
                A document
              </ToggleGroupItem>
              <ToggleGroupItem value="note" className="flex-1">
                A note
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {sourceKind === "topic" && (
            <>
              <div className="space-y-1.5">
                <Label>Topic</Label>
                <Input placeholder="e.g. The Krebs cycle" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Details (optional)</Label>
                <Textarea rows={3} placeholder="Paste notes or describe what to focus on…" value={detail} onChange={(e) => setDetail(e.target.value)} />
              </div>
            </>
          )}

          {sourceKind === "document" && (
            <div className="space-y-1.5">
              <Label>Document</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a document" />
                </SelectTrigger>
                <SelectContent>
                  {subjectDocs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {sourceKind === "note" && (
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a note" />
                </SelectTrigger>
                <SelectContent>
                  {subjectNotes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Number of questions</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "8", "10", "15", "20"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Question types</Label>
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_TYPES.map((t) => (
                <label key={t.value} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-ink-2">
                  <Checkbox checked={types.includes(t.value)} onCheckedChange={() => toggleType(t.value)} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Time limit (minutes, optional)</Label>
            <Input type="number" min={0} placeholder="No limit" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="w-32" />
          </div>

          <Button className="w-full" onClick={generate} disabled={loading || !subjectId}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Generating…" : "Generate quiz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

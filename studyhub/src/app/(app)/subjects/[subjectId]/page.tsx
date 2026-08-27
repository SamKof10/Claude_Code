"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  GraduationCap,
  Layers3,
  ListChecks,
  NotebookPen,
  Pencil,
  Plus,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useStudyStore } from "@/lib/store";
import {
  examReadiness,
  subjectLastActivity,
  subjectPerformances,
  subjectStudyMinutes,
  subjectWeakTopics,
  quizScoreSeries,
  dailyStudyMinutes,
} from "@/lib/analytics";
import { confidence, isDue } from "@/lib/srs";
import { formatMinutes } from "@/lib/utils";
import { formatDateShort, formatDueLabel } from "@/lib/date-format";
import { SubjectIcon } from "@/components/shared/subject-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { MinutesBarChart } from "@/components/shared/charts/minutes-bar-chart";
import { ScoreLineChart } from "@/components/shared/charts/score-line-chart";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DeckFormDialog } from "@/components/flashcards/deck-form-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ExamFormDialog } from "@/components/exams/exam-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubjectWorkspacePage() {
  const params = useParams<{ subjectId: string }>();
  const router = useRouter();
  const state = useStudyStore();
  const addNote = useStudyStore((s) => s.addNote);

  const [editOpen, setEditOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [deckOpen, setDeckOpen] = React.useState(false);
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [examOpen, setExamOpen] = React.useState(false);

  const subject = state.subjects.find((s) => s.id === params.subjectId);

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="t-body font-medium text-ink">Subject not found</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link href="/subjects">
            <ArrowLeft className="size-3.5" /> Back to subjects
          </Link>
        </Button>
      </div>
    );
  }

  const perf = subjectPerformances(state).find((p) => p.subject.id === subject.id)!;
  const documents = state.documents.filter((d) => d.subjectId === subject.id);
  const notes = state.notes.filter((n) => n.subjectId === subject.id);
  const decks = state.decks.filter((d) => d.subjectId === subject.id);
  const deckIds = new Set(decks.map((d) => d.id));
  const cards = state.flashcards.filter((c) => deckIds.has(c.deckId));
  const quizzes = state.quizzes.filter((q) => q.subjectId === subject.id);
  const tasks = state.tasks.filter((t) => t.subjectId === subject.id);
  const exams = state.exams.filter((e) => e.subjectId === subject.id).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const sessions = state.sessions.filter((s) => s.subjectId === subject.id);
  const weakTopics = subjectWeakTopics(state, subject.id, 5);
  const lastActivity = subjectLastActivity(state, subject.id);
  const dueCards = cards.filter((c) => isDue(c)).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon-sm" className="mt-1.5 shrink-0" asChild>
            <Link href="/subjects">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <SubjectIcon subject={subject} size={22} />
          <div>
            <h1 className="t-title font-semibold tracking-tight text-ink">{subject.name}</h1>
            <p className="mt-0.5 t-callout text-ink-3">
              {lastActivity ? `Last active ${formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}` : "No activity yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/ai-tutor`}>
              <Sparkles className="size-3.5" /> AI Tutor
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={TrendingUp} label="Progress" value={`${perf.progress}%`} hint="Quizzes, cards, tasks" />
        <StatCard icon={ListChecks} label="Quiz average" value={perf.quizAverage != null ? `${perf.quizAverage}%` : "—"} hint={`${quizzes.filter((q) => q.status === "completed").length} completed`} />
        <StatCard icon={Layers3} label="Cards due" value={dueCards} hint={`${cards.length} total`} tone={dueCards > 0 ? "warning" : "default"} />
        <StatCard icon={GraduationCap} label="Next exam" value={perf.nextExam ? formatDueLabel(perf.nextExam.date) : "—"} hint={perf.nextExam?.title ?? "Nothing scheduled"} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards ({decks.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.filter((t) => t.status !== "done").length})</TabsTrigger>
          <TabsTrigger value="exams">Exams ({exams.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* ── Overview ────────────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length + notes.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="Nothing here yet"
                      description={`Upload a document or write a note for ${subject.name} to get started.`}
                      action={<Button size="sm" onClick={() => setUploadOpen(true)}>Upload a document</Button>}
                    />
                  ) : (
                    <ul className="divide-y divide-border">
                      {[
                        ...documents.map((d) => ({ id: d.id, icon: FileText, title: d.name, date: d.uploadDate, href: `/documents/${d.id}` })),
                        ...notes.map((n) => ({ id: n.id, icon: NotebookPen, title: n.title, date: n.updatedAt, href: `/notes/${n.id}` })),
                      ]
                        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                        .slice(0, 6)
                        .map((item) => (
                          <li key={item.id}>
                            <Link href={item.href} className="flex items-center gap-3 py-2.5 transition-opacity hover:opacity-80">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-3">
                                <item.icon className="size-4" />
                              </div>
                              <span className="min-w-0 flex-1 truncate t-callout text-ink">{item.title}</span>
                              <span className="shrink-0 t-caption text-ink-3">{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study time, last 14 days</CardTitle>
                </CardHeader>
                <CardContent>
                  <MinutesBarChart data={dailyStudyMinutes(sessions, 14).map((d) => ({ label: d.label, minutes: d.minutes }))} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Weak topics</CardTitle>
                </CardHeader>
                <CardContent>
                  {weakTopics.length === 0 ? (
                    <p className="t-callout text-ink-3">Nothing flagged yet — take a quiz and StudyHub will pinpoint what to review.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {weakTopics.map((t) => (
                        <Badge key={t} variant="warning">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 t-callout">
                  <Row label="Time studied (30d)" value={formatMinutes(subjectStudyMinutes(sessions, subject.id, 30))} />
                  <Row label="Study sessions" value={String(sessions.length)} />
                  <Row label="Flashcard retention" value={perf.retention != null ? `${perf.retention}%` : "—"} />
                  <Row label="Documents" value={String(documents.length)} />
                  <Row label="Notes" value={String(notes.length)} />
                  <Row label="Open tasks" value={String(tasks.filter((t) => t.status !== "done").length)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Documents ───────────────────────────────────────────── */}
        <TabsContent value="documents">
          <SectionActions>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="size-3.5" /> Upload document
            </Button>
          </SectionActions>
          {documents.length === 0 ? (
            <EmptyState icon={FileText} title="No documents" description={`Upload ${subject.name} material and let AI explain, summarize or quiz you on it.`} action={<Button size="sm" onClick={() => setUploadOpen(true)}>Upload your first document</Button>} />
          ) : (
            <ListGrid>
              {documents.map((d) => (
                <LinkTile key={d.id} href={`/documents/${d.id}`} icon={FileText} title={d.name} subtitle={`${d.pages ? `${d.pages} pages · ` : ""}${formatDateShort(d.uploadDate)}`} />
              ))}
            </ListGrid>
          )}
        </TabsContent>

        {/* ── Notes ───────────────────────────────────────────────── */}
        <TabsContent value="notes">
          <SectionActions>
            <Button size="sm" onClick={() => router.push(`/notes/${addNote({ title: "Untitled note", subjectId: subject.id }).id}`)}>
              <Plus className="size-3.5" /> New note
            </Button>
          </SectionActions>
          {notes.length === 0 ? (
            <EmptyState icon={NotebookPen} title="No notes" description={`Write down what you're learning in ${subject.name}.`} action={<Button size="sm" onClick={() => router.push(`/notes/${addNote({ title: "Untitled note", subjectId: subject.id }).id}`)}>Write your first note</Button>} />
          ) : (
            <ListGrid>
              {notes.map((n) => (
                <LinkTile key={n.id} href={`/notes/${n.id}`} icon={NotebookPen} title={n.title || "Untitled note"} subtitle={`Edited ${formatDistanceToNow(new Date(n.updatedAt), { addSuffix: true })}`} />
              ))}
            </ListGrid>
          )}
        </TabsContent>

        {/* ── Flashcards ──────────────────────────────────────────── */}
        <TabsContent value="flashcards">
          <SectionActions>
            <Button size="sm" onClick={() => setDeckOpen(true)}>
              <Plus className="size-3.5" /> New deck
            </Button>
          </SectionActions>
          {decks.length === 0 ? (
            <EmptyState icon={Layers3} title="No decks" description={`Generate a ${subject.name} deck with AI, or build one card by card.`} action={<Button size="sm" onClick={() => setDeckOpen(true)}>Create a deck</Button>} />
          ) : (
            <ListGrid>
              {decks.map((deck) => {
                const deckCards = cards.filter((c) => c.deckId === deck.id);
                const reviewed = deckCards.filter((c) => c.correctCount + c.incorrectCount > 0);
                const mastered = reviewed.length ? Math.round(reviewed.reduce((a, c) => a + confidence(c), 0) / reviewed.length) : 0;
                return (
                  <LinkTile
                    key={deck.id}
                    href={`/flashcards/${deck.id}`}
                    icon={Layers3}
                    title={deck.name}
                    subtitle={`${deckCards.length} cards · ${mastered}% mastered`}
                    badge={deckCards.filter((c) => isDue(c)).length > 0 ? `${deckCards.filter((c) => isDue(c)).length} due` : undefined}
                  />
                );
              })}
            </ListGrid>
          )}
        </TabsContent>

        {/* ── Quizzes ─────────────────────────────────────────────── */}
        <TabsContent value="quizzes">
          <SectionActions>
            <Button size="sm" asChild>
              <Link href={`/quizzes/new?subject=${subject.id}`}>
                <Plus className="size-3.5" /> Generate quiz
              </Link>
            </Button>
          </SectionActions>
          {quizzes.length === 0 ? (
            <EmptyState icon={ListChecks} title="No quizzes" description={`Test yourself on ${subject.name} and find out exactly what to review.`} action={<Button size="sm" asChild><Link href={`/quizzes/new?subject=${subject.id}`}>Generate a quiz</Link></Button>} />
          ) : (
            <ListGrid>
              {quizzes.map((q) => (
                <LinkTile
                  key={q.id}
                  href={`/quizzes/${q.id}`}
                  icon={ListChecks}
                  title={q.title}
                  subtitle={`${q.questions.length} questions · ${q.difficulty}`}
                  badge={q.status === "completed" ? `${q.score}%` : q.status === "in-progress" ? "In progress" : "Not started"}
                />
              ))}
            </ListGrid>
          )}
        </TabsContent>

        {/* ── Tasks ───────────────────────────────────────────────── */}
        <TabsContent value="tasks">
          <SectionActions>
            <Button size="sm" onClick={() => setTaskOpen(true)}>
              <Plus className="size-3.5" /> New task
            </Button>
          </SectionActions>
          {tasks.length === 0 ? (
            <EmptyState icon={CheckSquare} title="No tasks" description={`Add homework and to-dos for ${subject.name}.`} action={<Button size="sm" onClick={() => setTaskOpen(true)}>Add a task</Button>} />
          ) : (
            <ListGrid>
              {tasks.map((t) => (
                <LinkTile
                  key={t.id}
                  href="/tasks"
                  icon={CheckSquare}
                  title={t.title}
                  subtitle={t.deadline ? formatDueLabel(t.deadline) : "No deadline"}
                  badge={t.status === "done" ? "Done" : t.priority}
                />
              ))}
            </ListGrid>
          )}
        </TabsContent>

        {/* ── Exams ───────────────────────────────────────────────── */}
        <TabsContent value="exams">
          <SectionActions>
            <Button size="sm" onClick={() => setExamOpen(true)}>
              <Plus className="size-3.5" /> New exam
            </Button>
          </SectionActions>
          {exams.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No exams" description={`Add a ${subject.name} exam and StudyHub builds the prep plan.`} action={<Button size="sm" onClick={() => setExamOpen(true)}>Schedule an exam</Button>} />
          ) : (
            <ListGrid>
              {exams.map((e) => (
                <LinkTile key={e.id} href={`/exams/${e.id}`} icon={GraduationCap} title={e.title} subtitle={formatDateShort(e.date)} badge={`${examReadiness(e)}% ready`} />
              ))}
            </ListGrid>
          )}
        </TabsContent>

        {/* ── Progress ────────────────────────────────────────────── */}
        <TabsContent value="progress">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quiz scores</CardTitle>
              </CardHeader>
              <CardContent>
                {quizScoreSeries(quizzes, subject.id).length === 0 ? (
                  <p className="py-10 text-center t-callout text-ink-3">No completed quizzes yet.</p>
                ) : (
                  <ScoreLineChart data={quizScoreSeries(quizzes, subject.id)} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Study time</CardTitle>
              </CardHeader>
              <CardContent>
                <MinutesBarChart data={dailyStudyMinutes(sessions, 14).map((d) => ({ label: d.label, minutes: d.minutes }))} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Where you stand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 t-callout">
                <Row label="Overall progress" value={`${perf.progress}%`} />
                <Row label="Quiz average" value={perf.quizAverage != null ? `${perf.quizAverage}%` : "—"} />
                <Row label="Flashcard retention" value={perf.retention != null ? `${perf.retention}%` : "—"} />
                <Row label="Cards due now" value={String(dueCards)} />
                <Row label="Time studied (30d)" value={formatMinutes(subjectStudyMinutes(sessions, subject.id, 30))} />
                <Row label="Tasks completed" value={`${tasks.filter((t) => t.status === "done").length}/${tasks.length}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <SubjectFormDialog open={editOpen} onOpenChange={setEditOpen} subject={subject} />
      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} defaultSubjectId={subject.id} />
      <DeckFormDialog open={deckOpen} onOpenChange={setDeckOpen} defaultSubjectId={subject.id} />
      <TaskFormDialog open={taskOpen} onOpenChange={setTaskOpen} defaultSubjectId={subject.id} />
      <ExamFormDialog open={examOpen} onOpenChange={setExamOpen} defaultSubjectId={subject.id} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-3">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function SectionActions({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex justify-end">{children}</div>;
}

function ListGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function LinkTile({
  href,
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-border-strong">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate t-callout font-medium text-ink group-hover:text-[var(--color-signal-2)] transition-colors">{title}</p>
        <p className="mt-0.5 t-caption text-ink-3">{subtitle}</p>
      </div>
      {badge && (
        <Badge variant="outline" className="shrink-0 capitalize">
          {badge}
        </Badge>
      )}
    </Link>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Brain, CheckSquare, Clock, Layers3, ListChecks, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import {
  examReadiness,
  generateInsights,
  overallRetention,
  quizScoreSeries,
  subjectPerformances,
  upcomingExams,
  weeklyStudyMinutes,
} from "@/lib/analytics";
import { aiWeaknesses, AIClientError } from "@/lib/ai/client";
import { formatMinutes } from "@/lib/utils";
import { formatDateShort } from "@/lib/date-format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SubjectBarList } from "@/components/shared/subject-bar-list";
import { SubjectPill } from "@/components/shared/subject-pill";
import { Markdown } from "@/components/shared/markdown";
import { MinutesBarChart } from "@/components/shared/charts/minutes-bar-chart";
import { ScoreLineChart } from "@/components/shared/charts/score-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProgressPage() {
  const state = useStudyStore();
  const { subjects, quizzes, tasks, decks, flashcards, sessions } = state;

  const weekly = weeklyStudyMinutes(sessions, 8);
  const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const thisWeekMinutes = weekly[weekly.length - 1]?.minutes ?? 0;
  const completedQuizzes = quizzes.filter((q) => q.status === "completed");
  const avgScore = completedQuizzes.length ? Math.round(completedQuizzes.reduce((a, q) => a + (q.score ?? 0), 0) / completedQuizzes.length) : null;
  const taskCompletion = tasks.length ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0;
  const retention = overallRetention(decks, flashcards);
  const perf = subjectPerformances(state).sort((a, b) => a.progress - b.progress);
  const insights = generateInsights(state);
  const exams = upcomingExams(state.exams, 60);

  const [scoreSubject, setScoreSubject] = React.useState<string>("all");
  const scoreData = quizScoreSeries(quizzes, scoreSubject === "all" ? undefined : scoreSubject);

  const [analyzeSubject, setAnalyzeSubject] = React.useState(subjects[0]?.id ?? "");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<{ weakTopics: string[]; recommendation: string } | null>(null);

  async function analyze() {
    const subject = subjects.find((s) => s.id === analyzeSubject);
    if (!subject) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const subjectQuizzes = quizzes.filter((q) => q.subjectId === subject.id && q.status === "completed");
      const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
      const { data } = await aiWeaknesses({
        subjectName: subject.name,
        quizSummaries: subjectQuizzes.map((q) => ({ title: q.title, score: q.score ?? 0, weakTopics: q.weakTopics ?? [] })),
        flashcardRetention: overallRetention(
          decks.filter((d) => d.subjectId === subject.id),
          flashcards
        ),
        taskCompletionRate: subjectTasks.length ? Math.round((subjectTasks.filter((t) => t.status === "done").length / subjectTasks.length) * 100) : null,
      });
      setAnalysis(data);
    } catch (err) {
      toast.error(err instanceof AIClientError ? err.message : "Analyse gerade nicht möglich. Versuch es nochmal.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div>
      <PageHeader title="Fortschritt" description="Was läuft, was nicht, und was du dagegen tun kannst." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Clock} label="Gesamte Lernzeit" value={formatMinutes(totalMinutes)} hint={`${formatMinutes(thisWeekMinutes)} diese Woche`} />
        <StatCard icon={ListChecks} label="Quiz-Schnitt" value={avgScore != null ? `${avgScore}%` : "—"} hint={`${completedQuizzes.length} abgeschlossen`} />
        <StatCard icon={Layers3} label="Behaltensquote" value={`${retention}%`} tone={retention >= 70 ? "success" : retention > 0 ? "warning" : "default"} />
        <StatCard icon={CheckSquare} label="Aufgaben erledigt" value={`${taskCompletion}%`} hint={`${tasks.filter((t) => t.status === "done").length}/${tasks.length}`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lernzeit pro Woche</CardTitle>
            </CardHeader>
            <CardContent>
              <MinutesBarChart data={weekly.map((w) => ({ label: w.label, minutes: w.minutes }))} height={200} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Quiz-Ergebnisse im Verlauf</CardTitle>
              <Select value={scoreSubject} onValueChange={setScoreSubject}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Fächer</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {scoreData.length === 0 ? (
                <p className="py-10 text-center t-callout text-ink-3">No completed quizzes yet.</p>
              ) : (
                <ScoreLineChart data={scoreData} height={200} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leistung nach Fach</CardTitle>
            </CardHeader>
            <CardContent>{perf.length > 0 ? <SubjectBarList items={perf} /> : <p className="t-callout text-ink-3">No subjects yet.</p>}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prüfungsbereitschaft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exams.length === 0 && <p className="t-callout text-ink-3">No exams scheduled.</p>}
              {exams.map((exam) => {
                const readiness = examReadiness(exam);
                const subject = subjects.find((s) => s.id === exam.subjectId);
                return (
                  <Link key={exam.id} href={`/exams/${exam.id}`} className="block rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-border-strong">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate t-callout font-medium text-ink">{exam.title}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {subject && <SubjectPill subject={subject} />}
                          <span className="t-caption text-ink-3">{formatDateShort(exam.date)}</span>
                        </div>
                      </div>
                      <span className="shrink-0 t-callout font-semibold text-ink">{readiness}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div className={`h-full rounded-full ${readiness >= 70 ? "bg-success" : readiness >= 40 ? "bg-warning" : "bg-danger"}`} style={{ width: `${readiness}%` }} />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-[var(--color-signal-2)]" /> Lern-Erkenntnisse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.length === 0 ? (
                <p className="t-callout text-ink-3">Mach ein paar Quiz und Karteikarten-Runden, dann gibt es hier Erkenntnisse.</p>
              ) : (
                insights.map((i) => (
                  <div key={i.id} className="flex gap-2.5 rounded-lg border border-border bg-surface-2 p-3">
                    <TrendingUp className={`mt-0.5 size-3.5 shrink-0 ${i.tone === "positive" ? "text-success-text" : i.tone === "warning" ? "rotate-180 text-warning-text" : "text-[var(--color-signal-2)]"}`} />
                    <p className="t-callout leading-relaxed text-ink-2">{i.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Brain className="size-4 text-[var(--color-signal-2)]" /> KI-Analyse anfordern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={analyzeSubject} onValueChange={setAnalyzeSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Fach wählen" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full" onClick={analyze} disabled={analyzing || !analyzeSubject}>
                {analyzing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} Schwächen analysieren
              </Button>
              {analysis && (
                <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                  {analysis.weakTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.weakTopics.map((t) => (
                        <Badge key={t} variant="warning">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Markdown className="t-callout">{analysis.recommendation}</Markdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckSquare,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Layers3,
  ListChecks,
  NotebookPen,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { useStudyStore, useStreakSelector } from "@/lib/store";
import {
  buildTimeline,
  dailyStudyMinutes,
  generateInsights,
  minutesToday,
  overdueTasks,
  subjectPerformances,
  tasksDueToday,
  upcomingExams,
  weakestSubject,
} from "@/lib/analytics";
import { isDue } from "@/lib/srs";
import { formatDueLabel, greeting } from "@/lib/date-format";
import { formatMinutes } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SubjectPill } from "@/components/shared/subject-pill";
import { SubjectBarList } from "@/components/shared/subject-bar-list";
import { EmptyState } from "@/components/shared/empty-state";
import { MinutesBarChart } from "@/components/shared/charts/minutes-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const state = useStudyStore();
  const streak = useStreakSelector();
  const { profile, subjects, documents, notes, decks, flashcards, tasks, exams, sessions } = state;

  if (!profile) return null;

  const dueToday = tasksDueToday(tasks);
  const overdue = overdueTasks(tasks);
  const nextExams = upcomingExams(exams, 45);
  const todayMinutes = minutesToday(sessions);
  const weakest = weakestSubject(state);
  const perf = subjectPerformances(state).sort((a, b) => a.progress - b.progress);
  const timeline = buildTimeline(state, 14).slice(0, 6);
  const insights = generateInsights(state);
  const daily = dailyStudyMinutes(sessions, 14);
  const bySubject = new Map(subjects.map((s) => [s.id, s]));

  const continueItems = [
    ...[...documents].sort((a, b) => +new Date(b.uploadDate) - +new Date(a.uploadDate)).slice(0, 2).map((d) => ({
      id: d.id,
      icon: FileText,
      title: d.name,
      subjectId: d.subjectId,
      meta: `${d.pages ?? "?"} Seiten`,
      href: `/documents/${d.id}`,
    })),
    ...[...notes].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 2).map((n) => ({
      id: n.id,
      icon: NotebookPen,
      title: n.title,
      subjectId: n.subjectId,
      meta: "Notiz",
      href: `/notes/${n.id}`,
    })),
    ...decks
      .map((d) => ({ deck: d, due: flashcards.filter((c) => c.deckId === d.id && isDue(c)).length }))
      .filter((x) => x.due > 0)
      .sort((a, b) => b.due - a.due)
      .slice(0, 2)
      .map(({ deck, due }) => ({
        id: deck.id,
        icon: Layers3,
        title: deck.name,
        subjectId: deck.subjectId,
        meta: `${due} card${due === 1 ? "" : "s"} due`,
        href: `/flashcards/${deck.id}`,
      })),
  ].slice(0, 4);

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${profile.name.split(" ")[0]}`}
        description="Das steht heute an."
        actions={
          <Button asChild>
            <Link href="/ai-tutor">
              <Sparkles className="size-3.5" /> KI-Tutor fragen
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={CheckSquare} label="Heute fällig" value={dueToday.length} hint={overdue.length > 0 ? `${overdue.length} überfällig` : "Alles im Plan"} tone={overdue.length > 0 ? "warning" : "default"} />
        <StatCard
          icon={GraduationCap}
          label="Nächste Prüfung"
          value={nextExams[0] ? formatDueLabel(nextExams[0].date) : "—"}
          hint={nextExams[0]?.title ?? "Nichts geplant"}
        />
        <StatCard icon={Clock} label="Lernzeit heute" value={formatMinutes(todayMinutes)} hint={todayMinutes > 0 ? "Gut gemacht" : "Noch nicht angefangen"} tone={todayMinutes > 0 ? "success" : "default"} />
        <StatCard icon={Flame} label="Aktuelle Serie" value={`${streak} T`} hint={streak > 0 ? "Weiter so" : "Heute anfangen"} tone={streak > 0 ? "success" : "default"} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Weiterlernen</CardTitle>
              <Link href="/documents" className="t-caption text-ink-3 hover:text-ink transition-colors">
                Alle ansehen
              </Link>
            </CardHeader>
            <CardContent>
              {continueItems.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Noch nichts zum Weitermachen"
                  description="Lade ein Dokument hoch oder leg eine Notiz an."
                  action={
                    <Button size="sm" asChild>
                      <Link href="/documents?upload=1">Erstes Dokument hochladen</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {continueItems.map((item) => {
                    const subject = item.subjectId ? bySubject.get(item.subjectId) : null;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="group rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:border-border-strong hover:bg-surface-hover"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-3">
                            <item.icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate t-callout font-medium text-ink group-hover:text-[var(--color-signal-2)] transition-colors">{item.title}</p>
                            <p className="mt-0.5 t-caption text-ink-3">{item.meta}</p>
                          </div>
                        </div>
                        {subject && (
                          <div className="mt-2.5">
                            <SubjectPill subject={subject} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Demnächst</CardTitle>
              <Link href="/calendar" className="t-caption text-ink-3 hover:text-ink transition-colors">
                Kalender öffnen
              </Link>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <EmptyState icon={CalendarClock} title="Nichts in Sicht" description="Aufgaben und Prüfungen der nächsten zwei Wochen erscheinen hier." />
              ) : (
                <ul className="divide-y divide-border">
                  {timeline.map((item) => {
                    const subject = item.subjectId ? bySubject.get(item.subjectId) : null;
                    const Icon = item.kind === "exam" ? GraduationCap : CheckSquare;
                    const overdueItem = item.kind === "task" && new Date(item.date) < new Date();
                    return (
                      <li key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-3">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate t-callout font-medium text-ink">{item.title}</p>
                          {subject && <SubjectPill subject={subject} className="mt-1" />}
                        </div>
                        <Badge variant={item.kind === "exam" ? "signal" : overdueItem ? "danger" : "outline"} className="shrink-0">
                          {formatDueLabel(item.date)}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lernzeit, letzte 14 Tage</CardTitle>
            </CardHeader>
            <CardContent>
              <MinutesBarChart data={daily.map((d) => ({ label: d.label, minutes: d.minutes }))} />
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
                <p className="t-callout text-ink-3">Mach ein paar Quiz oder Karteikarten-Runden, dann tauchen hier Erkenntnisse auf.</p>
              ) : (
                insights.map((insight) => (
                  <div key={insight.id} className="flex gap-2.5 rounded-lg border border-border bg-surface-2 p-3">
                    {insight.tone === "warning" ? (
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning-text" />
                    ) : insight.tone === "positive" ? (
                      <TrendingDown className="mt-0.5 size-3.5 shrink-0 rotate-180 text-success-text" />
                    ) : (
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--color-signal-2)]" />
                    )}
                    <p className="t-callout leading-relaxed text-ink-2">{insight.text}</p>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
                <Link href="/progress">
                  Ganzen Fortschritt ansehen <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Leistung nach Fach</CardTitle>
              {weakest && (
                <Badge variant="warning" className="gap-1">
                  <TrendingDown className="size-3" /> {weakest.subject.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {perf.length === 0 ? (
                <EmptyState icon={ListChecks} title="Noch keine Fächer" description="Leg ein Fach an, dann wird die Leistung mitverfolgt." />
              ) : (
                <SubjectBarList items={perf} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

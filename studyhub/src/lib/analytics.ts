import { addDays, differenceInCalendarDays, format, isToday, startOfDay, subDays } from "date-fns";
import type {
  Exam,
  Flashcard,
  FlashcardDeck,
  Note,
  Quiz,
  StudyDocument,
  StudySession,
  StudyTask,
  Subject,
} from "@/lib/types";
import { confidence, isDue } from "@/lib/srs";

export interface StoreSlice {
  subjects: Subject[];
  documents: StudyDocument[];
  notes: Note[];
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  tasks: StudyTask[];
  exams: Exam[];
  sessions: StudySession[];
}

export function minutesToday(sessions: StudySession[]): number {
  return sessions.filter((s) => isToday(new Date(s.date))).reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function dailyStudyMinutes(sessions: StudySession[], days = 14) {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
  }
  sessions.forEach((s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd");
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + s.durationMinutes);
  });
  return [...buckets.entries()].map(([date, minutes]) => ({
    date,
    label: format(new Date(date), "EEE"),
    minutes,
  }));
}

export function weeklyStudyMinutes(sessions: StudySession[], weeks = 8) {
  const buckets = new Map<number, number>();
  for (let i = weeks - 1; i >= 0; i--) buckets.set(i, 0);
  const now = new Date();
  sessions.forEach((s) => {
    const weeksAgo = Math.floor(differenceInCalendarDays(now, new Date(s.date)) / 7);
    if (weeksAgo >= 0 && weeksAgo < weeks) {
      buckets.set(weeksAgo, (buckets.get(weeksAgo) ?? 0) + s.durationMinutes);
    }
  });
  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([weeksAgo, minutes]) => ({
      label: weeksAgo === 0 ? "This wk" : `-${weeksAgo}w`,
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
    }));
}

export function subjectStudyMinutes(sessions: StudySession[], subjectId: string, days = 30): number {
  const since = subDays(new Date(), days);
  return sessions.filter((s) => s.subjectId === subjectId && new Date(s.date) >= since).reduce((a, s) => a + s.durationMinutes, 0);
}

export function subjectQuizAverage(quizzes: Quiz[], subjectId: string): number | null {
  const done = quizzes.filter((q) => q.subjectId === subjectId && q.status === "completed" && typeof q.score === "number");
  if (done.length === 0) return null;
  return Math.round(done.reduce((a, q) => a + (q.score ?? 0), 0) / done.length);
}

export function subjectRetention(decks: FlashcardDeck[], flashcards: Flashcard[], subjectId: string): number | null {
  const deckIds = new Set(decks.filter((d) => d.subjectId === subjectId).map((d) => d.id));
  const cards = flashcards.filter((c) => deckIds.has(c.deckId) && c.correctCount + c.incorrectCount > 0);
  if (cards.length === 0) return null;
  return Math.round(cards.reduce((a, c) => a + confidence(c), 0) / cards.length);
}

export function subjectProgress(state: StoreSlice, subjectId: string): number {
  const quizAvg = subjectQuizAverage(state.quizzes, subjectId);
  const retention = subjectRetention(state.decks, state.flashcards, subjectId);
  const tasksForSubject = state.tasks.filter((t) => t.subjectId === subjectId);
  const taskCompletion = tasksForSubject.length
    ? Math.round((tasksForSubject.filter((t) => t.status === "done").length / tasksForSubject.length) * 100)
    : null;
  const parts = [quizAvg, retention, taskCompletion].filter((n): n is number => n != null);
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export interface SubjectPerformance {
  subject: Subject;
  progress: number;
  quizAverage: number | null;
  retention: number | null;
  studyMinutes30d: number;
  documentCount: number;
  dueCards: number;
  nextExam: Exam | null;
}

export function subjectPerformances(state: StoreSlice): SubjectPerformance[] {
  return state.subjects.map((subject) => {
    const deckIds = new Set(state.decks.filter((d) => d.subjectId === subject.id).map((d) => d.id));
    const dueCards = state.flashcards.filter((c) => deckIds.has(c.deckId) && isDue(c)).length;
    const upcomingExams = state.exams
      .filter((e) => e.subjectId === subject.id && new Date(e.date).getTime() >= startOfDay(new Date()).getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      subject,
      progress: subjectProgress(state, subject.id),
      quizAverage: subjectQuizAverage(state.quizzes, subject.id),
      retention: subjectRetention(state.decks, state.flashcards, subject.id),
      studyMinutes30d: subjectStudyMinutes(state.sessions, subject.id),
      documentCount: state.documents.filter((d) => d.subjectId === subject.id).length,
      dueCards,
      nextExam: upcomingExams[0] ?? null,
    };
  });
}

export function weakestSubject(state: StoreSlice): SubjectPerformance | null {
  const perf = subjectPerformances(state).filter((p) => p.quizAverage != null || p.retention != null);
  if (perf.length === 0) return null;
  return perf.reduce((worst, p) => {
    const score = (p.quizAverage ?? 100) * 0.6 + (p.retention ?? 100) * 0.4;
    const worstScore = (worst.quizAverage ?? 100) * 0.6 + (worst.retention ?? 100) * 0.4;
    return score < worstScore ? p : worst;
  });
}

export function strongestSubject(state: StoreSlice): SubjectPerformance | null {
  const perf = subjectPerformances(state).filter((p) => p.quizAverage != null || p.retention != null);
  if (perf.length === 0) return null;
  return perf.reduce((best, p) => {
    const score = (p.quizAverage ?? 0) * 0.6 + (p.retention ?? 0) * 0.4;
    const bestScore = (best.quizAverage ?? 0) * 0.6 + (best.retention ?? 0) * 0.4;
    return score > bestScore ? p : best;
  });
}

export function dueFlashcardCount(state: Pick<StoreSlice, "flashcards" | "decks">, subjectId?: string): number {
  const deckIds = subjectId ? new Set(state.decks.filter((d) => d.subjectId === subjectId).map((d) => d.id)) : null;
  return state.flashcards.filter((c) => (!deckIds || deckIds.has(c.deckId)) && isDue(c)).length;
}

export function tasksDueToday(tasks: StudyTask[]): StudyTask[] {
  return tasks.filter((t) => t.status !== "done" && t.deadline && isToday(new Date(t.deadline)));
}

export function overdueTasks(tasks: StudyTask[]): StudyTask[] {
  const now = new Date();
  return tasks.filter((t) => t.status !== "done" && t.deadline && new Date(t.deadline) < now && !isToday(new Date(t.deadline)));
}

export function upcomingExams(exams: Exam[], days = 30): Exam[] {
  const now = new Date();
  const horizon = addDays(now, days);
  return exams
    .filter((e) => new Date(e.date) >= startOfDay(now) && new Date(e.date) <= horizon)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function examReadiness(exam: Exam): number {
  if (exam.studyPlan.length === 0) return 0;
  const donePlanRatio = exam.studyPlan.filter((w) => w.done).length / exam.studyPlan.length;
  const daysLeft = differenceInCalendarDays(new Date(exam.date), new Date());
  const totalDays = Math.max(1, differenceInCalendarDays(new Date(exam.date), new Date(exam.createdAt)));
  const elapsedRatio = Math.min(1, Math.max(0, (totalDays - daysLeft) / totalDays));
  const readiness = donePlanRatio * 0.7 + elapsedRatio * 0.3;
  return Math.round(Math.min(1, readiness) * 100);
}

export type TimelineKind = "task" | "exam" | "study-session";

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  title: string;
  date: string;
  subjectId: string | null;
  href: string;
  meta?: string;
}

export function buildTimeline(state: StoreSlice, days = 14): TimelineItem[] {
  const now = startOfDay(new Date());
  const horizon = addDays(now, days);
  const items: TimelineItem[] = [];

  state.tasks
    .filter((t) => t.status !== "done" && t.deadline)
    .forEach((t) => {
      const d = new Date(t.deadline as string);
      if (d <= horizon) {
        items.push({ id: t.id, kind: "task", title: t.title, date: t.deadline as string, subjectId: t.subjectId, href: "/tasks", meta: t.priority });
      }
    });

  state.exams.forEach((e) => {
    const d = new Date(e.date);
    if (d >= now && d <= horizon) {
      items.push({ id: e.id, kind: "exam", title: e.title, date: e.date, subjectId: e.subjectId, href: `/exams/${e.id}`, meta: "exam" });
    }
  });

  return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export interface Insight {
  id: string;
  tone: "positive" | "warning" | "neutral";
  text: string;
}

export function generateInsights(state: StoreSlice): Insight[] {
  const insights: Insight[] = [];
  const strongest = strongestSubject(state);
  const weakest = weakestSubject(state);

  if (strongest) {
    insights.push({ id: "strongest", tone: "positive", text: `You're strongest in ${strongest.subject.name} — keep the momentum with a quick review this week.` });
  }

  if (weakest && (!strongest || weakest.subject.id !== strongest.subject.id)) {
    const pct = weakest.quizAverage ?? weakest.retention ?? 0;
    insights.push({
      id: "weakest",
      tone: "warning",
      text: `${weakest.subject.name} is your weakest subject right now, averaging ${pct}% across recent quizzes and flashcards.`,
    });
  }

  // Quiz score trend for the subject with the most quiz history.
  const bySubject = new Map<string, Quiz[]>();
  state.quizzes
    .filter((q) => q.status === "completed" && q.subjectId)
    .forEach((q) => {
      const arr = bySubject.get(q.subjectId as string) ?? [];
      arr.push(q);
      bySubject.set(q.subjectId as string, arr);
    });
  for (const [subjectId, quizzes] of bySubject) {
    if (quizzes.length < 2) continue;
    const sorted = [...quizzes].sort((a, b) => new Date(a.completedAt ?? a.createdAt).getTime() - new Date(b.completedAt ?? b.createdAt).getTime());
    const first = sorted[0].score ?? 0;
    const last = sorted[sorted.length - 1].score ?? 0;
    const delta = last - first;
    const subject = state.subjects.find((s) => s.id === subjectId);
    if (subject && Math.abs(delta) >= 10) {
      insights.push({
        id: `trend-${subjectId}`,
        tone: delta > 0 ? "positive" : "warning",
        text: `Your ${subject.name} quiz performance ${delta > 0 ? "improved" : "dropped"} ${Math.abs(delta)}% since your first attempt.`,
      });
    }
  }

  // Cards not reviewed in a while.
  state.decks.forEach((deck) => {
    const cards = state.flashcards.filter((c) => c.deckId === deck.id && c.lastReviewed);
    if (cards.length === 0) return;
    const mostRecent = cards.reduce((latest, c) => (new Date(c.lastReviewed as string) > new Date(latest.lastReviewed as string) ? c : latest));
    const daysSince = differenceInCalendarDays(new Date(), new Date(mostRecent.lastReviewed as string));
    if (daysSince >= 7) {
      const subject = state.subjects.find((s) => s.id === deck.subjectId);
      insights.push({
        id: `stale-${deck.id}`,
        tone: "warning",
        text: `You haven't reviewed "${deck.name}"${subject ? ` (${subject.name})` : ""} in ${daysSince} days.`,
      });
    }
  });

  // Exam readiness gaps.
  upcomingExams(state.exams, 21).forEach((exam) => {
    const readiness = examReadiness(exam);
    const daysLeft = differenceInCalendarDays(new Date(exam.date), new Date());
    if (readiness < 70) {
      const subject = state.subjects.find((s) => s.id === exam.subjectId);
      insights.push({
        id: `exam-${exam.id}`,
        tone: "warning",
        text: `You have "${exam.title}"${subject ? ` (${subject.name})` : ""} in ${daysLeft} day${daysLeft === 1 ? "" : "s"} and are only ${readiness}% ready.`,
      });
    }
  });

  // Recommended focus today.
  if (weakest) {
    const suggestedMinutes = weakest.dueCards > 0 ? 30 + weakest.dueCards * 2 : 30;
    insights.push({
      id: "today-focus",
      tone: "neutral",
      text: `Based on your recent performance, spend about ${Math.min(75, suggestedMinutes)} minutes on ${weakest.subject.name} today.`,
    });
  }

  return insights.slice(0, 6);
}

export function quizScoreSeries(quizzes: Quiz[], subjectId?: string) {
  return quizzes
    .filter((q) => q.status === "completed" && (!subjectId || q.subjectId === subjectId))
    .sort((a, b) => new Date(a.completedAt ?? a.createdAt).getTime() - new Date(b.completedAt ?? b.createdAt).getTime())
    .map((q, i) => ({ label: `Q${i + 1}`, score: q.score ?? 0, title: q.title }));
}

export function subjectWeakTopics(state: Pick<StoreSlice, "quizzes">, subjectId: string, limit = 3): string[] {
  const counts = new Map<string, number>();
  state.quizzes
    .filter((q) => q.subjectId === subjectId && q.status === "completed")
    .forEach((q) => (q.weakTopics ?? []).forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, limit);
}

export function subjectLastActivity(state: StoreSlice, subjectId: string): string | null {
  const dates: string[] = [];
  state.documents.filter((d) => d.subjectId === subjectId).forEach((d) => dates.push(d.uploadDate));
  state.notes.filter((n) => n.subjectId === subjectId).forEach((n) => dates.push(n.updatedAt));
  state.sessions.filter((s) => s.subjectId === subjectId).forEach((s) => dates.push(s.date));
  if (dates.length === 0) return null;
  return dates.reduce((latest, d) => (new Date(d) > new Date(latest) ? d : latest));
}

export function overallRetention(decks: FlashcardDeck[], flashcards: Flashcard[]): number {
  const reviewed = flashcards.filter((c) => c.correctCount + c.incorrectCount > 0);
  if (reviewed.length === 0) return 0;
  return Math.round(reviewed.reduce((a, c) => a + confidence(c), 0) / reviewed.length);
}

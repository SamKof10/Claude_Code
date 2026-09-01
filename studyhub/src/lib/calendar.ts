import type { StoreSlice } from "@/lib/analytics";
import type { StudySessionType } from "@/lib/types";

const SESSION_LABEL: Record<StudySessionType, string> = {
  flashcards: "Karteikarten",
  quiz: "Quiz",
  reading: "Lesen",
  notes: "Notizen",
  "ai-tutor": "KI-Tutor",
  document: "Dokument",
  focus: "Fokusblock",
};

export type CalendarEventKind = "exam" | "task" | "session";

export interface CalendarEvent {
  id: string;
  kind: CalendarEventKind;
  title: string;
  date: string;
  subjectId: string | null;
  href: string;
  meta?: string;
  done?: boolean;
}

export function buildCalendarEvents(state: StoreSlice): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  state.exams.forEach((e) => {
    events.push({ id: `exam-${e.id}`, kind: "exam", title: e.title, date: e.date, subjectId: e.subjectId, href: `/exams/${e.id}` });
  });

  state.tasks.forEach((t) => {
    if (!t.deadline) return;
    events.push({
      id: `task-${t.id}`,
      kind: "task",
      title: t.title,
      date: t.deadline,
      subjectId: t.subjectId,
      href: "/tasks",
      meta: t.priority,
      done: t.status === "done",
    });
  });

  state.sessions.forEach((s) => {
    events.push({
      id: `session-${s.id}`,
      kind: "session",
      title: `Gelernt: ${SESSION_LABEL[s.type]}`,
      date: s.date,
      subjectId: s.subjectId,
      href: "/progress",
      meta: `${s.durationMinutes} Min`,
    });
  });

  return events.sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

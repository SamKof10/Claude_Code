import type { StoreSlice } from "@/lib/analytics";

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
      title: `Studied ${s.type.replace("-", " ")}`,
      date: s.date,
      subjectId: s.subjectId,
      href: "/progress",
      meta: `${s.durationMinutes}m`,
    });
  });

  return events.sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

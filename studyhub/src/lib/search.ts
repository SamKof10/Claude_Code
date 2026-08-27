import type { StudyState } from "@/lib/store";
import type { SearchIndexEntry } from "@/lib/types";

type Sliceable = Pick<StudyState, "subjects" | "documents" | "notes" | "decks" | "tasks" | "exams" | "quizzes" | "conversations">;

export function buildSearchIndex(state: Sliceable): SearchIndexEntry[] {
  const bySubject = new Map(state.subjects.map((s) => [s.id, s.name]));
  const entries: SearchIndexEntry[] = [];

  state.subjects.forEach((s) => entries.push({ id: s.id, kind: "subject", title: s.name, href: `/subjects/${s.id}`, subjectId: s.id }));

  state.documents.forEach((d) =>
    entries.push({
      id: d.id,
      kind: "document",
      title: d.name,
      subtitle: bySubject.get(d.subjectId),
      href: `/documents/${d.id}`,
      subjectId: d.subjectId,
    })
  );

  state.notes.forEach((n) =>
    entries.push({
      id: n.id,
      kind: "note",
      title: n.title || "Untitled note",
      subtitle: n.subjectId ? bySubject.get(n.subjectId) : undefined,
      href: `/notes/${n.id}`,
      subjectId: n.subjectId,
    })
  );

  state.decks.forEach((d) =>
    entries.push({
      id: d.id,
      kind: "flashcard-deck",
      title: d.name,
      subtitle: d.subjectId ? bySubject.get(d.subjectId) : undefined,
      href: `/flashcards/${d.id}`,
      subjectId: d.subjectId,
    })
  );

  state.tasks.forEach((t) =>
    entries.push({
      id: t.id,
      kind: "task",
      title: t.title,
      subtitle: t.subjectId ? bySubject.get(t.subjectId) : undefined,
      href: `/tasks`,
      subjectId: t.subjectId,
    })
  );

  state.exams.forEach((e) =>
    entries.push({
      id: e.id,
      kind: "exam",
      title: e.title,
      subtitle: bySubject.get(e.subjectId),
      href: `/exams/${e.id}`,
      subjectId: e.subjectId,
    })
  );

  state.quizzes.forEach((q) =>
    entries.push({
      id: q.id,
      kind: "quiz",
      title: q.title,
      subtitle: q.subjectId ? bySubject.get(q.subjectId) : undefined,
      href: `/quizzes/${q.id}`,
      subjectId: q.subjectId,
    })
  );

  state.conversations.forEach((c) =>
    entries.push({
      id: c.id,
      kind: "conversation",
      title: c.title,
      subtitle: c.subjectId ? bySubject.get(c.subjectId) : undefined,
      href: `/ai-tutor?c=${c.id}`,
      subjectId: c.subjectId,
    })
  );

  return entries;
}

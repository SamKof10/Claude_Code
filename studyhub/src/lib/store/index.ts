"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isToday, isYesterday, parseISO } from "date-fns";
import { uid } from "@/lib/utils";
import { scheduleReview, type ReviewGrade } from "@/lib/srs";
import { buildDemoData } from "@/lib/demo/seed";
import { currentSchoolYear } from "@/lib/school";
import type {
  AIConversation,
  AIMessage,
  Exam,
  Flashcard,
  FlashcardDeck,
  Note,
  Profile,
  Quiz,
  StudyDocument,
  StudySession,
  StudyTask,
  Subject,
  TutorMode,
} from "@/lib/types";

export interface StudyState {
  hydrated: boolean;
  profile: Profile | null;
  subjects: Subject[];
  documents: StudyDocument[];
  notes: Note[];
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  tasks: StudyTask[];
  exams: Exam[];
  sessions: StudySession[];
  conversations: AIConversation[];
  messages: AIMessage[];

  setHydrated: () => void;
  resetDemoData: () => void;
  clearAllData: () => void;

  completeOnboarding: (data: Partial<Profile> & { subjectNames: string[] }) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  spendAICredits: (n?: number) => void;
  touchStreak: () => void;

  addSubject: (subject: Pick<Subject, "name" | "icon" | "color">) => Subject;
  updateSubject: (id: string, patch: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addDocument: (doc: Omit<StudyDocument, "id" | "uploadDate" | "status">) => StudyDocument;
  updateDocument: (id: string, patch: Partial<StudyDocument>) => void;
  deleteDocument: (id: string) => void;

  addNote: (note: Partial<Note> & { title: string }) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addDeck: (deck: Omit<FlashcardDeck, "id" | "createdAt">) => FlashcardDeck;
  updateDeck: (id: string, patch: Partial<FlashcardDeck>) => void;
  deleteDeck: (id: string) => void;
  addFlashcard: (card: Omit<Flashcard, "id" | "correctCount" | "incorrectCount" | "easeFactor" | "intervalDays" | "nextReview" | "lastReviewed">) => Flashcard;
  updateFlashcard: (id: string, patch: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  reviewFlashcard: (id: string, grade: ReviewGrade) => void;

  addQuiz: (quiz: Omit<Quiz, "id" | "createdAt" | "status" | "answers">) => Quiz;
  answerQuizQuestion: (quizId: string, questionId: string, answer: string) => void;
  startQuiz: (quizId: string) => void;
  completeQuiz: (quizId: string) => void;
  deleteQuiz: (id: string) => void;

  addTask: (task: Omit<StudyTask, "id" | "createdAt" | "completedAt">) => StudyTask;
  updateTask: (id: string, patch: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: StudyTask["status"]) => void;

  addExam: (exam: Omit<Exam, "id" | "createdAt">) => Exam;
  updateExam: (id: string, patch: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleStudyPlanWeek: (examId: string, weekNumber: number) => void;

  logStudySession: (session: Omit<StudySession, "id" | "date"> & { date?: string }) => void;

  createConversation: (input: { subjectId?: string | null; documentId?: string | null; mode: TutorMode; title: string }) => AIConversation;
  updateConversation: (id: string, patch: Partial<AIConversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, role: AIMessage["role"], content: string) => AIMessage;
}

/** Every data field at its blank value — one definition, so a new slice can't be forgotten in one place and not the other. */
function emptyData() {
  return {
    profile: null,
    subjects: [],
    documents: [],
    notes: [],
    decks: [],
    flashcards: [],
    quizzes: [],
    tasks: [],
    exams: [],
    sessions: [],
    conversations: [],
    messages: [],
  } satisfies Partial<StudyState>;
}

/** Each account persists to its own bucket, so signing out never exposes the previous account's work. */
export function dataKeyForAccount(accountId: string): string {
  return `studyhub:data:${accountId}`;
}

// Where writes go while nobody is signed in. It is cleared immediately, and
// exists only so persist has somewhere harmless to write during the reset.
const SIGNED_OUT_KEY = "studyhub:data:signed-out";

// Data written before accounts existed. The first account to sign in adopts it
// once, so the app doesn't look wiped to anyone who was already using it.
const LEGACY_KEY = "studyhub:data";
const LEGACY_FLAG = "studyhub:legacy-adopted";

function adoptLegacyData(targetKey: string): void {
  try {
    if (window.localStorage.getItem(LEGACY_FLAG)) return;
    window.localStorage.setItem(LEGACY_FLAG, "1");
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy && !window.localStorage.getItem(targetKey)) window.localStorage.setItem(targetKey, legacy);
  } catch {
    // A blocked store just means there is nothing to adopt.
  }
}

function readBucket(key: string): Partial<StudyState> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Partial<StudyState> };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

/**
 * Points persistence at this account's bucket and loads it.
 *
 * The bucket is read manually rather than through persist.rehydrate() because
 * rehydrate leaves the current state untouched when a bucket is empty — which
 * would hand a brand-new account the previous one's data.
 */
export function adoptAccountData(accountId: string): void {
  const key = dataKeyForAccount(accountId);
  adoptLegacyData(key);
  const stored = readBucket(key);
  // Repoint before the write below, so it lands in this account's bucket.
  useStudyStore.persist.setOptions({ name: key });
  useStudyStore.setState({ ...emptyData(), ...stored, hydrated: true });
}

/** Drops the signed-in account's data from memory without touching its bucket. */
export function releaseAccountData(): void {
  useStudyStore.persist.setOptions({ name: SIGNED_OUT_KEY });
  useStudyStore.setState({ ...emptyData(), hydrated: false });
  try {
    window.localStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    // Nothing to clean up if the store is blocked.
  }
}

function computeStreak(sessions: StudySession[]): number {
  const days = new Set(sessions.map((s) => s.date.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profile: null,
      subjects: [],
      documents: [],
      notes: [],
      decks: [],
      flashcards: [],
      quizzes: [],
      tasks: [],
      exams: [],
      sessions: [],
      conversations: [],
      messages: [],

      setHydrated: () => set({ hydrated: true }),

      resetDemoData: () => {
        const demo = buildDemoData();
        set({ ...demo, hydrated: true });
      },

      clearAllData: () => set(emptyData()),

      completeOnboarding: ({ subjectNames, ...profilePatch }) => {
        const now = new Date().toISOString();
        const palette: Subject["color"][] = ["subj-1", "subj-2", "subj-3", "subj-4", "subj-5", "subj-6", "subj-7", "subj-8"];
        const icons = ["BookOpen", "Sigma", "Atom", "Landmark", "Globe2", "Palette", "Music", "Dumbbell"];
        const subjects: Subject[] = subjectNames
          .filter(Boolean)
          .map((name, i) => ({ id: uid("subj"), name, icon: icons[i % icons.length], color: palette[i % palette.length], createdAt: now }));

        set({
          subjects,
          profile: {
            id: uid("user"),
            name: profilePatch.name ?? "Student",
            email: profilePatch.email ?? "",
            school: profilePatch.school ?? "",
            grade: profilePatch.grade ?? "",
            schoolYear: profilePatch.schoolYear ?? currentSchoolYear(),
            learningGoals: profilePatch.learningGoals ?? [],
            preferredStudyTime: profilePatch.preferredStudyTime ?? "evening",
            onboarded: true,
            streakDays: 0,
            lastActiveDate: null,
            aiUsage: { used: 0, limit: 500 },
            createdAt: now,
          },
        });
      },

      updateProfile: (patch) => set((s) => ({ profile: s.profile ? { ...s.profile, ...patch } : s.profile })),

      spendAICredits: (n = 1) =>
        set((s) =>
          s.profile
            ? { profile: { ...s.profile, aiUsage: { ...s.profile.aiUsage, used: Math.min(s.profile.aiUsage.limit, s.profile.aiUsage.used + n) } } }
            : {}
        ),

      touchStreak: () =>
        set((s) => {
          if (!s.profile) return {};
          const today = new Date().toISOString().slice(0, 10);
          if (s.profile.lastActiveDate?.slice(0, 10) === today) return {};
          const wasYesterday = s.profile.lastActiveDate ? isYesterday(parseISO(s.profile.lastActiveDate)) : false;
          const wasToday = s.profile.lastActiveDate ? isToday(parseISO(s.profile.lastActiveDate)) : false;
          const streakDays = wasToday ? s.profile.streakDays : wasYesterday ? s.profile.streakDays + 1 : 1;
          return { profile: { ...s.profile, streakDays, lastActiveDate: new Date().toISOString() } };
        }),

      addSubject: (subject) => {
        const created: Subject = { ...subject, id: uid("subj"), createdAt: new Date().toISOString() };
        set((s) => ({ subjects: [...s.subjects, created] }));
        return created;
      },
      updateSubject: (id, patch) => set((s) => ({ subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.filter((x) => x.id !== id),
          documents: s.documents.filter((x) => x.subjectId !== id),
          notes: s.notes.map((n) => (n.subjectId === id ? { ...n, subjectId: null } : n)),
          decks: s.decks.filter((x) => x.subjectId !== id),
          tasks: s.tasks.map((t) => (t.subjectId === id ? { ...t, subjectId: null } : t)),
          exams: s.exams.filter((x) => x.subjectId !== id),
        })),

      addDocument: (doc) => {
        const created: StudyDocument = { ...doc, id: uid("doc"), uploadDate: new Date().toISOString(), status: "processing" };
        set((s) => ({ documents: [created, ...s.documents] }));
        // Simulate AI processing time so the "processing" state is visible.
        setTimeout(() => {
          get().updateDocument(created.id, { status: "ready" });
        }, 2200);
        return created;
      },
      updateDocument: (id, patch) => set((s) => ({ documents: s.documents.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteDocument: (id) => set((s) => ({ documents: s.documents.filter((x) => x.id !== id) })),

      addNote: (note) => {
        const now = new Date().toISOString();
        const created: Note = {
          id: uid("note"),
          subjectId: note.subjectId ?? null,
          title: note.title,
          contentHTML: note.contentHTML ?? "",
          tags: note.tags ?? [],
          pinned: note.pinned ?? false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [created, ...s.notes] }));
        return created;
      },
      updateNote: (id, patch) =>
        set((s) => ({ notes: s.notes.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((x) => x.id !== id) })),

      addDeck: (deck) => {
        const created: FlashcardDeck = { ...deck, id: uid("deck"), createdAt: new Date().toISOString() };
        set((s) => ({ decks: [created, ...s.decks] }));
        return created;
      },
      updateDeck: (id, patch) => set((s) => ({ decks: s.decks.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteDeck: (id) =>
        set((s) => ({ decks: s.decks.filter((x) => x.id !== id), flashcards: s.flashcards.filter((c) => c.deckId !== id) })),

      addFlashcard: (card) => {
        const now = new Date().toISOString();
        const created: Flashcard = { ...card, id: uid("card"), correctCount: 0, incorrectCount: 0, easeFactor: 2.5, intervalDays: 0, nextReview: now, lastReviewed: null };
        set((s) => ({ flashcards: [...s.flashcards, created] }));
        return created;
      },
      updateFlashcard: (id, patch) => set((s) => ({ flashcards: s.flashcards.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteFlashcard: (id) => set((s) => ({ flashcards: s.flashcards.filter((x) => x.id !== id) })),
      reviewFlashcard: (id, grade) =>
        set((s) => ({
          flashcards: s.flashcards.map((c) => (c.id === id ? { ...c, ...scheduleReview(c, grade) } : c)),
        })),

      addQuiz: (quiz) => {
        const created: Quiz = { ...quiz, id: uid("quiz"), createdAt: new Date().toISOString(), status: "draft", answers: {} };
        set((s) => ({ quizzes: [created, ...s.quizzes] }));
        return created;
      },
      answerQuizQuestion: (quizId, questionId, answer) =>
        set((s) => ({
          quizzes: s.quizzes.map((q) => (q.id === quizId ? { ...q, answers: { ...q.answers, [questionId]: answer } } : q)),
        })),
      startQuiz: (quizId) =>
        set((s) => ({
          quizzes: s.quizzes.map((q) => (q.id === quizId ? { ...q, status: "in-progress", startedAt: new Date().toISOString() } : q)),
        })),
      completeQuiz: (quizId) =>
        set((s) => {
          const quiz = s.quizzes.find((q) => q.id === quizId);
          if (!quiz) return {};
          const total = quiz.questions.length;
          const correct = quiz.questions.filter((q) => (quiz.answers[q.id] ?? "").trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()).length;
          const score = total > 0 ? Math.round((correct / total) * 100) : 0;
          const topicMisses = new Map<string, number>();
          quiz.questions.forEach((q) => {
            const isCorrect = (quiz.answers[q.id] ?? "").trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            if (!isCorrect) topicMisses.set(q.topic, (topicMisses.get(q.topic) ?? 0) + 1);
          });
          const weakTopics = [...topicMisses.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
          return {
            quizzes: s.quizzes.map((q) => (q.id === quizId ? { ...q, status: "completed", completedAt: new Date().toISOString(), score, weakTopics } : q)),
          };
        }),
      deleteQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter((x) => x.id !== id) })),

      addTask: (task) => {
        const created: StudyTask = { ...task, id: uid("task"), createdAt: new Date().toISOString(), completedAt: null };
        set((s) => ({ tasks: [created, ...s.tasks] }));
        return created;
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
      setTaskStatus: (id, status) =>
        set((s) => {
          const tasks = s.tasks.map((x) => (x.id === id ? { ...x, status, completedAt: status === "done" ? new Date().toISOString() : null } : x));
          const task = s.tasks.find((x) => x.id === id);
          if (status === "done" && task?.recurring && task.deadline) {
            const days = { daily: 1, weekly: 7, monthly: 30 }[task.recurring];
            const nextDeadline = new Date(new Date(task.deadline).getTime() + days * 86_400_000).toISOString();
            tasks.unshift({ ...task, id: uid("task"), status: "todo", completedAt: null, deadline: nextDeadline, createdAt: new Date().toISOString() });
          }
          return { tasks };
        }),

      addExam: (exam) => {
        const created: Exam = { ...exam, id: uid("exam"), createdAt: new Date().toISOString() };
        set((s) => ({ exams: [created, ...s.exams] }));
        return created;
      },
      updateExam: (id, patch) => set((s) => ({ exams: s.exams.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteExam: (id) => set((s) => ({ exams: s.exams.filter((x) => x.id !== id) })),
      toggleStudyPlanWeek: (examId, weekNumber) =>
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === examId
              ? { ...e, studyPlan: e.studyPlan.map((w) => (w.weekNumber === weekNumber ? { ...w, done: !w.done } : w)) }
              : e
          ),
        })),

      logStudySession: (session) => set((s) => ({ sessions: [...s.sessions, { ...session, id: uid("sess"), date: session.date ?? new Date().toISOString() }] })),

      createConversation: (input) => {
        const now = new Date().toISOString();
        const created: AIConversation = {
          id: uid("conv"),
          subjectId: input.subjectId ?? null,
          documentId: input.documentId ?? null,
          mode: input.mode,
          title: input.title,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ conversations: [created, ...s.conversations] }));
        return created;
      },
      updateConversation: (id, patch) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)) })),
      deleteConversation: (id) =>
        set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id), messages: s.messages.filter((m) => m.conversationId !== id) })),
      addMessage: (conversationId, role, content) => {
        const created: AIMessage = { id: uid("msg"), conversationId, role, content, createdAt: new Date().toISOString() };
        set((s) => ({ messages: [...s.messages, created] }));
        get().updateConversation(conversationId, {});
        return created;
      },
    }),
    {
      // Replaced with the account's own bucket on sign-in; see adoptAccountData.
      name: SIGNED_OUT_KEY,
      skipHydration: true,
      // `hydrated` is runtime-only — persisting it would make a reload look
      // finished before localStorage has actually been read back.
      partialize: ({ hydrated, ...rest }) => {
        void hydrated;
        return rest;
      },
    }
  )
);

export function useStreakSelector() {
  return useStudyStore((s) => (s.profile ? computeStreak(s.sessions) : 0));
}

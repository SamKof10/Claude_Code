// Domain types for StudyHub. These mirror the relational schema in
// supabase/schema.sql one-to-one (camelCase here, snake_case there) so the
// client-side demo store in src/lib/store can be swapped for real Supabase
// queries later without reshaping the UI layer. See lib/store/README.md.

export type SubjectColor =
  | "subj-1"
  | "subj-2"
  | "subj-3"
  | "subj-4"
  | "subj-5"
  | "subj-6"
  | "subj-7"
  | "subj-8";

export type StudyTime = "morning" | "afternoon" | "evening" | "night";

export interface Profile {
  id: string;
  name: string;
  email: string;
  school: string;
  grade: string;
  schoolYear: string;
  learningGoals: string[];
  preferredStudyTime: StudyTime;
  onboarded: boolean;
  streakDays: number;
  lastActiveDate: string | null;
  aiUsage: { used: number; limit: number };
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: SubjectColor;
  createdAt: string;
}

export type DocumentFileType = "pdf" | "docx" | "image" | "text";
export type DocumentStatus = "processing" | "ready" | "error";

export interface StudyDocument {
  id: string;
  subjectId: string;
  name: string;
  fileType: DocumentFileType;
  uploadDate: string;
  sizeBytes: number;
  pages: number | null;
  status: DocumentStatus;
  tags: string[];
  content: string;
  summary?: string;
  starred?: boolean;
}

export interface Note {
  id: string;
  subjectId: string | null;
  title: string;
  contentHTML: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardDeck {
  id: string;
  subjectId: string | null;
  name: string;
  description: string;
  sourceDocumentId?: string;
  sourceNoteId?: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number;
  intervalDays: number;
  nextReview: string;
  lastReviewed: string | null;
}

export type QuizQuestionType = "mcq" | "true-false" | "short-answer" | "fill-blank";
export type Difficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
}

export type QuizStatus = "draft" | "in-progress" | "completed";

export interface Quiz {
  id: string;
  subjectId: string | null;
  documentId?: string;
  title: string;
  topics: string[];
  difficulty: Difficulty;
  questionTypes: QuizQuestionType[];
  timeLimitMinutes: number | null;
  questions: QuizQuestion[];
  status: QuizStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  answers: Record<string, string>;
  score?: number;
  weakTopics?: string[];
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";
export type RecurringFrequency = "daily" | "weekly" | "monthly";

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string | null;
  description: string;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number | null;
  recurring: RecurringFrequency | null;
  createdAt: string;
  completedAt: string | null;
}

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export interface StudyPlanWeek {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  topics: string[];
  focus: string;
  done: boolean;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  topics: string[];
  currentLevel: KnowledgeLevel;
  availableHoursPerWeek: number;
  studyPlan: StudyPlanWeek[];
  createdAt: string;
}

export type StudySessionType =
  | "flashcards"
  | "quiz"
  | "reading"
  | "notes"
  | "ai-tutor"
  | "document"
  | "focus";

export interface StudySession {
  id: string;
  subjectId: string | null;
  date: string;
  durationMinutes: number;
  type: StudySessionType;
  relatedId?: string;
}

export type TutorMode =
  | "explain"
  | "socratic"
  | "exam"
  | "simplify"
  | "practice"
  | "review";

export interface AIConversation {
  id: string;
  subjectId: string | null;
  documentId: string | null;
  mode: TutorMode;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface SearchIndexEntry {
  id: string;
  kind: "subject" | "document" | "note" | "flashcard-deck" | "task" | "exam" | "quiz" | "conversation";
  title: string;
  subtitle?: string;
  href: string;
  subjectId?: string | null;
}

import type { Difficulty, QuizQuestion, QuizQuestionType, StudyPlanWeek, TutorMode } from "@/lib/types";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  action: "chat";
  messages: ChatTurn[];
  mode: TutorMode;
  subjectName?: string;
  documentContext?: string;
  studentLevel?: string;
}

export interface SummarizeRequest {
  action: "summarize";
  content: string;
  sourceName: string;
}
export interface SummarizeResult {
  summary: string;
  keyPoints: string[];
}

export interface ExplainRequest {
  action: "explain";
  topic: string;
  context?: string;
  style: "simple" | "normal" | "advanced";
}
export interface ExplainResult {
  explanation: string;
}

export interface ConceptsRequest {
  action: "concepts";
  content: string;
}
export interface ConceptsResult {
  concepts: { term: string; definition: string }[];
}

export interface FlashcardsRequest {
  action: "flashcards";
  content: string;
  sourceName: string;
  count: number;
}
export interface FlashcardsResult {
  cards: { front: string; back: string }[];
}

export interface QuizRequest {
  action: "quiz";
  content: string;
  sourceName: string;
  topics: string[];
  count: number;
  difficulty: Difficulty;
  questionTypes: QuizQuestionType[];
  timeLimitMinutes: number | null;
}
export interface QuizResult {
  questions: QuizQuestion[];
}

export interface StudyPlanRequest {
  action: "studyplan";
  subjectName: string;
  examTitle: string;
  examDate: string;
  topics: string[];
  currentLevel: string;
  availableHoursPerWeek: number;
  createdAt: string;
}
export interface StudyPlanResult {
  weeks: StudyPlanWeek[];
}

export interface WeaknessesRequest {
  action: "weaknesses";
  subjectName: string;
  quizSummaries: { title: string; score: number; weakTopics: string[] }[];
  flashcardRetention: number | null;
  taskCompletionRate: number | null;
}
export interface WeaknessesResult {
  weakTopics: string[];
  recommendation: string;
}

export interface DocumentQARequest {
  action: "document-qa";
  question: string;
  documentContent: string;
  documentName: string;
}
export interface DocumentQAResult {
  answer: string;
}

export type AIRequest =
  | ChatRequest
  | SummarizeRequest
  | ExplainRequest
  | ConceptsRequest
  | FlashcardsRequest
  | QuizRequest
  | StudyPlanRequest
  | WeaknessesRequest
  | DocumentQARequest;

export const AI_PROVIDER_LABEL = {
  live: "Live AI",
  demo: "Demo AI",
} as const;

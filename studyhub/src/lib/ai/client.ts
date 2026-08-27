"use client";

// Browser-safe wrapper around POST /api/ai. Never imports the server-only
// provider modules — this is the only surface client components touch.
import type { Difficulty, QuizQuestionType, TutorMode } from "@/lib/types";
import type {
  ChatTurn,
  ConceptsResult,
  DocumentQAResult,
  ExplainResult,
  FlashcardsResult,
  QuizResult,
  StudyPlanResult,
  SummarizeResult,
  WeaknessesResult,
} from "./types";
import type { AISource, WithSource } from "./service";

export class AIClientError extends Error {}

async function post<T>(payload: Record<string, unknown>): Promise<WithSource<T>> {
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AIClientError("Couldn't reach StudyHub's AI service. Check your connection and try again.");
  }
  if (!res.ok) {
    let message = "The AI service ran into a problem. Please try again.";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // keep default message
    }
    throw new AIClientError(message);
  }
  return (await res.json()) as WithSource<T>;
}

export const aiSummarize = (content: string, sourceName: string) => post<SummarizeResult>({ action: "summarize", content, sourceName });

export const aiExplain = (topic: string, context: string | undefined, style: "simple" | "normal" | "advanced" = "normal") =>
  post<ExplainResult>({ action: "explain", topic, context, style });

export const aiConcepts = (content: string) => post<ConceptsResult>({ action: "concepts", content });

export const aiFlashcards = (content: string, sourceName: string, count = 10) =>
  post<FlashcardsResult>({ action: "flashcards", content, sourceName, count });

export const aiQuiz = (opts: { content: string; sourceName: string; topics: string[]; count: number; difficulty: Difficulty; questionTypes: QuizQuestionType[]; timeLimitMinutes: number | null }) =>
  post<QuizResult>({ action: "quiz", ...opts });

export const aiStudyPlan = (opts: { subjectName: string; examTitle: string; examDate: string; topics: string[]; currentLevel: string; availableHoursPerWeek: number; createdAt: string }) =>
  post<StudyPlanResult>({ action: "studyplan", ...opts });

export const aiWeaknesses = (opts: { subjectName: string; quizSummaries: { title: string; score: number; weakTopics: string[] }[]; flashcardRetention: number | null; taskCompletionRate: number | null }) =>
  post<WeaknessesResult>({ action: "weaknesses", ...opts });

export const aiDocumentQA = (question: string, documentContent: string, documentName: string) =>
  post<DocumentQAResult>({ action: "document-qa", question, documentContent, documentName });

export async function streamAIChat(
  opts: {
    messages: ChatTurn[];
    mode: TutorMode;
    subjectName?: string;
    documentContext?: string;
    studentLevel?: string;
  },
  handlers: { onChunk: (text: string) => void; signal?: AbortSignal }
): Promise<{ source: AISource }> {
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "chat", ...opts }),
      signal: handlers.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new AIClientError("Couldn't reach StudyHub's AI service. Check your connection and try again.");
  }

  if (!res.ok || !res.body) {
    throw new AIClientError("The AI Tutor is temporarily unavailable. Please try again.");
  }

  const source = (res.headers.get("x-ai-source") as AISource) ?? "demo";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    handlers.onChunk(decoder.decode(value, { stream: true }));
  }
  return { source };
}

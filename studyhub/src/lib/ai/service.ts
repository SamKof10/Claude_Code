// Provider-agnostic AI service. This is the only module the API route talks
// to — it decides live-vs-demo, calls the right provider, and always
// resolves (even Anthropic failures fall back to the demo generator so the
// product never breaks because a third-party API hiccuped). Server-only.
import type { Difficulty, QuizQuestionType } from "@/lib/types";
import { anthropicComplete, anthropicStream, isLiveAIConfigured } from "./anthropic-provider";
import * as demo from "./demo-provider";
import { GERMAN_OUTPUT_RULE, JSON_ONLY_SUFFIX, tutorSystemPrompt } from "./prompts";
import type {
  ChatTurn,
  ConceptsResult,
  ExplainResult,
  FlashcardsResult,
  QuizResult,
  StudyPlanResult,
  SummarizeResult,
  WeaknessesResult,
} from "./types";

export type AISource = "live" | "demo";
export interface WithSource<T> {
  data: T;
  source: AISource;
}

function extractJSON<T>(text: string): T {
  let candidate = text.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidate = fenced[1].trim();
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  const firstArr = candidate.indexOf("[");
  if (first === -1 || (firstArr !== -1 && firstArr < first)) {
    const lastArr = candidate.lastIndexOf("]");
    candidate = candidate.slice(firstArr, lastArr + 1);
  } else {
    candidate = candidate.slice(first, last + 1);
  }
  return JSON.parse(candidate) as T;
}

async function liveJSON<T>(system: string, userPrompt: string): Promise<T> {
  const text = await anthropicComplete([{ role: "user", content: userPrompt }], { system: system + JSON_ONLY_SUFFIX, maxTokens: 2048 });
  return extractJSON<T>(text);
}

export async function generateSummary(content: string, sourceName: string): Promise<WithSource<SummarizeResult>> {
  if (isLiveAIConfigured()) {
    try {
      const data = await liveJSON<SummarizeResult>(
        "You summarize school study material accurately and concisely for a student.",
        `Summarize the following material from "${sourceName}" and extract 3-6 key points.\nRespond as JSON: {"summary": string, "keyPoints": string[]}.\n\nMATERIAL:\n${content.slice(0, 12000)}`
      );
      return { data, source: "live" };
    } catch {
      // fall through to demo
    }
  }
  return { data: demo.demoSummarize(content, sourceName), source: "demo" };
}

export async function explainTopic(topic: string, context: string | undefined, style: "simple" | "normal" | "advanced" = "normal"): Promise<WithSource<ExplainResult>> {
  if (isLiveAIConfigured()) {
    try {
      const text = await anthropicComplete(
        [
          {
            role: "user",
            content: `Explain "${topic}" to a school student.${style === "simple" ? " Use very simple language and an everyday analogy, as if they're 15." : style === "advanced" ? " Go into real depth and precision." : ""} Use Markdown formatting.${context ? `\n\nRelevant material:\n${context.slice(0, 6000)}` : ""}`,
          },
        ],
        { system: `You are a patient, precise study tutor.\n\n${GERMAN_OUTPUT_RULE}`, maxTokens: 900 }
      );
      return { data: { explanation: text }, source: "live" };
    } catch {
      // fall through
    }
  }
  return { data: demo.demoExplain(topic, context, style), source: "demo" };
}

export async function findConcepts(content: string): Promise<WithSource<ConceptsResult>> {
  if (isLiveAIConfigured()) {
    try {
      const data = await liveJSON<ConceptsResult>(
        "You identify the most important concepts in study material.",
        `List the 4-8 most important concepts in this material with a one-sentence definition each.\nRespond as JSON: {"concepts": [{"term": string, "definition": string}]}.\n\nMATERIAL:\n${content.slice(0, 12000)}`
      );
      return { data, source: "live" };
    } catch {
      // fall through
    }
  }
  return { data: demo.demoConcepts(content), source: "demo" };
}

export async function generateFlashcards(content: string, sourceName: string, count = 10): Promise<WithSource<FlashcardsResult>> {
  if (isLiveAIConfigured()) {
    try {
      const data = await liveJSON<FlashcardsResult>(
        "You write high-quality spaced-repetition flashcards from study material — atomic, unambiguous, testable.",
        `Create exactly ${count} flashcards from "${sourceName}".\nRespond as JSON: {"cards": [{"front": string, "back": string}]}.\n\nMATERIAL:\n${content.slice(0, 12000)}`
      );
      return { data, source: "live" };
    } catch {
      // fall through
    }
  }
  return { data: demo.demoFlashcards(content, sourceName, count), source: "demo" };
}

export async function generateQuiz(opts: {
  content: string;
  sourceName: string;
  topics: string[];
  count: number;
  difficulty: Difficulty;
  questionTypes: QuizQuestionType[];
}): Promise<WithSource<QuizResult>> {
  if (isLiveAIConfigured()) {
    try {
      const data = await liveJSON<QuizResult>(
        "You write rigorous, exam-quality quiz questions from study material, calibrated to the requested difficulty.",
        `Create exactly ${opts.count} quiz questions from "${opts.sourceName}" at ${opts.difficulty} difficulty, using only these question types: ${opts.questionTypes.join(", ")}. Topics to prioritize: ${opts.topics.join(", ") || "infer from the material"}.\nRespond as JSON: {"questions": [{"id": string, "type": "mcq"|"true-false"|"short-answer"|"fill-blank", "prompt": string, "options": string[] (mcq/true-false only), "correctAnswer": string, "explanation": string, "topic": string, "difficulty": string}]}.\n\nMATERIAL:\n${opts.content.slice(0, 12000)}`
      );
      data.questions = data.questions.map((q) => ({ ...q, id: q.id || crypto.randomUUID() }));
      return { data, source: "live" };
    } catch {
      // fall through
    }
  }
  return { data: demo.demoQuiz(opts.content, opts.sourceName, opts.topics, opts.count, opts.difficulty, opts.questionTypes), source: "demo" };
}

export async function createStudyPlan(opts: {
  subjectName: string;
  examTitle: string;
  examDate: string;
  topics: string[];
  currentLevel: string;
  availableHoursPerWeek: number;
  createdAt: string;
}): Promise<WithSource<StudyPlanResult>> {
  if (isLiveAIConfigured()) {
    try {
      const data = await liveJSON<StudyPlanResult>(
        "You are an expert study coach who builds realistic, week-by-week exam preparation plans.",
        `Build a week-by-week study plan for "${opts.examTitle}" (${opts.subjectName}), exam date ${opts.examDate}, created ${opts.createdAt}. Student level: ${opts.currentLevel}. Available: ${opts.availableHoursPerWeek}h/week. Topics: ${opts.topics.join(", ")}. The final week must focus on practice exams and weak-topic review.\nRespond as JSON: {"weeks": [{"weekNumber": number, "label": string, "startDate": ISO string, "endDate": ISO string, "topics": string[], "focus": string, "done": false}]}.`
      );
      return { data, source: "live" };
    } catch {
      // fall through
    }
  }
  return { data: demo.demoStudyPlan(opts), source: "demo" };
}

export async function analyzeWeaknesses(opts: {
  subjectName: string;
  quizSummaries: { title: string; score: number; weakTopics: string[] }[];
  flashcardRetention: number | null;
  taskCompletionRate: number | null;
}): Promise<WithSource<WeaknessesResult>> {
  if (isLiveAIConfigured()) {
    try {
      const data = await liveJSON<WeaknessesResult>(
        "You are a data-driven study coach who turns a student's own performance data into a specific, actionable recommendation.",
        `Analyze this student's performance in ${opts.subjectName} and identify weak topics plus one specific recommendation.\nQuiz history: ${JSON.stringify(opts.quizSummaries)}\nFlashcard retention: ${opts.flashcardRetention}\nTask completion rate: ${opts.taskCompletionRate}\nRespond as JSON: {"weakTopics": string[], "recommendation": string}.`
      );
      return { data, source: "live" };
    } catch {
      // fall through
    }
  }
  return { data: demo.demoWeaknesses(opts), source: "demo" };
}

export async function answerDocumentQuestion(question: string, documentContent: string, documentName: string): Promise<WithSource<{ answer: string }>> {
  if (isLiveAIConfigured()) {
    try {
      const text = await anthropicComplete(
        [{ role: "user", content: `Document "${documentName}":\n"""${documentContent.slice(0, 12000)}"""\n\nQuestion: ${question}` }],
        { system: `Answer the student's question using the provided document as ground truth. If the document doesn't cover it, say so explicitly before adding outside knowledge. Use Markdown.\n\n${GERMAN_OUTPUT_RULE}`, maxTokens: 900 }
      );
      return { data: { answer: text }, source: "live" };
    } catch {
      // fall through
    }
  }
  const heuristic = demo.demoExplain(question, documentContent, "normal");
  return { data: { answer: heuristic.explanation }, source: "demo" };
}

export interface StreamChatResult {
  stream: ReadableStream<Uint8Array>;
  source: AISource;
}

export async function streamTutorReply(opts: {
  messages: ChatTurn[];
  mode: import("@/lib/types").TutorMode;
  subjectName?: string;
  documentContext?: string;
  studentLevel?: string;
}): Promise<StreamChatResult> {
  if (isLiveAIConfigured()) {
    try {
      const stream = await anthropicStream(opts.messages, { system: tutorSystemPrompt(opts), maxTokens: 1200 });
      return { stream, source: "live" };
    } catch {
      // fall through to demo streaming below
    }
  }

  const fullText = demo.demoChatReply(opts.messages, opts.mode, opts.subjectName, opts.documentContext);
  const words = fullText.split(/(\s+)/);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((r) => setTimeout(r, 12 + Math.random() * 18));
      }
      controller.close();
    },
  });
  return { stream, source: "demo" };
}

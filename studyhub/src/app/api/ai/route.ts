import { NextResponse } from "next/server";
import { isLiveAIConfigured } from "@/lib/ai/anthropic-provider";
import {
  analyzeWeaknesses,
  answerDocumentQuestion,
  createStudyPlan,
  explainTopic,
  findConcepts,
  generateFlashcards,
  generateQuiz,
  generateSummary,
  streamTutorReply,
} from "@/lib/ai/service";
import type { AIRequest } from "@/lib/ai/types";

export async function GET() {
  return NextResponse.json({ liveConfigured: isLiveAIConfigured() });
}

export async function POST(request: Request) {
  let body: AIRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrageinhalt." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("action" in body)) {
    return NextResponse.json({ error: "Aktion fehlt." }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "chat": {
        const { stream, source } = await streamTutorReply({
          messages: body.messages,
          mode: body.mode,
          subjectName: body.subjectName,
          documentContext: body.documentContext,
          studentLevel: body.studentLevel,
        });
        return new Response(stream, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "x-ai-source": source,
            "cache-control": "no-store",
          },
        });
      }

      case "summarize": {
        const result = await generateSummary(body.content, body.sourceName);
        return NextResponse.json(result);
      }

      case "explain": {
        const result = await explainTopic(body.topic, body.context, body.style);
        return NextResponse.json(result);
      }

      case "concepts": {
        const result = await findConcepts(body.content);
        return NextResponse.json(result);
      }

      case "flashcards": {
        const result = await generateFlashcards(body.content, body.sourceName, body.count);
        return NextResponse.json(result);
      }

      case "quiz": {
        const result = await generateQuiz({
          content: body.content,
          sourceName: body.sourceName,
          topics: body.topics,
          count: body.count,
          difficulty: body.difficulty,
          questionTypes: body.questionTypes,
        });
        return NextResponse.json(result);
      }

      case "studyplan": {
        const result = await createStudyPlan(body);
        return NextResponse.json(result);
      }

      case "weaknesses": {
        const result = await analyzeWeaknesses(body);
        return NextResponse.json(result);
      }

      case "document-qa": {
        const result = await answerDocumentQuestion(body.question, body.documentContent, body.documentName);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
    }
  } catch (err) {
    console.error("[api/ai]", err);
    return NextResponse.json({ error: "Der KI-Dienst ist gerade nicht erreichbar. Versuch es bitte nochmal." }, { status: 500 });
  }
}

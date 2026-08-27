// Deterministic, content-aware "demo AI" used whenever ANTHROPIC_API_KEY is
// not configured. It never returns static boilerplate detached from the
// user's own data — every function reads the actual content it's given
// (a document, a note, a topic name, quiz history) and derives a plausible
// answer from it with simple heuristics. This keeps the app fully usable,
// and honest about being a stand-in, out of the box.
import { uid } from "@/lib/utils";
import type { Difficulty, QuizQuestion, QuizQuestionType, StudyPlanWeek } from "@/lib/types";
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

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 320);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{1,2}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 25);
}

function titleCaseTerm(s: string): string {
  return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

export function demoSummarize(content: string, sourceName: string): SummarizeResult {
  const sentences = splitSentences(content);
  const paragraphs = splitParagraphs(content);
  const lead = sentences.slice(0, 3).join(" ") || content.slice(0, 240);
  const keyPoints = (paragraphs.length > 1 ? paragraphs : sentences)
    .slice(0, 5)
    .map((p) => splitSentences(p)[0] ?? p)
    .map((s) => s.replace(/^[A-Z0-9.]+\s+/, "").trim())
    .filter(Boolean);

  return {
    summary: `${lead}${sentences.length > 3 ? " " + sentences.slice(3, 5).join(" ") : ""}`.trim() || `A concise overview of "${sourceName}".`,
    keyPoints: keyPoints.length > 0 ? keyPoints : [`"${sourceName}" doesn't have enough extractable text yet — try re-uploading or add a note.`],
  };
}

const STYLE_OPENERS: Record<ExplainRequestStyle, string> = {
  simple: "Let's break this down in plain, everyday language",
  normal: "Here's a clear explanation",
  advanced: "Here's a more rigorous treatment",
};
type ExplainRequestStyle = "simple" | "normal" | "advanced";

export function demoExplain(topic: string, context: string | undefined, style: ExplainRequestStyle): ExplainResult {
  const facts = context ? splitSentences(context).slice(0, 3) : [];
  const opener = STYLE_OPENERS[style] ?? STYLE_OPENERS.normal;
  const bulletBlock = facts.length
    ? `\n\nFrom your material:\n${facts.map((f) => `- ${f}`).join("\n")}`
    : "";

  const analogy =
    style === "simple"
      ? `\n\nThink of it like this: if you already understand something familiar, ${topic.toLowerCase()} works on a similar idea — the details differ, but the underlying pattern (cause leads predictably to effect) is the same one you already use every day.`
      : "";

  return {
    explanation:
      `${opener} of **${topic}**.${bulletBlock}\n\n` +
      `The core idea is that ${topic.toLowerCase()} follows a small number of rules, and once you can state those rules in your own words, most exam questions on this topic become a matter of applying them carefully rather than memorizing new facts.${analogy}\n\n` +
      `Quick check: could you explain ${topic.toLowerCase()} to a classmate in two sentences? If not, that's the part worth reviewing again.`,
  };
}

export function demoConcepts(content: string): ConceptsResult {
  const sentences = splitSentences(content);
  const concepts: { term: string; definition: string }[] = [];
  const definitionPattern = /^([A-Z][A-Za-z0-9 '-]{2,40}?)\s+(?:is|are|refers to|means)\s+(.+)$/;

  for (const s of sentences) {
    const match = s.match(definitionPattern);
    if (match) {
      const term = match[1].trim();
      if (term.split(" ").length <= 5 && !concepts.some((c) => c.term.toLowerCase() === term.toLowerCase())) {
        concepts.push({ term, definition: s });
      }
    }
    if (concepts.length >= 6) break;
  }

  if (concepts.length < 3) {
    splitSentences(content)
      .slice(0, 6 - concepts.length)
      .forEach((s, i) => concepts.push({ term: `Key idea ${concepts.length + i + 1}`, definition: s }));
  }

  return { concepts: concepts.slice(0, 6) };
}

export function demoFlashcards(content: string, sourceName: string, count: number): FlashcardsResult {
  const sentences = splitSentences(content);
  const definitionPattern = /^([A-Z][A-Za-z0-9 '-]{2,40}?)\s+(?:is|are|refers to|means|equals?)\s+(.+)$/;
  const cards: { front: string; back: string }[] = [];

  for (const s of sentences) {
    const match = s.match(definitionPattern);
    if (match) {
      cards.push({ front: `What ${/s$/.test(match[1].trim()) ? "are" : "is"} ${titleCaseTerm(match[1].trim())}?`, back: s });
    } else if (s.includes(":")) {
      const [left, right] = s.split(":");
      if (left.length < 60 && right.length > 10) {
        cards.push({ front: `${left.trim()}?`, back: s });
      }
    }
    if (cards.length >= count) break;
  }

  let i = 0;
  while (cards.length < count && i < sentences.length) {
    const s = sentences[i];
    if (!cards.some((c) => c.back === s)) {
      cards.push({ front: `Fill in the key idea: what does this cover — "${s.slice(0, 46)}${s.length > 46 ? "…" : ""}"?`, back: s });
    }
    i++;
  }

  if (cards.length === 0) {
    cards.push({ front: `What is "${sourceName}" mainly about?`, back: content.slice(0, 200) || "Add more content to generate richer flashcards." });
  }

  return { cards: cards.slice(0, count) };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(((i + 7) * 2654435761) % (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function demoQuiz(
  content: string,
  sourceName: string,
  topics: string[],
  count: number,
  difficulty: Difficulty,
  questionTypes: QuizQuestionType[]
): QuizResult {
  const sentences = splitSentences(content);
  const definitionPattern = /^([A-Z][A-Za-z0-9 '-]{2,40}?)\s+(?:is|are|refers to|means|equals?)\s+(.+)$/;
  const defs = sentences.map((s) => ({ sentence: s, match: s.match(definitionPattern) })).filter((d) => d.match);
  const types = questionTypes.length > 0 ? questionTypes : (["mcq", "true-false", "short-answer"] as QuizQuestionType[]);
  const topicFor = (i: number) => topics[i % Math.max(1, topics.length)] ?? sourceName;

  const questions: QuizQuestion[] = [];
  const usedSentences = new Set<string>();

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const topic = topicFor(i);
    const pool = defs.filter((d) => !usedSentences.has(d.sentence));
    const source = pool[i % Math.max(1, pool.length)] ?? { sentence: sentences[i % Math.max(1, sentences.length)] ?? content, match: null };
    usedSentences.add(source.sentence);
    const term = source.match?.[1]?.trim();
    const definition = source.match?.[2]?.trim() ?? source.sentence;

    if (type === "mcq" && term) {
      const distractorPool = defs.filter((d) => d.match && d.match[1].trim() !== term).map((d) => d.match![2].trim());
      const distractors = shuffle(distractorPool).slice(0, 3);
      while (distractors.length < 3) distractors.push(`Not related to ${term.toLowerCase()}`);
      const options = shuffle([definition, ...distractors]);
      questions.push({
        id: uid("q"),
        type: "mcq",
        prompt: `What ${/s$/.test(term) ? "are" : "is"} ${term}?`,
        options,
        correctAnswer: definition,
        explanation: source.sentence,
        topic,
        difficulty,
      });
    } else if (type === "true-false") {
      const flip = i % 2 === 1;
      const statement = flip ? `${source.sentence.replace(/\b(is|are)\b/, (m) => (m === "is" ? "is not" : "are not"))}` : source.sentence;
      questions.push({
        id: uid("q"),
        type: "true-false",
        prompt: statement,
        options: ["True", "False"],
        correctAnswer: flip ? "False" : "True",
        explanation: source.sentence,
        topic,
        difficulty,
      });
    } else if (type === "fill-blank" && term) {
      questions.push({
        id: uid("q"),
        type: "fill-blank",
        prompt: source.sentence.replace(new RegExp(term, "i"), "_____"),
        correctAnswer: term,
        explanation: source.sentence,
        topic,
        difficulty,
      });
    } else {
      questions.push({
        id: uid("q"),
        type: "short-answer",
        prompt: term ? `Briefly explain: what ${/s$/.test(term) ? "are" : "is"} ${term}?` : `Briefly explain the key idea: "${source.sentence.slice(0, 60)}${source.sentence.length > 60 ? "…" : ""}"`,
        correctAnswer: definition,
        explanation: source.sentence,
        topic,
        difficulty,
      });
    }
  }

  return { questions };
}

export function demoStudyPlan(opts: {
  subjectName: string;
  examTitle: string;
  examDate: string;
  topics: string[];
  currentLevel: string;
  availableHoursPerWeek: number;
  createdAt: string;
}): StudyPlanResult {
  const start = new Date(opts.createdAt);
  const end = new Date(opts.examDate);
  const totalDays = Math.max(7, Math.round((end.getTime() - start.getTime()) / 86_400_000));
  const totalWeeks = Math.max(1, Math.min(6, Math.round(totalDays / 7)));
  const topics = opts.topics.length > 0 ? opts.topics : [`${opts.subjectName} fundamentals`];

  const weeks: StudyPlanWeek[] = [];
  const contentWeeks = Math.max(1, totalWeeks - 1);
  for (let w = 0; w < contentWeeks; w++) {
    const weekStart = new Date(start.getTime() + w * 7 * 86_400_000);
    const weekTopics = topics.filter((_, idx) => idx % contentWeeks === w);
    weeks.push({
      weekNumber: w + 1,
      label: `Week ${w + 1}`,
      startDate: weekStart.toISOString(),
      endDate: new Date(weekStart.getTime() + 6 * 86_400_000).toISOString(),
      topics: weekTopics.length > 0 ? weekTopics : [topics[w % topics.length]],
      focus:
        opts.currentLevel === "beginner"
          ? "Build the fundamentals from scratch — go slow, take notes, don't skip ahead."
          : opts.currentLevel === "advanced"
            ? "Deepen and stress-test your understanding with harder problems."
            : "Reinforce what you know and close specific gaps.",
      done: false,
    });
  }
  const lastWeekStart = new Date(start.getTime() + contentWeeks * 7 * 86_400_000);
  weeks.push({
    weekNumber: totalWeeks,
    label: `Week ${totalWeeks}`,
    startDate: lastWeekStart.toISOString(),
    endDate: opts.examDate,
    topics: ["Practice exams", "Weak-topic review"],
    focus: `Simulate the real exam under time pressure, then spend the remaining time only on what you got wrong. With ~${opts.availableHoursPerWeek}h/week available, prioritize ruthlessly.`,
    done: false,
  });

  return { weeks };
}

export function demoWeaknesses(opts: {
  subjectName: string;
  quizSummaries: { title: string; score: number; weakTopics: string[] }[];
  flashcardRetention: number | null;
  taskCompletionRate: number | null;
}): WeaknessesResult {
  const topicCounts = new Map<string, number>();
  opts.quizSummaries.forEach((q) => q.weakTopics.forEach((t) => topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1)));
  const weakTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);

  const avgScore = opts.quizSummaries.length
    ? Math.round(opts.quizSummaries.reduce((a, q) => a + q.score, 0) / opts.quizSummaries.length)
    : null;

  const bits: string[] = [];
  if (avgScore != null) bits.push(`Your average quiz score in ${opts.subjectName} is ${avgScore}%.`);
  if (weakTopics.length) bits.push(`You consistently lose points on ${weakTopics.slice(0, 2).join(" and ")}.`);
  if (opts.flashcardRetention != null && opts.flashcardRetention < 70) bits.push(`Flashcard retention is ${opts.flashcardRetention}%, lower than it should be — increase review frequency.`);
  if (opts.taskCompletionRate != null && opts.taskCompletionRate < 60) bits.push(`Only ${opts.taskCompletionRate}% of ${opts.subjectName} tasks are completed, which is likely compounding the gap.`);
  bits.push(
    weakTopics.length
      ? `Focus your next study session on ${weakTopics[0]} specifically, with active recall rather than re-reading.`
      : `Keep practicing with mixed-topic quizzes to surface any remaining gaps.`
  );

  return { weakTopics, recommendation: bits.join(" ") };
}

const MODE_OPENERS: Record<string, string[]> = {
  explain: ["Here's how to think about it:", "Let's walk through this step by step."],
  socratic: ["Before I answer — what do *you* think happens first, and why?", "Good question. What's the first rule you'd reach for here?"],
  exam: ["Examiner mode: answer this precisely before I confirm.", "Let's treat this like a real exam question."],
  simplify: ["Simple version:", "In plain terms:"],
  practice: ["Try this one:", "Here's a quick exercise:"],
  review: ["Let's check what's solid and what's shaky — explain it back to me first.", "Tell me in your own words, then I'll fill the gaps."],
};

export function demoChatReply(messages: ChatTurn[], mode: string, subjectName: string | undefined, documentContext: string | undefined): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "your question";
  const openers = MODE_OPENERS[mode] ?? MODE_OPENERS.explain;
  const opener = openers[messages.length % openers.length];
  const contextLine = documentContext
    ? `\n\nBased on the document you have open: ${splitSentences(documentContext).slice(0, 2).join(" ")}`
    : "";
  const subjectLine = subjectName ? ` in ${subjectName}` : "";

  if (mode === "socratic") {
    return `${opener}\n\nThink about "${lastUser}"${subjectLine} — what's the very first step or definition you'd need before anything else makes sense? Try answering that, and we'll build up from there together.${contextLine}`;
  }
  if (mode === "exam") {
    return `${opener}\n\n**Question:** ${lastUser}\n\nGive your best full answer. I'll grade it for accuracy and completeness, and tell you exactly what's missing.${contextLine}`;
  }
  if (mode === "practice") {
    return `${opener}\n\nUsing what you just asked about ("${lastUser}"), try to solve a related problem${subjectLine} on your own first. Write out your steps — I'll check your reasoning, not just the final answer.${contextLine}`;
  }

  return `${opener}\n\nOn "${lastUser}"${subjectLine}: the key is to identify the underlying rule and apply it consistently rather than memorizing the specific example.${contextLine}\n\nWant me to go deeper, give you a practice question, or turn this into flashcards?`;
}

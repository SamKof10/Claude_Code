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
    summary: `${lead}${sentences.length > 3 ? " " + sentences.slice(3, 5).join(" ") : ""}`.trim() || `Ein kurzer Überblick über „${sourceName}“.`,
    keyPoints: keyPoints.length > 0 ? keyPoints : [`„${sourceName}“ enthält noch zu wenig auslesbaren Text — lade es neu hoch oder ergänze eine Notiz.`],
  };
}

const STYLE_OPENERS: Record<ExplainRequestStyle, string> = {
  simple: "Zerlegen wir das in ganz einfache Alltagssprache",
  normal: "Hier eine klare Erklärung",
  advanced: "Hier die genauere Fassung",
};
type ExplainRequestStyle = "simple" | "normal" | "advanced";

export function demoExplain(topic: string, context: string | undefined, style: ExplainRequestStyle): ExplainResult {
  const facts = context ? splitSentences(context).slice(0, 3) : [];
  const opener = STYLE_OPENERS[style] ?? STYLE_OPENERS.normal;
  const bulletBlock = facts.length
    ? `\n\nAus deinem Material:\n${facts.map((f) => `- ${f}`).join("\n")}`
    : "";

  const analogy =
    style === "simple"
      ? `\n\nStell es dir so vor: ${topic} funktioniert nach einer Idee, die du aus dem Alltag schon kennst — die Details sind andere, aber das Muster dahinter (aus einer Ursache folgt verlässlich eine Wirkung) ist dasselbe.`
      : "";

  return {
    explanation:
      `${opener} zu **${topic}**.${bulletBlock}\n\n` +
      `Der Kern: ${topic} folgt wenigen Regeln. Sobald du diese Regeln in eigenen Worten sagen kannst, sind die meisten Prüfungsfragen dazu eine Frage des sorgfältigen Anwendens — nicht des Auswendiglernens.${analogy}\n\n` +
      `Kurzer Test: Könntest du ${topic} einer Mitschülerin in zwei Sätzen erklären? Wenn nicht, ist genau das die Stelle zum Wiederholen.`,
  };
}

export function demoConcepts(content: string): ConceptsResult {
  const sentences = splitSentences(content);
  const concepts: { term: string; definition: string }[] = [];
  // German first, since the material usually is; the English copulas stay so
  // that English-language sources (an English textbook, say) still work.
  const definitionPattern = /^([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9 '-]{2,40}?)\s+(?:ist|sind|bezeichnet|bedeutet|meint|is|are|refers to|means)\s+(.+)$/;

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
      .forEach((s, i) => concepts.push({ term: `Kernidee ${concepts.length + i + 1}`, definition: s }));
  }

  return { concepts: concepts.slice(0, 6) };
}

export function demoFlashcards(content: string, sourceName: string, count: number): FlashcardsResult {
  const sentences = splitSentences(content);
  const definitionPattern = /^([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9 '-]{2,40}?)\s+(?:ist|sind|bezeichnet|bedeutet|meint|is|are|refers to|means|equals?)\s+(.+)$/;
  const cards: { front: string; back: string }[] = [];

  for (const s of sentences) {
    const match = s.match(definitionPattern);
    if (match) {
      cards.push({ front: `Was versteht man unter ${titleCaseTerm(match[1].trim())}?`, back: s });
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
      cards.push({ front: `Worum geht es hier — „${s.slice(0, 46)}${s.length > 46 ? "…" : ""}“?`, back: s });
    }
    i++;
  }

  if (cards.length === 0) {
    cards.push({ front: `Worum geht es in „${sourceName}“ hauptsächlich?`, back: content.slice(0, 200) || "Ergänze mehr Inhalt, dann werden die Karteikarten ergiebiger." });
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
  const definitionPattern = /^([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9 '-]{2,40}?)\s+(?:ist|sind|bezeichnet|bedeutet|meint|is|are|refers to|means|equals?)\s+(.+)$/;
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
      while (distractors.length < 3) distractors.push(`Hat mit ${term} nichts zu tun`);
      const options = shuffle([definition, ...distractors]);
      questions.push({
        id: uid("q"),
        type: "mcq",
        prompt: `Was versteht man unter ${term}?`,
        options,
        correctAnswer: definition,
        explanation: source.sentence,
        topic,
        difficulty,
      });
    } else if (type === "true-false") {
      const flip = i % 2 === 1;
      const statement = flip
        ? source.sentence.replace(/\b(ist|sind|is|are)\b/, (m) => ({ ist: "ist nicht", sind: "sind nicht", is: "is not", are: "are not" })[m] ?? m)
        : source.sentence;
      questions.push({
        id: uid("q"),
        type: "true-false",
        prompt: statement,
        options: ["Wahr", "Falsch"],
        correctAnswer: flip ? "Falsch" : "Wahr",
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
        prompt: term ? `Erklär kurz: Was versteht man unter ${term}?` : `Erklär kurz den Kerngedanken: „${source.sentence.slice(0, 60)}${source.sentence.length > 60 ? "…" : ""}“`,
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
  const topics = opts.topics.length > 0 ? opts.topics : [`Grundlagen ${opts.subjectName}`];

  const weeks: StudyPlanWeek[] = [];
  const contentWeeks = Math.max(1, totalWeeks - 1);
  for (let w = 0; w < contentWeeks; w++) {
    const weekStart = new Date(start.getTime() + w * 7 * 86_400_000);
    const weekTopics = topics.filter((_, idx) => idx % contentWeeks === w);
    weeks.push({
      weekNumber: w + 1,
      label: `Woche ${w + 1}`,
      startDate: weekStart.toISOString(),
      endDate: new Date(weekStart.getTime() + 6 * 86_400_000).toISOString(),
      topics: weekTopics.length > 0 ? weekTopics : [topics[w % topics.length]],
      focus:
        opts.currentLevel === "beginner"
          ? "Grundlagen von Grund auf aufbauen — langsam vorgehen, mitschreiben, nichts überspringen."
          : opts.currentLevel === "advanced"
            ? "Verständnis vertiefen und mit schwereren Aufgaben auf die Probe stellen."
            : "Festigen, was sitzt, und gezielt die Lücken schließen.",
      done: false,
    });
  }
  const lastWeekStart = new Date(start.getTime() + contentWeeks * 7 * 86_400_000);
  weeks.push({
    weekNumber: totalWeeks,
    label: `Woche ${totalWeeks}`,
    startDate: lastWeekStart.toISOString(),
    endDate: opts.examDate,
    topics: ["Probeprüfungen", "Schwache Themen wiederholen"],
    focus: `Die Prüfung unter Zeitdruck simulieren und die restliche Zeit nur noch in das stecken, was falsch war. Bei rund ${opts.availableHoursPerWeek} Stunden pro Woche heißt das: konsequent priorisieren.`,
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
  if (avgScore != null) bits.push(`Dein Quiz-Schnitt in ${opts.subjectName} liegt bei ${avgScore}%.`);
  if (weakTopics.length) bits.push(`Punkte verlierst du regelmäßig bei ${weakTopics.slice(0, 2).join(" und ")}.`);
  if (opts.flashcardRetention != null && opts.flashcardRetention < 70) bits.push(`Die Behaltensquote liegt bei ${opts.flashcardRetention}% — zu niedrig. Wiederhol öfter.`);
  if (opts.taskCompletionRate != null && opts.taskCompletionRate < 60) bits.push(`Nur ${opts.taskCompletionRate}% der Aufgaben in ${opts.subjectName} sind erledigt — das vergrößert den Rückstand zusätzlich.`);
  bits.push(
    weakTopics.length
      ? `Nimm dir in der nächsten Lerneinheit gezielt ${weakTopics[0]} vor — aktiv abfragen statt nochmal durchlesen.`
      : `Üb weiter mit gemischten Quiz, damit übrige Lücken sichtbar werden.`
  );

  return { weakTopics, recommendation: bits.join(" ") };
}

const MODE_OPENERS: Record<string, string[]> = {
  explain: ["So kannst du es dir denken:", "Gehen wir das Schritt für Schritt durch."],
  socratic: ["Bevor ich antworte — was passiert *deiner Meinung nach* zuerst, und warum?", "Gute Frage. Zu welcher Regel würdest du hier als Erstes greifen?"],
  exam: ["Prüfungsmodus: Antworte präzise, bevor ich bestätige.", "Behandeln wir das wie eine echte Prüfungsfrage."],
  simplify: ["Die einfache Version:", "Ganz schlicht gesagt:"],
  practice: ["Probier die hier:", "Eine kurze Übung:"],
  review: ["Schauen wir, was sitzt und was wackelt — erklär es mir zuerst selbst.", "Sag es in eigenen Worten, dann fülle ich die Lücken."],
};

export function demoChatReply(messages: ChatTurn[], mode: string, subjectName: string | undefined, documentContext: string | undefined): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "deine Frage";
  const openers = MODE_OPENERS[mode] ?? MODE_OPENERS.explain;
  const opener = openers[messages.length % openers.length];
  const contextLine = documentContext
    ? `\n\nAus dem Dokument, das du offen hast: ${splitSentences(documentContext).slice(0, 2).join(" ")}`
    : "";
  const subjectLine = subjectName ? ` in ${subjectName}` : "";

  if (mode === "socratic") {
    return `${opener}\n\nDenk an „${lastUser}“${subjectLine} — welcher erste Schritt oder welche Definition muss sitzen, bevor der Rest Sinn ergibt? Beantworte das, dann bauen wir von dort aus weiter.${contextLine}`;
  }
  if (mode === "exam") {
    return `${opener}\n\n**Frage:** ${lastUser}\n\nGib deine beste vollständige Antwort. Ich bewerte sie auf Richtigkeit und Vollständigkeit und sage dir genau, was fehlt.${contextLine}`;
  }
  if (mode === "practice") {
    return `${opener}\n\nNimm das, wonach du gerade gefragt hast („${lastUser}“), und löse zuerst selbst eine passende Aufgabe${subjectLine}. Schreib deine Schritte auf — ich prüfe deinen Weg, nicht nur das Ergebnis.${contextLine}`;
  }

  return `${opener}\n\nZu „${lastUser}“${subjectLine}: Entscheidend ist, die dahinterliegende Regel zu erkennen und konsequent anzuwenden — nicht das einzelne Beispiel auswendig zu lernen.${contextLine}\n\nSoll ich tiefer gehen, dir eine Übungsfrage geben oder Karteikarten daraus machen?`;
}

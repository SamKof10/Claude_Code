import { VOCAB_WORDS } from "./vocabulary";
import { GRAMMAR_CHALLENGES, type GrammarChallenge } from "./grammar";
import { LISTENING_EXERCISES } from "./listening";
import { WRITING_TASKS, type WritingTask } from "./writing";

/** Deterministic per-month shuffle — the same month always draws the same
 * set, but each month draws a different one (mirrors `seededFraction` in
 * `lib/scoring.ts`: stable, not random-on-every-render). */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface McqTestItem {
  kind: "vocab" | "listening";
  id: string;
  prompt: string;
  context?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface FixTestItem {
  kind: "grammar";
  id: string;
  broken: string;
  fixed: string;
  explanation: string;
}

export interface WriteTestItem {
  kind: "writing";
  id: string;
  task: WritingTask;
}

export type MonthlyTestItem = McqTestItem | FixTestItem | WriteTestItem;

const VOCAB_COUNT = 4;
const GRAMMAR_COUNT = 4;
const LISTENING_COUNT = 2;

function buildVocabItems(monthIndex: number): McqTestItem[] {
  const picks = seededShuffle(VOCAB_WORDS, monthIndex * 17 + 3).slice(0, VOCAB_COUNT);
  return picks.map((w) => {
    const distractors = seededShuffle(
      VOCAB_WORDS.filter((o) => o.id !== w.id).map((o) => o.cloze.answer),
      monthIndex * 31 + w.word.length,
    ).slice(0, 3);
    const options = seededShuffle([w.cloze.answer, ...distractors], monthIndex * 7 + w.word.length);
    return {
      kind: "vocab",
      id: `vocab-${w.id}`,
      prompt: w.cloze.sentence,
      options,
      answerIndex: options.indexOf(w.cloze.answer),
      explanation: `${w.word} — ${w.meaning}`,
    };
  });
}

function buildGrammarItems(monthIndex: number): FixTestItem[] {
  return seededShuffle(GRAMMAR_CHALLENGES, monthIndex * 41 + 9)
    .slice(0, GRAMMAR_COUNT)
    .map((c: GrammarChallenge) => ({ kind: "grammar", id: `grammar-${c.id}`, broken: c.broken, fixed: c.fixed, explanation: c.explanation }));
}

function buildListeningItems(monthIndex: number): McqTestItem[] {
  return seededShuffle(LISTENING_EXERCISES, monthIndex * 53 + 13)
    .slice(0, LISTENING_COUNT)
    .map((ex) => {
      const q = ex.questions[0];
      return {
        kind: "listening",
        id: `listening-${ex.id}`,
        prompt: q.q,
        context: ex.transcript,
        options: q.options,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      };
    });
}

function buildWritingItem(monthIndex: number): WriteTestItem {
  const task = seededShuffle(WRITING_TASKS, monthIndex * 61 + 19)[0];
  return { kind: "writing", id: `writing-${task.id}`, task };
}

/** Assembles one monthly check-in: 4 vocabulary MCQs, 4 grammar fixes, 2
 * listening comprehension questions and one short writing task — sampled
 * from the same pools the daily practice draws from, so the test measures
 * exactly what was practised. */
export function buildMonthlyTest(monthIndex: number): MonthlyTestItem[] {
  return [...buildVocabItems(monthIndex), ...buildGrammarItems(monthIndex), ...buildListeningItems(monthIndex), buildWritingItem(monthIndex)];
}

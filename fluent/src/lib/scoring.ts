import { CONNECTORS } from "./content/c1c2";
import { ADVANCED_IDIOMS } from "./content/c1c2";
import type { WritingTask } from "./content/writing";

/** Deterministic 0–1 pseudo-random value derived from a string — keeps demo
 * scores stable for the same input instead of jumping around on re-render. */
function seededFraction(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

export function clampScore(n: number): number {
  return Math.max(38, Math.min(98, Math.round(n)));
}

export interface SpeakingAnalysis {
  fluency: number;
  vocabulary: number;
  grammar: number;
  naturalness: number;
  pronunciation: number;
}

/** No real speech recognition is wired up — this produces a believable demo
 * analysis, seeded by prompt id + attempt so retries feel like they improve. */
export function mockSpeakingAnalysis(promptId: string, attempt: number): SpeakingAnalysis {
  const base = seededFraction(promptId + attempt) * 18;
  const growth = Math.min(attempt * 3, 12);
  return {
    fluency: clampScore(66 + base + growth + Math.random() * 8),
    vocabulary: clampScore(62 + base * 0.8 + growth + Math.random() * 8),
    grammar: clampScore(70 + base * 0.6 + growth + Math.random() * 6),
    naturalness: clampScore(58 + base + growth + Math.random() * 10),
    pronunciation: clampScore(68 + base * 0.7 + growth + Math.random() * 8),
  };
}

export interface WritingAnalysis {
  grammar: number;
  vocabulary: number;
  structure: number;
  naturalness: number;
  wordCount: number;
  c1Features: string[];
  suggestions: string[];
}

const MARKER_PHRASES = [
  ...CONNECTORS.map((c) => c.phrase.replace(/[…,]/g, "").trim().toLowerCase()),
  ...ADVANCED_IDIOMS.map((i) => i.phrase.toLowerCase()),
  "arguably",
  "it could be argued",
  "to some extent",
  "on balance",
  "nonetheless",
  "not only",
];

export function analyzeWriting(text: string, task: WritingTask): WritingAnalysis {
  const trimmed = text.trim();
  const words = trimmed.length ? trimmed.split(/\s+/) : [];
  const wordCount = words.length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 2);
  const lower = trimmed.toLowerCase();

  const c1Features = MARKER_PHRASES.filter((m) => m.length > 3 && lower.includes(m)).slice(0, 8);

  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-zà-ÿ']/gi, ""))).size;
  const diversity = wordCount > 0 ? uniqueWords / wordCount : 0;

  const withinRange = wordCount >= task.minWords && wordCount <= task.maxWords;
  const rangeDelta = wordCount < task.minWords ? task.minWords - wordCount : wordCount > task.maxWords ? wordCount - task.maxWords : 0;

  const avgSentenceLen = sentences.length ? wordCount / sentences.length : 0;
  const seed = seededFraction(trimmed.slice(0, 60) + wordCount);

  const structure = clampScore(
    (withinRange ? 78 : 60 - Math.min(20, rangeDelta)) + (sentences.length >= 4 ? 8 : 0) + seed * 8,
  );
  const vocabulary = clampScore(55 + diversity * 45 + c1Features.length * 3 + seed * 6);
  const naturalness = clampScore(
    58 + c1Features.length * 4 + (avgSentenceLen > 8 && avgSentenceLen < 24 ? 10 : 0) + seed * 8,
  );
  const grammar = clampScore(68 + diversity * 15 + (wordCount > 20 ? 8 : -10) + seed * 10);

  const suggestions: string[] = [];
  if (!withinRange) {
    suggestions.push(
      wordCount < task.minWords
        ? `Try to reach at least ${task.minWords} words — you're ${task.minWords - wordCount} short.`
        : `Aim to trim this down closer to ${task.maxWords} words — being concise is a C1 skill too.`,
    );
  }
  if (c1Features.length < 2) {
    suggestions.push("Try weaving in a connector like 'that said' or 'arguably' to raise the register.");
  }
  if (avgSentenceLen > 0 && avgSentenceLen < 8) {
    suggestions.push("Your sentences are quite short — try combining a couple with a connector for better flow.");
  }
  if (diversity < 0.55 && wordCount > 30) {
    suggestions.push("A few words repeat often — swap some out using the C1/C2 Lab's nuance ladders.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Strong, well-structured writing — try pushing your vocabulary even further next time.");
  }

  return { grammar, vocabulary, structure, naturalness, wordCount, c1Features, suggestions };
}

export interface AbroadScore {
  comprehension: number;
  speed: number;
  vocabulary: number;
  naturalness: number;
  confidence: number;
}

/** Heuristic scoring for the Abroad Mode rapid-response challenge — no real
 * speech/timing sensor, just a believable estimate from what was typed and
 * how much of the time budget was used. */
export function scoreAbroadResponse(response: string, timeUsedSec: number, timeLimitSec: number, keywords: string[]): AbroadScore {
  const trimmed = response.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return { comprehension: 22, speed: 15, vocabulary: 20, naturalness: 20, confidence: 18 };
  }

  const keywordHits = keywords.filter((k) => lower.includes(k.toLowerCase())).length;
  const timeRatio = Math.min(1.2, timeUsedSec / timeLimitSec);

  const comprehension = clampScore(62 + Math.min(words.length, 10) * 2.4 + keywordHits * 4);
  const speed = clampScore(96 - timeRatio * 46);
  const vocabulary = clampScore(56 + keywordHits * 9 + Math.min(words.length, 8) * 1.5);
  const naturalness = clampScore(54 + (/'/.test(trimmed) ? 8 : 0) + Math.min(words.length, 9) * 2.2);
  const confidence = clampScore((comprehension + speed + vocabulary + naturalness) / 4 + (timeRatio < 0.7 ? 5 : 0));

  return { comprehension, speed, vocabulary, naturalness, confidence };
}

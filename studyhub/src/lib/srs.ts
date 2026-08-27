// A simplified SM-2 style spaced-repetition scheduler.
// Grade: 1 = again, 2 = difficult, 3 = good, 4 = easy.
import type { Flashcard } from "./types";

export type ReviewGrade = 1 | 2 | 3 | 4;

const MIN_EASE = 1.3;

export function scheduleReview(card: Flashcard, grade: ReviewGrade, now = new Date()) {
  let { easeFactor, intervalDays } = card;

  if (grade === 1) {
    intervalDays = 1 / 24; // ~1 hour, comes back today
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else {
    const easeDelta = { 2: -0.15, 3: 0, 4: 0.15 }[grade];
    easeFactor = Math.max(MIN_EASE, easeFactor + easeDelta);

    if (intervalDays <= 0 || intervalDays < 1 / 24) {
      intervalDays = grade === 2 ? 1 : grade === 3 ? 2 : 3;
    } else {
      const multiplier = grade === 2 ? 1.2 : grade === 3 ? easeFactor : easeFactor * 1.35;
      intervalDays = Math.max(1, Math.round(intervalDays * multiplier));
    }
  }

  const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    nextReview: nextReview.toISOString(),
    lastReviewed: now.toISOString(),
    correctCount: card.correctCount + (grade >= 3 ? 1 : 0),
    incorrectCount: card.incorrectCount + (grade <= 2 ? 1 : 0),
  };
}

export function confidence(card: Flashcard): number {
  const total = card.correctCount + card.incorrectCount;
  if (total === 0) return 0;
  const raw = card.correctCount / total;
  const easeBoost = (card.easeFactor - MIN_EASE) / (2.8 - MIN_EASE);
  return Math.round((raw * 0.7 + easeBoost * 0.3) * 100);
}

export function isDue(card: Flashcard, now = new Date()): boolean {
  return new Date(card.nextReview).getTime() <= now.getTime();
}

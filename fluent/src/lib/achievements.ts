import type { ActivityId, FluentState } from "./store";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: (s: FluentState) => boolean;
  progress: (s: FluentState) => { current: number; target: number };
}

const activityCount = (s: FluentState, ids: ActivityId[]) => ids.filter((id) => s.completedActivities.includes(id)).length;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "streak-7",
    title: "7-Day Streak",
    description: "Practise seven days in a row without breaking the chain.",
    unlocked: (s) => s.streakDays >= 7,
    progress: (s) => ({ current: Math.min(s.streakDays, 7), target: 7 }),
  },
  {
    id: "words-500",
    title: "500 Words Mastered",
    description: "Reach 500 words at the 'mastered' stage.",
    unlocked: (s) => s.totalWordsMastered >= 500,
    progress: (s) => ({ current: Math.min(s.totalWordsMastered, 500), target: 500 }),
  },
  {
    id: "words-1000",
    title: "1,000 Words Mastered",
    description: "Reach 1,000 words at the 'mastered' stage.",
    unlocked: (s) => s.totalWordsMastered >= 1000,
    progress: (s) => ({ current: Math.min(s.totalWordsMastered, 1000), target: 1000 }),
  },
  {
    id: "c1-threshold",
    title: "C1 Threshold",
    description: "Reach 100% progress toward C1.",
    unlocked: (s) => s.c1Progress >= 100,
    progress: (s) => ({ current: Math.min(s.c1Progress, 100), target: 100 }),
  },
  {
    id: "first-debate",
    title: "First Debate Won",
    description: "Complete your first debate argument.",
    unlocked: (s) => s.completedActivities.includes("debate"),
    progress: (s) => ({ current: s.completedActivities.includes("debate") ? 1 : 0, target: 1 }),
  },
  {
    id: "first-speaking",
    title: "Found Your Voice",
    description: "Complete your first speaking exercise.",
    unlocked: (s) => s.completedActivities.includes("speaking"),
    progress: (s) => ({ current: s.completedActivities.includes("speaking") ? 1 : 0, target: 1 }),
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Try at least 8 different practice modes.",
    unlocked: (s) => s.completedActivities.length >= 8,
    progress: (s) => ({ current: Math.min(s.completedActivities.length, 8), target: 8 }),
  },
  {
    id: "abroad-ready",
    title: "Abroad-Ready",
    description: "Complete the Abroad Mode rapid-response challenge.",
    unlocked: (s) => s.completedActivities.includes("abroad"),
    progress: (s) => ({ current: s.completedActivities.includes("abroad") ? 1 : 0, target: 1 }),
  },
  {
    id: "well-rounded",
    title: "Well-Rounded",
    description: "Complete vocabulary, grammar, listening, speaking and writing at least once each.",
    unlocked: (s) => activityCount(s, ["vocabulary", "grammar", "listening", "speaking", "writing"]) >= 5,
    progress: (s) => ({ current: activityCount(s, ["vocabulary", "grammar", "listening", "speaking", "writing"]), target: 5 }),
  },
  {
    id: "hours-50",
    title: "50 Hours In",
    description: "Accumulate 50 hours of total study time.",
    unlocked: (s) => s.totalMinutes >= 3000,
    progress: (s) => ({ current: Math.min(s.totalMinutes, 3000), target: 3000 }),
  },
];

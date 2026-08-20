import { BookOpen, Headphones, Mic, SpellCheck, PenLine, Sparkles, type LucideIcon } from "lucide-react";

export interface SessionStep {
  id: "vocabulary" | "listening" | "speaking" | "grammar" | "writing" | "native";
  order: number;
  title: string;
  minutes: number;
  description: string;
  icon: LucideIcon;
}

export const DAILY_PATH: SessionStep[] = [
  { id: "vocabulary", order: 1, title: "Vocabulary", minutes: 8, description: "Active recall with words in context.", icon: BookOpen },
  { id: "listening", order: 2, title: "Listening", minutes: 10, description: "Comprehension with real accents.", icon: Headphones },
  { id: "speaking", order: 3, title: "Speaking", minutes: 10, description: "Respond out loud, get instant feedback.", icon: Mic },
  { id: "grammar", order: 4, title: "Grammar", minutes: 7, description: "Fix the sentence, not fill the gap.", icon: SpellCheck },
  { id: "writing", order: 5, title: "Writing", minutes: 10, description: "A short, focused writing task.", icon: PenLine },
  { id: "native", order: 6, title: "Native English", minutes: 5, description: "Upgrade a basic sentence to sound native.", icon: Sparkles },
];

export const DAILY_TOTAL_MINUTES = DAILY_PATH.reduce((sum, s) => sum + s.minutes, 0);

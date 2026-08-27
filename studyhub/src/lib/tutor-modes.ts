import { BookOpenCheck, Dumbbell, GraduationCap, MessageCircleQuestion, Sparkles, Wand2, type LucideIcon } from "lucide-react";
import type { TutorMode } from "@/lib/types";

export const TUTOR_MODES: { value: TutorMode; label: string; description: string; icon: LucideIcon }[] = [
  { value: "explain", label: "Explain", description: "Clear, structured explanations", icon: Sparkles },
  { value: "socratic", label: "Socratic", description: "Guides you with questions", icon: MessageCircleQuestion },
  { value: "exam", label: "Exam", description: "Acts like an examiner", icon: GraduationCap },
  { value: "simplify", label: "Simplify", description: "Plain language, no jargon", icon: Wand2 },
  { value: "practice", label: "Practice", description: "Generates exercises", icon: Dumbbell },
  { value: "review", label: "Review", description: "Finds your knowledge gaps", icon: BookOpenCheck },
];

export function suggestedQuestions(mode: TutorMode, subjectName?: string): string[] {
  const subj = subjectName ?? "this subject";
  const byMode: Record<TutorMode, string[]> = {
    explain: [`Explain the most important concept in ${subj} right now`, "What's a topic I keep struggling with?", "Break down a tricky formula step by step"],
    socratic: [`Quiz me with questions about ${subj}`, "Help me work through a problem without giving the answer", "Ask me to justify what I just said"],
    exam: [`Give me an exam-style question on ${subj}`, "Grade my answer to a practice question", "What would lose me marks on this topic?"],
    simplify: [`Explain ${subj} like I'm 15`, "Use a real-world analogy for this concept", "What's the one-sentence version of this idea?"],
    practice: [`Give me a practice problem for ${subj}`, "Make it harder", "Give me a problem similar to one I got wrong"],
    review: ["What don't I understand well yet?", "Test whether I actually know this topic", "Summarize my weak spots this week"],
  };
  return byMode[mode];
}

import { BookOpenCheck, Dumbbell, GraduationCap, MessageCircleQuestion, Sparkles, Wand2, type LucideIcon } from "lucide-react";
import type { TutorMode } from "@/lib/types";

export const TUTOR_MODES: { value: TutorMode; label: string; description: string; icon: LucideIcon }[] = [
  { value: "explain", label: "Erklären", description: "Klare, strukturierte Erklärungen", icon: Sparkles },
  { value: "socratic", label: "Sokratisch", description: "Führt dich mit Fragen hin", icon: MessageCircleQuestion },
  { value: "exam", label: "Prüfung", description: "Verhält sich wie ein Prüfer", icon: GraduationCap },
  { value: "simplify", label: "Vereinfachen", description: "Einfache Sprache, kein Fachjargon", icon: Wand2 },
  { value: "practice", label: "Üben", description: "Erzeugt Übungsaufgaben", icon: Dumbbell },
  { value: "review", label: "Wiederholen", description: "Findet deine Wissenslücken", icon: BookOpenCheck },
];

export function suggestedQuestions(mode: TutorMode, subjectName?: string): string[] {
  const subj = subjectName ?? "diesem Fach";
  const byMode: Record<TutorMode, string[]> = {
    explain: [`Erklär mir das wichtigste Konzept in ${subj}`, "Womit tue ich mir immer wieder schwer?", "Zerleg eine schwierige Formel Schritt für Schritt"],
    socratic: [`Frag mich zu ${subj} ab`, "Hilf mir durch eine Aufgabe, ohne die Lösung zu verraten", "Lass mich begründen, was ich gerade gesagt habe"],
    exam: [`Gib mir eine Prüfungsfrage zu ${subj}`, "Bewerte meine Antwort auf eine Übungsfrage", "Wo würde ich bei diesem Thema Punkte verlieren?"],
    simplify: [`Erklär mir ${subj}, als wäre ich 15`, "Nimm einen Vergleich aus dem Alltag für dieses Konzept", "Was ist die Ein-Satz-Version davon?"],
    practice: [`Gib mir eine Übungsaufgabe zu ${subj}`, "Mach es schwerer", "Gib mir eine Aufgabe wie die, die ich falsch hatte"],
    review: ["Was verstehe ich noch nicht richtig?", "Prüf, ob ich dieses Thema wirklich kann", "Fass meine Schwachstellen dieser Woche zusammen"],
  };
  return byMode[mode];
}

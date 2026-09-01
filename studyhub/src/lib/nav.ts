import {
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutGrid,
  Layers,
  Layers3,
  ListChecks,
  NotebookPen,
  Settings,
  Sparkles,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutGrid },
  { href: "/subjects", label: "Fächer", icon: Layers },
  { href: "/documents", label: "Dokumente", icon: FileText },
  { href: "/notes", label: "Notizen", icon: NotebookPen },
  { href: "/flashcards", label: "Karteikarten", icon: Layers3 },
  { href: "/quizzes", label: "Quiz", icon: ListChecks },
  { href: "/exams", label: "Prüfungen", icon: GraduationCap },
  { href: "/tasks", label: "Aufgaben", icon: CheckSquare },
  { href: "/focus", label: "Fokus", icon: Timer },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/progress", label: "Fortschritt", icon: TrendingUp },
  { href: "/ai-tutor", label: "KI-Tutor", icon: Sparkles },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

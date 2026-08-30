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
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/subjects", label: "Subjects", icon: Layers },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/flashcards", label: "Flashcards", icon: Layers3 },
  { href: "/quizzes", label: "Quizzes", icon: ListChecks },
  { href: "/exams", label: "Exams", icon: GraduationCap },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

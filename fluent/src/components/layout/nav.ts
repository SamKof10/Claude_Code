import type { LucideIcon } from "lucide-react";
import {
  Home,
  BookOpen,
  SpellCheck,
  Headphones,
  Mic,
  PenLine,
  Brain,
  Languages,
  Sparkles,
  FlaskConical,
  MessagesSquare,
  Globe2,
  PlaneTakeoff,
  Bot,
  BarChart3,
  Target,
  Trophy,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ href: "/", label: "Home", icon: Home }] },
  {
    label: "Learn",
    items: [
      { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
      { href: "/grammar", label: "Grammar", icon: SpellCheck },
      { href: "/listening", label: "Listening", icon: Headphones },
      { href: "/speaking", label: "Speaking", icon: Mic },
      { href: "/writing", label: "Writing", icon: PenLine },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/think", label: "Think in English", icon: Brain },
      { href: "/translate", label: "Translation", icon: Languages },
      { href: "/natural", label: "Sound More Native", icon: Sparkles },
      { href: "/c1c2", label: "C1/C2 Lab", icon: FlaskConical },
      { href: "/debate", label: "Debate", icon: MessagesSquare },
      { href: "/real-life", label: "Real-Life Sim", icon: Globe2 },
      { href: "/abroad", label: "Abroad Mode", icon: PlaneTakeoff },
      { href: "/tutor", label: "AI Tutor", icon: Bot },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/progress", label: "Statistics", icon: BarChart3 },
      { href: "/progress/weak-areas", label: "Weak Areas", icon: Target },
      { href: "/progress/achievements", label: "Achievements", icon: Trophy },
    ],
  },
  { label: null, items: [{ href: "/settings", label: "Settings", icon: Settings }] },
];

export const FOCUS_MODE_PREFIXES = ["/session"];

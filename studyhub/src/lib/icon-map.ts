import {
  Atom,
  BookOpen,
  Calculator,
  Dumbbell,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Music,
  Palette,
  Sigma,
  type LucideIcon,
} from "lucide-react";

export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Sigma,
  Atom,
  Landmark,
  Globe2,
  Palette,
  Music,
  Dumbbell,
  Calculator,
  FlaskConical,
  Languages,
};

export const SUBJECT_ICON_NAMES = Object.keys(SUBJECT_ICONS);

export function getSubjectIcon(name: string): LucideIcon {
  return SUBJECT_ICONS[name] ?? BookOpen;
}

export function subjectColorVar(color: string): string {
  return `var(--color-${color})`;
}

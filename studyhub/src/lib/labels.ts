import type { Difficulty, KnowledgeLevel, TaskPriority, TaskStatus } from "@/lib/types";

/**
 * German display labels for the enums we persist.
 *
 * The stored values stay English — they are keys, not copy, and translating
 * them would break every account whose data was written before. Several badges
 * used to render the raw value (with `capitalize` to dress it up), which put
 * "Medium" and "Intermediate" in a German interface. Rendering goes through
 * these maps so a label can never drift from the value it describes.
 */
export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Offen",
  "in-progress": "In Arbeit",
  done: "Erledigt",
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Leicht",
  medium: "Mittel",
  hard: "Schwer",
};

export const KNOWLEDGE_LEVEL_LABEL: Record<KnowledgeLevel, string> = {
  beginner: "Anfang",
  intermediate: "Mittel",
  advanced: "Fortgeschritten",
};

/** The one-line hint shown beside the level when picking it. */
export const KNOWLEDGE_LEVEL_HINT: Record<KnowledgeLevel, string> = {
  beginner: "bei null anfangen",
  intermediate: "Grundlagen sitzen",
  advanced: "nur noch feilen",
};

import type { DayType, Phase } from "./plan";

export type WorkoutSession = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dayType: DayType;
  weekNumber: number;
  phase: Phase;
};

export type SetLog = {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  notes: string | null;
  isDropSet: boolean;
};

export type User = {
  id: string;
  email: string;
  /** Start des Mesozyklus — daraus ergibt sich die aktuelle Woche. */
  startDate: string; // YYYY-MM-DD
};

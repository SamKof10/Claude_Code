import { PROGRAM_WEEKS, type Phase } from "./plan";

export type PhaseSpec = {
  phase: Phase;
  label: string;
  /** Sätze pro Übung in dieser Phase. */
  sets: number;
  repMin: number;
  repMax: number;
  intensityNote: string;
};

const SPECS: Record<Phase, Omit<PhaseSpec, "phase">> = {
  adaptation: { label: "Anpassung", sets: 3, repMin: 10, repMax: 12, intensityNote: "Technik und Grundlast — sauber ausführen, nicht maximal belasten." },
  build: { label: "Aufbau", sets: 4, repMin: 8, repMax: 12, intensityNote: "Hauptreiz. Progressive Overload: obere Wdh-Grenze in allen Sätzen → Gewicht rauf." },
  deload: { label: "Deload", sets: 3, repMin: 12, repMax: 15, intensityNote: "30 % weniger Gewicht. Erholung, kein Reiz — das gehört zum Plan." },
  intensify: { label: "Intensivierung", sets: 4, repMin: 6, repMax: 10, intensityNote: "Maximaler Overload bei niedrigeren Wiederholungen." },
};

export function phaseForWeek(week: number): Phase {
  if (week <= 2) return "adaptation";
  if (week <= 5) return "build";
  if (week === 6) return "deload";
  return "intensify";
}

export function phaseSpec(week: number): PhaseSpec {
  const phase = phaseForWeek(week);
  return { phase, ...SPECS[phase] };
}

export function phaseLabel(phase: Phase): string {
  return SPECS[phase].label;
}

/** Woche 1..8 aus dem Startdatum. Nach Woche 8 bleibt der Zyklus auf 8 stehen. */
export function weekFromStart(startDate: string, today = new Date()): number {
  const start = new Date(startDate + "T00:00:00");
  const days = Math.floor((startOfDay(today).getTime() - start.getTime()) / 86_400_000);
  const week = Math.floor(days / 7) + 1;
  return Math.min(Math.max(week, 1), PROGRAM_WEEKS);
}

/** True, sobald der 8-Wochen-Zyklus rechnerisch vorbei ist. */
export function cycleComplete(startDate: string, today = new Date()): boolean {
  const start = new Date(startDate + "T00:00:00");
  const days = Math.floor((startOfDay(today).getTime() - start.getTime()) / 86_400_000);
  return days >= PROGRAM_WEEKS * 7;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const ALL_WEEKS = Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1);

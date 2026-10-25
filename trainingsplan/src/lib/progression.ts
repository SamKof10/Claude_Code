import { DUMBBELL_MAX_KG, WEIGHT_STEP, exercisesForDay, type DayType, type Exercise } from "./plan";
import { phaseSpec } from "./phase";
import type { SetLog, WorkoutSession } from "./types";

export type HistoryEntry = { session: WorkoutSession; sets: SetLog[] };

export type Suggestion = {
  weightKg: number;
  /** Ziel-Wdh für die erste Eingabe (untere Grenze der Phase). */
  targetReps: number;
  /** Differenz zum letzten Arbeitsgewicht. */
  deltaKg: number;
  reason: string;
  /** Kurzhantel-Maximum erreicht — Gewicht geht nicht weiter hoch. */
  atDumbbellMax: boolean;
  isFirstTime: boolean;
};

/** Rundet auf die kleinste Gewichtsstufe der Ausrüstung. */
export function roundToStep(value: number, step: number): number {
  if (step <= 0) return 0;
  return Math.round(Math.round(value / step) * step * 10) / 10;
}

/**
 * Das Gewicht, mit dem in einer Session tatsächlich gearbeitet wurde:
 * das häufigste Gewicht der Arbeitssätze, bei Gleichstand das höhere.
 * Dropsätze zählen nicht — sie sind ein Zusatzsatz, kein Arbeitssatz.
 */
export function workingWeight(sets: SetLog[]): number | null {
  const working = sets.filter((s) => !s.isDropSet);
  if (working.length === 0) return null;
  const counts = new Map<number, number>();
  for (const s of working) counts.set(s.weightKg, (counts.get(s.weightKg) ?? 0) + 1);
  let best = working[0].weightKg;
  let bestCount = 0;
  for (const [weight, count] of counts) {
    if (count > bestCount || (count === bestCount && weight > best)) {
      best = weight;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Progressionsregel aus der Spec: Wenn in ALLEN Arbeitssätzen die obere
 * Wdh-Grenze erreicht wurde, geht das Gewicht eine Stufe hoch. Sonst bleibt es.
 * Deload-Sessions sind keine Referenz — sie laufen bewusst mit weniger Gewicht.
 */
export function suggestNext(exercise: Exercise, week: number, history: HistoryEntry[]): Suggestion {
  const spec = phaseSpec(week);
  const step = WEIGHT_STEP[exercise.equipment];
  const sorted = [...history].sort((a, b) => b.session.date.localeCompare(a.session.date));

  if (exercise.equipment === "bodyweight") {
    const last = sorted.find((h) => h.sets.filter((s) => !s.isDropSet).length > 0);
    if (!last) {
      return { weightKg: 0, targetReps: spec.repMin, deltaKg: 0, atDumbbellMax: false, isFirstTime: true,
        reason: `Erste Session — starte bei ${spec.repMin} und arbeite dich auf ${spec.repMax} hoch.` };
    }
    const lastSpec = phaseSpec(last.session.weekNumber);
    const working = last.sets.filter((s) => !s.isDropSet);
    const allTop = working.every((s) => s.reps >= lastSpec.repMax);
    const bestReps = Math.max(...working.map((s) => s.reps));
    return {
      weightKg: 0,
      targetReps: allTop ? Math.max(bestReps + 1, spec.repMin) : Math.max(bestReps, spec.repMin),
      deltaKg: 0,
      atDumbbellMax: false,
      isFirstTime: false,
      reason: allTop
        ? `Letztes Mal alle Sätze bei ${lastSpec.repMax} — eine Wiederholung drauflegen.`
        : `Ohne Zusatzgewicht läuft die Progression über Wiederholungen. Ziel: ${spec.repMax}.`,
    };
  }

  // Deload-Sessions taugen nicht als Referenz für das Arbeitsgewicht.
  const reference = sorted.find((h) => h.session.phase !== "deload" && workingWeight(h.sets) !== null);

  if (!reference) {
    return {
      weightKg: exercise.startWeightKg,
      targetReps: spec.repMin,
      deltaKg: 0,
      atDumbbellMax: false,
      isFirstTime: true,
      reason: "Erste Session — Startwert. Trag ein, was du tatsächlich schaffst; ab der nächsten Session rechnet die App damit weiter.",
    };
  }

  const lastWeight = workingWeight(reference.sets)!;
  const lastSpec = phaseSpec(reference.session.weekNumber);
  const workingSets = reference.sets.filter((s) => !s.isDropSet);

  if (spec.phase === "deload") {
    const weight = roundToStep(lastWeight * 0.7, step);
    return {
      weightKg: weight,
      targetReps: spec.repMin,
      deltaKg: Math.round((weight - lastWeight) * 10) / 10,
      atDumbbellMax: false,
      isFirstTime: false,
      reason: `Deload: 30 % unter deinen ${lastWeight} kg aus Woche ${reference.session.weekNumber}. ${spec.repMin}–${spec.repMax} Wdh, locker durchziehen.`,
    };
  }

  const allHitTop = workingSets.length > 0 && workingSets.every((s) => s.reps >= lastSpec.repMax);
  let weight = lastWeight;
  const reasons: string[] = [];

  if (allHitTop) {
    weight += step;
    reasons.push(`Alle ${workingSets.length} Sätze bei ${lastSpec.repMax} Wdh — eine Stufe rauf.`);
  } else {
    const worst = Math.min(...workingSets.map((s) => s.reps));
    reasons.push(`Letzte Session: ${worst}–${Math.max(...workingSets.map((s) => s.reps))} Wdh. Gewicht halten, bis alle Sätze ${lastSpec.repMax} erreichen.`);
  }

  // Beim Wechsel in die Intensivierung sinkt der Wdh-Bereich — dafür darf das Gewicht rauf.
  if (spec.phase === "intensify" && lastSpec.phase !== "intensify") {
    weight += step;
    reasons.push(`Neue Phase mit ${spec.repMin}–${spec.repMax} Wdh statt ${lastSpec.repMin}–${lastSpec.repMax} — eine Stufe extra.`);
  }

  weight = roundToStep(weight, step);
  let atDumbbellMax = false;
  if (exercise.equipment === "dumbbell" && weight > DUMBBELL_MAX_KG) {
    weight = DUMBBELL_MAX_KG;
    atDumbbellMax = true;
    reasons.push(`Dein Rack endet bei ${DUMBBELL_MAX_KG} kg. Geh stattdessen auf 20–25 Wdh oder verlangsame das Tempo (3 s runter).`);
  } else if (exercise.equipment === "dumbbell" && weight === DUMBBELL_MAX_KG && allHitTop) {
    atDumbbellMax = true;
    reasons.push(`${DUMBBELL_MAX_KG} kg ist dein Rack-Maximum — ab hier über Wiederholungen und Tempo steigern.`);
  }

  return {
    weightKg: weight,
    targetReps: spec.repMin,
    deltaKg: Math.round((weight - lastWeight) * 10) / 10,
    atDumbbellMax,
    isFirstTime: false,
    reason: reasons.join(" "),
  };
}

/**
 * Dropsatz-Regel: ab Woche 3, ein Dropsatz am Ende der letzten Isolationsübung
 * der Session. Nicht bei Compound-Übungen, nicht im Deload, nicht ohne Gewicht.
 */
export function dropSetExerciseId(dayType: DayType, week: number): string | null {
  if (week < 3) return null;
  if (phaseSpec(week).phase === "deload") return null;
  const list = exercisesForDay(dayType);
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].isolation && list[i].equipment !== "bodyweight") return list[i].id;
  }
  return null;
}

/** Dropsatz: 25 % runter, direkt weiter bis zum Muskelversagen. */
export function dropSetWeight(exercise: Exercise, workingWeightKg: number): number {
  return roundToStep(workingWeightKg * 0.75, WEIGHT_STEP[exercise.equipment]);
}

/** Gesamtvolumen (Gewicht × Wdh) — Dropsätze zählen mit. */
export function volume(sets: SetLog[]): number {
  return sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

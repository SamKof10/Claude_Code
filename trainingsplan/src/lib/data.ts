import "server-only";
import { store } from "./db";
import { currentUser } from "./auth";
import { phaseSpec, weekFromStart, cycleComplete, type PhaseSpec } from "./phase";
import { DAY_TYPES, exercisesForDay, type DayType } from "./plan";
import { dropSetExerciseId, suggestNext, volume, workingWeight, type HistoryEntry, type Suggestion } from "./progression";
import type { SetLog, User, WorkoutSession } from "./types";

/**
 * Die Zeitzone, in der "heute" gilt. Der Server läuft in UTC; ohne feste Zone
 * würde der Trainingstag zwischen 00:00 und 02:00 auf den Vortag zeigen.
 */
const TZ = process.env.APP_TIMEZONE || "Europe/Vienna";

export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** 0 = Sonntag … 6 = Samstag, in der App-Zeitzone. */
export function weekdayIndex(dateISO = todayISO()): number {
  return new Date(dateISO + "T12:00:00Z").getUTCDay();
}

/** Der geplante Split-Tag für ein Datum — am Wochenende null. */
export function dayTypeForDate(dateISO = todayISO()): DayType | null {
  const weekday = weekdayIndex(dateISO);
  if (weekday < 1 || weekday > 5) return null;
  return DAY_TYPES[weekday - 1].id;
}

export type AppContext = {
  user: User;
  week: number;
  spec: PhaseSpec;
  today: string;
  plannedDayType: DayType | null;
  sessions: WorkoutSession[];
  sets: SetLog[];
  cycleDone: boolean;
};

export async function loadContext(): Promise<AppContext | null> {
  const user = await currentUser();
  if (!user) return null;
  const { sessions, sets } = await store.loadUserData(user.id);
  const today = todayISO();
  const week = weekFromStart(user.startDate);
  return {
    user,
    week,
    spec: phaseSpec(week),
    today,
    plannedDayType: dayTypeForDate(today),
    sessions,
    sets,
    cycleDone: cycleComplete(user.startDate),
  };
}

export function setsBySession(ctx: AppContext, sessionId: string): SetLog[] {
  return ctx.sets.filter((s) => s.sessionId === sessionId);
}

/** Alle bisherigen Sessions einer Übung, mit ihren Sätzen — Basis der Progression. */
export function historyFor(ctx: AppContext, exerciseId: string, excludeSessionId?: string): HistoryEntry[] {
  return ctx.sessions
    .filter((session) => session.id !== excludeSessionId)
    .map((session) => ({ session, sets: ctx.sets.filter((s) => s.sessionId === session.id && s.exerciseId === exerciseId) }))
    .filter((entry) => entry.sets.length > 0);
}

export type ExerciseState = {
  exerciseId: string;
  loggedSets: SetLog[];
  suggestion: Suggestion;
  isDropSetTarget: boolean;
  done: boolean;
};

/** Zustand aller Übungen eines Trainingstags: was ist geloggt, was schlägt die App vor. */
export function dayState(ctx: AppContext, dayType: DayType, date: string): {
  session: WorkoutSession | null;
  exercises: ExerciseState[];
  doneCount: number;
  totalVolume: number;
} {
  const session = ctx.sessions.find((s) => s.date === date && s.dayType === dayType) ?? null;
  const sessionSets = session ? setsBySession(ctx, session.id) : [];
  const dropTarget = dropSetExerciseId(dayType, ctx.week);
  const targetSets = ctx.spec.sets;

  const exercises = exercisesForDay(dayType).map((exercise) => {
    const loggedSets = sessionSets.filter((s) => s.exerciseId === exercise.id).sort((a, b) => a.setNumber - b.setNumber);
    const working = loggedSets.filter((s) => !s.isDropSet);
    return {
      exerciseId: exercise.id,
      loggedSets,
      suggestion: suggestNext(exercise, ctx.week, historyFor(ctx, exercise.id, session?.id)),
      isDropSetTarget: dropTarget === exercise.id,
      done: working.length >= targetSets,
    };
  });

  return {
    session,
    exercises,
    doneCount: exercises.filter((e) => e.done).length,
    totalVolume: volume(sessionSets),
  };
}

/** Verlauf einer Übung über den Mesozyklus — für das Diagramm. */
export function exerciseTrend(ctx: AppContext, exerciseId: string): { week: number; date: string; weightKg: number; volume: number; phase: string; topReps: number }[] {
  return ctx.sessions
    .map((session) => {
      const sets = ctx.sets.filter((s) => s.sessionId === session.id && s.exerciseId === exerciseId);
      const w = workingWeight(sets);
      if (w === null) return null;
      return {
        week: session.weekNumber,
        date: session.date,
        weightKg: w,
        volume: volume(sets),
        phase: session.phase,
        topReps: Math.max(...sets.filter((s) => !s.isDropSet).map((s) => s.reps)),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Absolviert vs. geplant für eine Kalenderwoche des Zyklus. */
export function weekOverview(ctx: AppContext, week: number) {
  const start = new Date(ctx.user.startDate + "T12:00:00Z");
  start.setUTCDate(start.getUTCDate() + (week - 1) * 7);
  // Auf den Montag dieser Zyklus-Woche ausrichten
  const offsetToMonday = (start.getUTCDay() + 6) % 7;
  const monday = new Date(start);
  monday.setUTCDate(monday.getUTCDate() - offsetToMonday);

  const days = DAY_TYPES.map((meta, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    const session = ctx.sessions.find((s) => s.date === date && s.dayType === meta.id) ?? null;
    const sets = session ? setsBySession(ctx, session.id) : [];
    const targetSets = phaseSpec(week).sets;
    const doneExercises = exercisesForDay(meta.id).filter(
      (ex) => sets.filter((s) => s.exerciseId === ex.id && !s.isDropSet).length >= targetSets,
    ).length;
    return {
      meta,
      date,
      session,
      volume: volume(sets),
      doneExercises,
      plannedExercises: exercisesForDay(meta.id).length,
      complete: doneExercises >= exercisesForDay(meta.id).length,
      started: sets.length > 0,
      isToday: date === ctx.today,
    };
  });

  return {
    week,
    spec: phaseSpec(week),
    days,
    completedDays: days.filter((d) => d.complete).length,
    totalVolume: days.reduce((sum, d) => sum + d.volume, 0),
  };
}

export function formatKg(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

export function formatVolume(value: number): string {
  return Math.round(value).toLocaleString("de-DE");
}

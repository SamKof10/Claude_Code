// Der Trainingsplan aus der Spec. Der Plan selbst ist fix — er liegt im Code,
// nicht in der Datenbank. Nur was der Nutzer tatsächlich tut, wird gespeichert.

export type DayType = "push_a" | "pull_a" | "push_b" | "pull_b" | "arms";
export type Equipment = "cable_station" | "dumbbell" | "bodyweight";
export type Phase = "adaptation" | "build" | "deload" | "intensify";

export type Exercise = {
  id: string;
  name: string;
  dayType: DayType;
  equipment: Equipment;
  targetMuscle: string;
  /** Isolationsübung? Nur diese kommen für Dropsätze in Frage. */
  isolation: boolean;
  /** Erster Vorschlag, solange keine Historie existiert. */
  startWeightKg: number;
  /** Wdh oder Sekunden (Plank). */
  unit?: "reps" | "seconds";
  /** Übungen mit derselben Superset-Marke werden ohne Pause abwechselnd ausgeführt. */
  superset?: string;
  note?: string;
};

export const DAY_TYPES: { id: DayType; day: number; label: string; focus: string; weekday: string }[] = [
  { id: "push_a", day: 1, label: "Push A", focus: "Brust / Schulter", weekday: "Montag" },
  { id: "pull_a", day: 2, label: "Pull A", focus: "Rücken breit", weekday: "Dienstag" },
  { id: "push_b", day: 3, label: "Push B", focus: "Trizeps-Fokus", weekday: "Mittwoch" },
  { id: "pull_b", day: 4, label: "Pull B", focus: "Rücken dick / Bizeps", weekday: "Donnerstag" },
  { id: "arms", day: 5, label: "Arme & Core", focus: "Schulter / Arme / Rumpf", weekday: "Freitag" },
];

export const EXERCISES: Exercise[] = [
  // Tag 1 — Push A
  { id: "brustpresse", name: "Brustpresse", dayType: "push_a", equipment: "cable_station", targetMuscle: "Brust", isolation: false, startWeightKg: 25 },
  { id: "kabel-fliegende", name: "Kabel-Fliegende", dayType: "push_a", equipment: "cable_station", targetMuscle: "Brust", isolation: true, startWeightKg: 10 },
  { id: "butterfly", name: "Butterfly", dayType: "push_a", equipment: "cable_station", targetMuscle: "Brust innen", isolation: true, startWeightKg: 15 },
  { id: "db-schulterdruecken", name: "DB Schulterdrücken", dayType: "push_a", equipment: "dumbbell", targetMuscle: "Schulter vorne", isolation: false, startWeightKg: 7 },
  { id: "seitheben-a", name: "Seitheben DB", dayType: "push_a", equipment: "dumbbell", targetMuscle: "Schulter seitlich", isolation: true, startWeightKg: 4 },

  // Tag 2 — Pull A
  { id: "latzug-weit", name: "Latzug weit", dayType: "pull_a", equipment: "cable_station", targetMuscle: "Latissimus", isolation: false, startWeightKg: 30 },
  { id: "kabelrudern-sitzend", name: "Kabelrudern sitzend", dayType: "pull_a", equipment: "cable_station", targetMuscle: "Rücken mitte", isolation: false, startWeightKg: 30 },
  { id: "db-rudern-einarmig", name: "DB einarmig Rudern", dayType: "pull_a", equipment: "dumbbell", targetMuscle: "Latissimus", isolation: false, startWeightKg: 10, note: "Pro Seite" },

  // Tag 3 — Push B
  { id: "brustpresse-winkel", name: "Brustpresse (anderer Winkel)", dayType: "push_b", equipment: "cable_station", targetMuscle: "Brust oben", isolation: false, startWeightKg: 22.5 },
  { id: "kabel-dips", name: "Kabel-Dips", dayType: "push_b", equipment: "cable_station", targetMuscle: "Trizeps", isolation: false, startWeightKg: 20 },
  { id: "trizeps-pushdown", name: "Trizeps-Pushdown", dayType: "push_b", equipment: "cable_station", targetMuscle: "Trizeps", isolation: true, startWeightKg: 15 },
  { id: "trizeps-ueberkopf", name: "Überkopf-Trizeps DB", dayType: "push_b", equipment: "dumbbell", targetMuscle: "Trizeps langer Kopf", isolation: true, startWeightKg: 7 },

  // Tag 4 — Pull B
  { id: "latzug-eng", name: "Latzug eng", dayType: "pull_b", equipment: "cable_station", targetMuscle: "Latissimus / Bizeps", isolation: false, startWeightKg: 27.5 },
  { id: "kabelrudern", name: "Kabelrudern", dayType: "pull_b", equipment: "cable_station", targetMuscle: "Rücken dick", isolation: false, startWeightKg: 30 },
  { id: "bizeps-curls-kabel", name: "Bizeps-Curls Kabel", dayType: "pull_b", equipment: "cable_station", targetMuscle: "Bizeps", isolation: true, startWeightKg: 15 },
  { id: "hammer-curls", name: "Hammer-Curls DB", dayType: "pull_b", equipment: "dumbbell", targetMuscle: "Bizeps / Brachialis", isolation: true, startWeightKg: 7 },

  // Tag 5 — Arme & Core
  { id: "seitheben-b", name: "Seitheben DB", dayType: "arms", equipment: "dumbbell", targetMuscle: "Schulter seitlich", isolation: true, startWeightKg: 4 },
  { id: "frontheben", name: "Frontheben DB", dayType: "arms", equipment: "dumbbell", targetMuscle: "Schulter vorne", isolation: true, startWeightKg: 5 },
  { id: "curl-superset", name: "Bizeps-Curl", dayType: "arms", equipment: "cable_station", targetMuscle: "Bizeps", isolation: true, startWeightKg: 15, superset: "Superset" },
  { id: "pushdown-superset", name: "Trizeps-Pushdown", dayType: "arms", equipment: "cable_station", targetMuscle: "Trizeps", isolation: true, startWeightKg: 15, superset: "Superset" },
  { id: "plank-ball", name: "Plank am Ball", dayType: "arms", equipment: "bodyweight", targetMuscle: "Rumpf", isolation: true, startWeightKg: 0, unit: "seconds", note: "Unterarme auf dem Gymnastikball" },
  { id: "crunches-ball", name: "Crunches am Ball", dayType: "arms", equipment: "bodyweight", targetMuscle: "Bauch", isolation: true, startWeightKg: 0 },
];

/** Kleinste sinnvolle Gewichtsstufe je Ausrüstung. */
export const WEIGHT_STEP: Record<Equipment, number> = {
  cable_station: 2.5,
  dumbbell: 0.5,
  bodyweight: 0,
};

/** Kurzhantel-Rack geht nur bis 10 kg — darüber muss über Wdh und Tempo gesteuert werden. */
export const DUMBBELL_MAX_KG = 10;

export const PROGRAM_WEEKS = 8;

export function exercisesForDay(dayType: DayType): Exercise[] {
  return EXERCISES.filter((e) => e.dayType === dayType);
}

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function dayMeta(dayType: DayType) {
  return DAY_TYPES.find((d) => d.id === dayType)!;
}

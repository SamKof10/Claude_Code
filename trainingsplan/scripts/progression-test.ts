import { suggestNext, dropSetExerciseId, workingWeight, dropSetWeight } from "../src/lib/progression";
import { phaseForWeek, phaseSpec, weekFromStart } from "../src/lib/phase";
import { exerciseById, exercisesForDay, DAY_TYPES } from "../src/lib/plan";
import type { SetLog, WorkoutSession } from "../src/lib/types";

let pass = 0, fail = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}\n       erwartet ${e}, bekommen ${a}`); }
}

function session(week: number, date: string): WorkoutSession {
  return { id: `s${week}`, userId: "u", date, dayType: "push_b", weekNumber: week, phase: phaseForWeek(week) };
}
function sets(sessionId: string, exerciseId: string, weight: number, reps: number[], drop?: { weight: number; reps: number }): SetLog[] {
  const list: SetLog[] = reps.map((r, i) => ({
    id: `${sessionId}-${i}`, sessionId, exerciseId, setNumber: i + 1, reps: r, weightKg: weight, rpe: null, notes: null, isDropSet: false,
  }));
  if (drop) list.push({ id: `${sessionId}-d`, sessionId, exerciseId, setNumber: reps.length + 1, reps: drop.reps, weightKg: drop.weight, rpe: null, notes: null, isDropSet: true });
  return list;
}

console.log("\nPhasen aus der Spec");
check("W1 Anpassung", phaseSpec(1).phase, "adaptation");
check("W2 3 Sätze 10-12", [phaseSpec(2).sets, phaseSpec(2).repMin, phaseSpec(2).repMax], [3, 10, 12]);
check("W3 Aufbau 4 Sätze 8-12", [phaseSpec(3).phase, phaseSpec(3).sets, phaseSpec(3).repMin, phaseSpec(3).repMax], ["build", 4, 8, 12]);
check("W5 noch Aufbau", phaseSpec(5).phase, "build");
check("W6 Deload 12-15", [phaseSpec(6).phase, phaseSpec(6).repMin, phaseSpec(6).repMax], ["deload", 12, 15]);
check("W7 Intensivierung 6-10", [phaseSpec(7).phase, phaseSpec(7).repMin, phaseSpec(7).repMax], ["intensify", 6, 10]);
check("W8 Intensivierung", phaseSpec(8).phase, "intensify");

console.log("\nWochenberechnung ab Startdatum");
check("Starttag = W1", weekFromStart("2026-01-05", new Date("2026-01-05T12:00:00Z")), 1);
check("Tag 6 = W1", weekFromStart("2026-01-05", new Date("2026-01-10T12:00:00Z")), 1);
check("Tag 7 = W2", weekFromStart("2026-01-05", new Date("2026-01-12T12:00:00Z")), 2);
check("Tag 36 = W6", weekFromStart("2026-01-05", new Date("2026-02-10T12:00:00Z")), 6);
check("nach W8 bleibt 8", weekFromStart("2026-01-05", new Date("2026-06-01T12:00:00Z")), 8);

console.log("\nProgressionsregel (Kabel, Stufe 2,5 kg)");
const kabel = exerciseById("trizeps-pushdown")!;
check("ohne Historie = Startwert", suggestNext(kabel, 1, []).weightKg, kabel.startWeightKg);
check("ohne Historie ist erste Session", suggestNext(kabel, 1, []).isFirstTime, true);

const alleOben = [{ session: session(3, "2026-01-21"), sets: sets("s3", kabel.id, 20, [12, 12, 12, 12]) }];
check("alle Sätze bei 12 → +2,5", suggestNext(kabel, 4, alleOben).weightKg, 22.5);
check("Delta wird ausgewiesen", suggestNext(kabel, 4, alleOben).deltaKg, 2.5);

const nichtAlle = [{ session: session(3, "2026-01-21"), sets: sets("s3", kabel.id, 20, [12, 12, 11, 9]) }];
check("ein Satz unter 12 → Gewicht hält", suggestNext(kabel, 4, nichtAlle).weightKg, 20);
check("Delta 0", suggestNext(kabel, 4, nichtAlle).deltaKg, 0);

console.log("\nDropsätze zählen nicht als Arbeitssatz");
const mitDrop = [{ session: session(3, "2026-01-21"), sets: sets("s3", kabel.id, 20, [12, 12, 12, 12], { weight: 15, reps: 8 }) }];
check("Arbeitsgewicht ignoriert den Dropsatz", workingWeight(mitDrop[0].sets), 20);
check("Dropsatz mit 8 Wdh blockiert die Steigerung nicht", suggestNext(kabel, 4, mitDrop).weightKg, 22.5);

console.log("\nDeload (Woche 6)");
const vorDeload = [{ session: session(5, "2026-02-04"), sets: sets("s5", kabel.id, 30, [12, 12, 12, 12]) }];
check("W6 = 70 % von 30 → 20", suggestNext(kabel, 6, vorDeload).weightKg, 20);

const nachDeload = [
  { session: session(5, "2026-02-04"), sets: sets("s5", kabel.id, 30, [12, 12, 11, 10]) },
  { session: session(6, "2026-02-11"), sets: sets("s6", kabel.id, 20, [15, 15, 15]) },
];
check("W7 nimmt W5 als Referenz, nicht den Deload", suggestNext(kabel, 7, nachDeload).weightKg, 32.5);

const nachDeloadAllTop = [
  { session: session(5, "2026-02-04"), sets: sets("s5", kabel.id, 30, [12, 12, 12, 12]) },
  { session: session(6, "2026-02-11"), sets: sets("s6", kabel.id, 20, [15, 15, 15]) },
];
check("W7 nach voller W5: +Stufe fürs Ziel, +Stufe für engeren Bereich", suggestNext(kabel, 7, nachDeloadAllTop).weightKg, 35);

console.log("\nKurzhantel-Limit 10 kg");
const db = exerciseById("hammer-curls")!;
const dbHistorie = [{ session: session(5, "2026-02-04"), sets: sets("s5", db.id, 10, [12, 12, 12, 12]) }];
const dbVorschlag = suggestNext(db, 7, dbHistorie);
check("Vorschlag wird bei 10 kg gedeckelt", dbVorschlag.weightKg, 10);
check("Limit-Hinweis wird gesetzt", dbVorschlag.atDumbbellMax, true);
check("Hinweis nennt die Alternative", /20–25 Wdh|Wiederholungen/.test(dbVorschlag.reason), true);

const dbHalb = [{ session: session(3, "2026-01-21"), sets: sets("s3", db.id, 7, [12, 12, 12, 12]) }];
check("0,5-kg-Stufe bei Kurzhanteln", suggestNext(db, 4, dbHalb).weightKg, 7.5);

console.log("\nKörpergewicht: Progression über Wiederholungen");
const plank = exerciseById("plank-ball")!;
const plankHist = [{ session: session(3, "2026-01-21"), sets: sets("s3", plank.id, 0, [12, 12, 12, 12]) }];
check("alle oben → eine Wdh mehr", suggestNext(plank, 4, plankHist).targetReps, 13);
check("kein Gewicht", suggestNext(plank, 4, plankHist).weightKg, 0);

console.log("\nDropsatz-Regel");
check("W1 kein Dropsatz", dropSetExerciseId("push_b", 1), null);
check("W2 kein Dropsatz", dropSetExerciseId("push_b", 2), null);
check("W3 letzte Isolationsübung Push B", dropSetExerciseId("push_b", 3), "trizeps-ueberkopf");
check("W6 Deload ohne Dropsatz", dropSetExerciseId("push_b", 6), null);
check("W7 wieder Dropsatz", dropSetExerciseId("push_b", 7), "trizeps-ueberkopf");
check("Pull A hat keine Isolationsübung → kein Dropsatz", dropSetExerciseId("pull_a", 4), null);
check("Push A: Seitheben", dropSetExerciseId("push_a", 4), "seitheben-a");
check("Pull B: Hammer-Curls", dropSetExerciseId("pull_b", 4), "hammer-curls");
check("Arme: Pushdown, nicht die Bodyweight-Übung", dropSetExerciseId("arms", 4), "pushdown-superset");
check("Dropsatz-Gewicht = 75 % auf Stufe gerundet", dropSetWeight(kabel, 30), 22.5);

console.log("\nPlan-Integrität");
check("5 Trainingstage", DAY_TYPES.length, 5);
for (const d of DAY_TYPES) {
  const list = exercisesForDay(d.id);
  if (list.length === 0) { fail++; console.log(`  FAIL ${d.label} hat keine Übungen`); }
}
const ids = exercisesForDay("push_a").concat(exercisesForDay("pull_a"), exercisesForDay("push_b"), exercisesForDay("pull_b"), exercisesForDay("arms")).map((e) => e.id);
check("alle Übungs-IDs eindeutig", new Set(ids).size, ids.length);

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen\n`);
process.exit(fail > 0 ? 1 : 0);

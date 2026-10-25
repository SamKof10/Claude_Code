"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, endSession, hashPassword, isValidEmail, startSession, verifyPassword } from "@/lib/auth";
import { store } from "@/lib/db";
import { todayISO } from "@/lib/data";
import { phaseSpec, weekFromStart } from "@/lib/phase";
import { exerciseById, DUMBBELL_MAX_KG } from "@/lib/plan";

/**
 * Fehler laufen über einen Redirect statt über einen Rückgabewert. Das macht
 * die Anmeldung unabhängig davon, ob React schon hydriert ist — ein Klick in
 * der ersten Sekunde nach dem Laden verschluckt die Meldung sonst.
 */
export type AuthErrorCode = "email" | "kurz" | "datum" | "existiert" | "leer" | "falsch" | "speicher";

function backToAuth(code: AuthErrorCode, email: string, register: boolean): never {
  const params = new URLSearchParams({ fehler: code });
  if (email) params.set("email", email);
  if (register) params.set("neu", "1");
  redirect(`/login?${params.toString()}`);
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const startDate = String(formData.get("startDate") ?? "") || todayISO();

  if (!isValidEmail(email)) backToAuth("email", email, true);
  if (password.length < 8) backToAuth("kurz", email, true);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) backToAuth("datum", email, true);

  let userId: string;
  try {
    if (await store.findUserByEmail(email)) backToAuth("existiert", email, true);
    const user = await store.createUser(email, await hashPassword(password), startDate);
    userId = user.id;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("Registrierung fehlgeschlagen:", err);
    backToAuth("speicher", email, true);
  }
  await startSession(userId);
  redirect("/");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) backToAuth("leer", email, false);

  let userId: string;
  try {
    const user = await store.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) backToAuth("falsch", email, false);
    userId = user.id;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("Anmeldung fehlgeschlagen:", err);
    backToAuth("speicher", email, false);
  }
  await startSession(userId);
  redirect("/");
}

/** redirect() wirft intern — dieser Wurf darf nicht als Speicherfehler durchgehen. */
function isRedirectError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err && String((err as { digest?: unknown }).digest ?? "").startsWith("NEXT_REDIRECT");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}

export async function logSetAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/login");

  const exerciseId = String(formData.get("exerciseId") ?? "");
  const exercise = exerciseById(exerciseId);
  if (!exercise) return;

  const date = normalizeDate(String(formData.get("date") ?? ""));
  const reps = clampInt(formData.get("reps"), 1, 100);
  const rawWeight = Number(formData.get("weightKg") ?? 0);
  const isDropSet = formData.get("isDropSet") === "on" || formData.get("isDropSet") === "true";
  if (reps === null) return;

  let weightKg = Number.isFinite(rawWeight) ? Math.max(0, Math.round(rawWeight * 10) / 10) : 0;
  if (exercise.equipment === "bodyweight") weightKg = 0;
  if (exercise.equipment === "dumbbell") weightKg = Math.min(weightKg, DUMBBELL_MAX_KG);
  if (weightKg > 500) weightKg = 500;

  const week = weekFromStart(user.startDate, new Date(date + "T12:00:00Z"));
  const spec = phaseSpec(week);

  const session = await store.ensureSession(user.id, date, exercise.dayType, week, spec.phase);
  const existing = (await store.loadUserData(user.id)).sets.filter(
    (s) => s.sessionId === session.id && s.exerciseId === exerciseId,
  );
  // Aus dem Maximum ableiten, nicht aus der Anzahl: sonst kollidiert ein neuer
  // Satz mit einer bestehenden Nummer, sobald mittendrin einer gelöscht wurde.
  const setNumber = existing.reduce((max, s) => Math.max(max, s.setNumber), 0) + 1;

  await store.addSet({
    sessionId: session.id,
    exerciseId,
    setNumber,
    reps,
    weightKg,
    rpe: null,
    notes: null,
    isDropSet,
  });

  revalidatePath("/", "layout");
}

export async function deleteSetAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/login");
  const setId = String(formData.get("setId") ?? "");
  if (setId) await store.deleteSet(user.id, setId);
  revalidatePath("/", "layout");
}

export async function updateStartDateAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/login");
  const startDate = String(formData.get("startDate") ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) await store.setStartDate(user.id, startDate);
  revalidatePath("/", "layout");
}

export async function resetDataAction(): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/login");
  await store.deleteAllData(user.id);
  revalidatePath("/", "layout");
}

function normalizeDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : todayISO();
}

function clampInt(value: FormDataEntryValue | null, min: number, max: number): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

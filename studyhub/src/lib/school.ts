/**
 * South Tyrol's school system, in one place.
 *
 * StudyHub targets the *Oberschule*: five years, numbered 1 to 5, ending in the
 * Matura. Two details differ from the anglophone shape the app started with and
 * are easy to get subtly wrong, which is why they live here rather than being
 * spelled out at each call site:
 *
 * - the years are Klassen 1–5, not grades 9–13;
 * - the school year turns over in **September**, so deriving it from the
 *   calendar year alone reports the wrong year for eight months of it.
 */

export const SCHOOL_LEVEL = "Oberschule";

export const SCHOOL_CLASSES = ["1. Klasse", "2. Klasse", "3. Klasse", "4. Klasse", "5. Klasse"] as const;

export type SchoolClass = (typeof SCHOOL_CLASSES)[number];

/** Where each Klasse sits in the Oberschule: two years of Biennium, three of Triennium, the last one the Matura year. */
export const SCHOOL_CLASS_STAGE: Record<SchoolClass, string> = {
  "1. Klasse": "Biennium",
  "2. Klasse": "Biennium",
  "3. Klasse": "Triennium",
  "4. Klasse": "Triennium",
  "5. Klasse": "Maturajahr",
};

/** September is month 8. Before it, you are still in the school year that began last autumn. */
const SCHOOL_YEAR_START_MONTH = 8;

function labelFor(startYear: number): string {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}

/** The running school year in South Tyrolean form, e.g. `2026/27`. */
export function currentSchoolYear(now: Date = new Date()): string {
  const startYear = now.getMonth() >= SCHOOL_YEAR_START_MONTH ? now.getFullYear() : now.getFullYear() - 1;
  return labelFor(startYear);
}

/** The running year plus its neighbours, so the picker covers a repeated or an already-planned year. */
export function schoolYearOptions(now: Date = new Date()): string[] {
  const startYear = Number(currentSchoolYear(now).slice(0, 4));
  return [startYear - 1, startYear, startYear + 1].map(labelFor);
}

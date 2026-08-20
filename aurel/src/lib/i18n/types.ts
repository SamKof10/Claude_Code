import type { de } from "./de";

/**
 * `de` is declared `as const` so its keys are exact, but that also pins every
 * value to a string literal. Widening it back to plain strings and mutable
 * arrays gives the other locales a shape to satisfy without forcing them to
 * repeat the German wording.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : { -readonly [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof de>;

export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { label: string; english: string; flag: string }> = {
  de: { label: "Deutsch", english: "German", flag: "🇩🇪" },
  en: { label: "English", english: "English", flag: "🇬🇧" },
};

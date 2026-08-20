"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { de } from "./de";
import { en } from "./en";
import { LOCALES, LOCALE_META, type Dict, type Locale } from "./types";

export { LOCALES, LOCALE_META };
export type { Dict, Locale };

const DICTS: Record<Locale, Dict> = { de: de as unknown as Dict, en };
const STORAGE_KEY = "aurel.locale.v1";
const DEFAULT_LOCALE: Locale = "de";

/** Replaces {placeholders} — the one bit of formatting the copy needs. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

interface I18nValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start on the default so the server and the first client render
  // agree; the stored or browser preference is applied after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let next: Locale | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) next = stored;
    } catch {
      /* storage blocked — fall through to the browser preference */
    }
    if (!next) {
      const browser = navigator.language.slice(0, 2).toLowerCase();
      if (isLocale(browser)) next = browser;
    }
    // Reading storage and navigator has to wait until after hydration —
    // rendering the stored locale on the server would mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next && next !== DEFAULT_LOCALE) setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* not persisting is survivable */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: DICTS[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Shorthand for the common case of only needing the dictionary. */
export function useT(): Dict {
  return useI18n().t;
}

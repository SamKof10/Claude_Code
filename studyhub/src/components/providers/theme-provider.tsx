"use client";

import * as React from "react";

/**
 * StudyHub follows the system appearance by default.
 *
 * HIG Dark Mode is explicit about this: "Avoid offering an app-specific
 * appearance setting… people generally expect all apps to respect their
 * preference," and they can pick Auto, "which switches between the light and
 * dark appearances as conditions change throughout the day, potentially while
 * your app is running."
 *
 * So "system" is the default and the stylesheet handles it entirely through
 * `prefers-color-scheme` — we stamp `data-theme` on <html> ONLY when someone
 * deliberately overrides it. That also means an Auto switch at noon reaches a
 * page that's already open, with no reload and no JS listener needed.
 */
export type ThemePreference = "system" | "light" | "dark";
/** What is actually on screen once "system" has been resolved. */
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** What the user chose — may be "system". */
  preference: ThemePreference;
  /** What that currently renders as. */
  theme: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  /** Flips to the opposite of what's on screen, then pins it. */
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "studyhub:theme";

/**
 * Runs before first paint (injected in the root layout) so the stored override
 * is applied without a flash. Deliberately does nothing for "system" — the
 * media query in globals.css already has it covered.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyPreference(p: ThemePreference) {
  const root = document.documentElement;
  if (p === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", p);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>(() => {
    if (typeof document === "undefined") return "system";
    const stamped = document.documentElement.getAttribute("data-theme");
    return stamped === "light" || stamped === "dark" ? stamped : "system";
  });

  // Tracks the OS setting so the UI can show what "system" currently means,
  // and so a mid-session Auto switch re-renders anything reading `theme`.
  const [osTheme, setOsTheme] = React.useState<ResolvedTheme>(systemTheme);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setOsTheme(mq.matches ? "light" : "dark");
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setPreference = React.useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    applyPreference(p);
    try {
      if (p === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, p);
    } catch {
      // Private mode / blocked storage: the choice still applies this session.
    }
  }, []);

  const theme: ResolvedTheme = preference === "system" ? osTheme : preference;

  const toggleTheme = React.useCallback(() => {
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  const value = React.useMemo(
    () => ({ preference, theme, setPreference, toggleTheme }),
    [preference, theme, setPreference, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

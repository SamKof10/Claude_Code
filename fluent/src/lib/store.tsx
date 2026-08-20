"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

export type SrsState = "new" | "learning" | "familiar" | "mastered";
export type Skill = "vocabulary" | "listening" | "speaking" | "grammar" | "writing" | "naturalness";
export type ExplanationLanguage = "de" | "en" | "adaptive";
export type Accent = "british" | "american" | "australian" | "irish" | "canadian";
export type Theme = "dark" | "light";
export type ActivityId =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "writing"
  | "think"
  | "translate"
  | "natural"
  | "c1c2"
  | "debate"
  | "reallife"
  | "abroad"
  | "tutor"
  | "session";

export interface VocabProgress {
  state: SrsState;
  seen: number;
  correct: number;
  lastResult?: "correct" | "incorrect";
}

export interface SessionRecord {
  date: string;
  minutes: number;
  newWords: number;
  grammarPatterns: number;
  speakingExercises: number;
  progressGain: number;
}

export interface FluentState {
  hydrated: boolean;
  level: string;
  targetLevel: string;
  c1Progress: number;
  streakDays: number;
  lastActiveDate: string | null;
  totalWordsMastered: number;
  totalMinutes: number;
  minutesToday: number;
  weeklyProgress: number[];
  skillScores: Record<Skill, number>;
  vocab: Record<string, VocabProgress>;
  completedActivities: ActivityId[];
  sessions: SessionRecord[];
  theme: Theme;
  explanationLanguage: ExplanationLanguage;
  accent: Accent;
  dailyGoalMinutes: number;
}

const STORAGE_KEY = "fluent.state.v1";
const todayISO = () => new Date().toISOString().slice(0, 10);

function seedVocab(): Record<string, VocabProgress> {
  return {
    subtle: { state: "mastered", seen: 6, correct: 6 },
    "run-into": { state: "familiar", seen: 4, correct: 3, lastResult: "correct" },
    arguably: { state: "learning", seen: 3, correct: 1, lastResult: "incorrect" },
    "sold-on": { state: "learning", seen: 2, correct: 1, lastResult: "incorrect" },
    pivotal: { state: "familiar", seen: 3, correct: 2, lastResult: "correct" },
    nuanced: { state: "new", seen: 0, correct: 0 },
    "get-around-to": { state: "learning", seen: 2, correct: 0, lastResult: "incorrect" },
    candid: { state: "mastered", seen: 5, correct: 5 },
    daunting: { state: "familiar", seen: 3, correct: 2, lastResult: "correct" },
    "bear-in-mind": { state: "mastered", seen: 4, correct: 4 },
  };
}

function initialState(): FluentState {
  return {
    hydrated: false,
    level: "B2+",
    targetLevel: "C1",
    c1Progress: 68,
    streakDays: 6,
    lastActiveDate: null,
    totalWordsMastered: 1284,
    totalMinutes: 3120,
    minutesToday: 0,
    weeklyProgress: [54, 57, 59, 61, 63, 65, 66, 68],
    skillScores: {
      vocabulary: 74,
      listening: 69,
      speaking: 61,
      grammar: 78,
      writing: 65,
      naturalness: 58,
    },
    vocab: seedVocab(),
    completedActivities: [],
    sessions: [],
    theme: "dark",
    explanationLanguage: "adaptive",
    accent: "british",
    dailyGoalMinutes: 50,
  };
}

type Action =
  | { type: "hydrate"; state: Partial<FluentState> }
  | { type: "setTheme"; theme: Theme }
  | { type: "setExplanationLanguage"; value: ExplanationLanguage }
  | { type: "setAccent"; value: Accent }
  | { type: "setDailyGoal"; minutes: number }
  | { type: "reviewWord"; id: string; correct: boolean }
  | { type: "bumpSkill"; skill: Skill; delta: number }
  | { type: "markActivity"; id: ActivityId }
  | { type: "logMinutes"; minutes: number }
  | { type: "touchStreak" }
  | { type: "completeSession"; record: SessionRecord }
  | { type: "resetProgress" };

function nextSrs(state: SrsState, correct: boolean): SrsState {
  const order: SrsState[] = ["new", "learning", "familiar", "mastered"];
  const idx = order.indexOf(state);
  if (correct) return order[Math.min(idx + 1, order.length - 1)];
  return order[Math.max(idx - 1, 0)];
}

function withStreak(state: FluentState): Pick<FluentState, "streakDays" | "lastActiveDate"> {
  const today = todayISO();
  if (state.lastActiveDate === today) return { streakDays: state.streakDays, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakDays = state.lastActiveDate === yesterday ? state.streakDays + 1 : 1;
  return { streakDays, lastActiveDate: today };
}

function reducer(state: FluentState, action: Action): FluentState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "setTheme":
      return { ...state, theme: action.theme };
    case "setExplanationLanguage":
      return { ...state, explanationLanguage: action.value };
    case "setAccent":
      return { ...state, accent: action.value };
    case "setDailyGoal":
      return { ...state, dailyGoalMinutes: action.minutes };
    case "reviewWord": {
      const current = state.vocab[action.id] ?? { state: "new" as SrsState, seen: 0, correct: 0 };
      const nextState = nextSrs(current.state, action.correct);
      const wasMastered = current.state === "mastered";
      const isMastered = nextState === "mastered";
      const delta = isMastered && !wasMastered ? 1 : !isMastered && wasMastered ? -1 : 0;
      return {
        ...state,
        totalWordsMastered: state.totalWordsMastered + delta,
        vocab: {
          ...state.vocab,
          [action.id]: {
            state: nextState,
            seen: current.seen + 1,
            correct: current.correct + (action.correct ? 1 : 0),
            lastResult: action.correct ? "correct" : "incorrect",
          },
        },
      };
    }
    case "bumpSkill": {
      const current = state.skillScores[action.skill];
      const value = Math.max(0, Math.min(100, current + action.delta));
      return { ...state, skillScores: { ...state.skillScores, [action.skill]: value } };
    }
    case "markActivity": {
      if (state.completedActivities.includes(action.id)) return state;
      return { ...state, completedActivities: [...state.completedActivities, action.id] };
    }
    case "logMinutes":
      return {
        ...state,
        minutesToday: state.minutesToday + action.minutes,
        totalMinutes: state.totalMinutes + action.minutes,
        ...withStreak(state),
      };
    case "touchStreak":
      return { ...state, ...withStreak(state) };
    case "completeSession": {
      const gain = action.record.progressGain;
      const weeklyProgress = [...state.weeklyProgress.slice(1), Math.min(100, state.c1Progress + gain)];
      return {
        ...state,
        c1Progress: Math.min(100, state.c1Progress + gain),
        weeklyProgress,
        sessions: [action.record, ...state.sessions].slice(0, 30),
        minutesToday: state.minutesToday + action.record.minutes,
        totalMinutes: state.totalMinutes + action.record.minutes,
        ...withStreak(state),
      };
    }
    case "resetProgress":
      return { ...initialState(), hydrated: true, theme: state.theme };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: FluentState;
  setTheme: (t: Theme) => void;
  setExplanationLanguage: (v: ExplanationLanguage) => void;
  setAccent: (v: Accent) => void;
  setDailyGoal: (m: number) => void;
  reviewWord: (id: string, correct: boolean) => void;
  bumpSkill: (skill: Skill, delta: number) => void;
  markActivity: (id: ActivityId) => void;
  logMinutes: (minutes: number) => void;
  completeSession: (record: SessionRecord) => void;
  resetProgress: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readStored(): Partial<FluentState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<FluentState>;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) dispatch({ type: "hydrate", state: stored });
    else dispatch({ type: "hydrate", state: {} });
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const persisted: Partial<FluentState> = { ...state };
      delete persisted.hydrated;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* storage full or blocked — app still works for this session */
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    try {
      window.localStorage.setItem("fluent.theme", state.theme);
    } catch {
      /* ignore */
    }
  }, [state.theme]);

  const setTheme = useCallback((theme: Theme) => dispatch({ type: "setTheme", theme }), []);
  const setExplanationLanguage = useCallback(
    (value: ExplanationLanguage) => dispatch({ type: "setExplanationLanguage", value }),
    [],
  );
  const setAccent = useCallback((value: Accent) => dispatch({ type: "setAccent", value }), []);
  const setDailyGoal = useCallback((minutes: number) => dispatch({ type: "setDailyGoal", minutes }), []);
  const reviewWord = useCallback(
    (id: string, correct: boolean) => dispatch({ type: "reviewWord", id, correct }),
    [],
  );
  const bumpSkill = useCallback(
    (skill: Skill, delta: number) => dispatch({ type: "bumpSkill", skill, delta }),
    [],
  );
  const markActivity = useCallback((id: ActivityId) => dispatch({ type: "markActivity", id }), []);
  const logMinutes = useCallback((minutes: number) => dispatch({ type: "logMinutes", minutes }), []);
  const completeSession = useCallback(
    (record: SessionRecord) => dispatch({ type: "completeSession", record }),
    [],
  );
  const resetProgress = useCallback(() => dispatch({ type: "resetProgress" }), []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      setTheme,
      setExplanationLanguage,
      setAccent,
      setDailyGoal,
      reviewWord,
      bumpSkill,
      markActivity,
      logMinutes,
      completeSession,
      resetProgress,
    }),
    [
      state,
      setTheme,
      setExplanationLanguage,
      setAccent,
      setDailyGoal,
      reviewWord,
      bumpSkill,
      markActivity,
      logMinutes,
      completeSession,
      resetProgress,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const LEVEL_ORDER = ["B2", "B2+", "C1", "C1+", "C2"] as const;

export const SKILL_LABELS: Record<Skill, string> = {
  vocabulary: "Vocabulary",
  listening: "Listening",
  speaking: "Speaking",
  grammar: "Grammar",
  writing: "Writing",
  naturalness: "Naturalness",
};

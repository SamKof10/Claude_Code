"use client";

import { create } from "zustand";
import { auth, AuthError, localAccountCount, type Account } from "@/lib/auth";
import { adoptAccountData, releaseAccountData } from "@/lib/store";
import { useFocusStore } from "@/lib/store/focus";

export type AuthStatus = "loading" | "signed-out" | "signed-in";

interface AuthState {
  status: AuthStatus;
  account: Account | null;
  /** Whether this device already holds an account — decides whether the screen opens on sign-in or sign-up. */
  hasAccounts: boolean;
  /** True while a sign-in or sign-up is in flight — PBKDF2 takes a moment on purpose. */
  pending: boolean;
  error: string | null;
  restore: () => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<boolean>;
  signIn: (input: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function messageFor(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  return "Something went wrong. Try again.";
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  account: null,
  hasAccounts: false,
  pending: false,
  error: null,

  restore: async () => {
    const account = await auth.restore();
    set({ hasAccounts: localAccountCount() > 0 });
    if (!account) {
      set({ status: "signed-out", account: null });
      return;
    }
    adoptAccountData(account.id);
    set({ status: "signed-in", account });
  },

  signUp: async ({ name, email, password }) => {
    set({ pending: true, error: null });
    try {
      const account = await auth.signUp({ name, email, password });
      adoptAccountData(account.id);
      set({ status: "signed-in", account, hasAccounts: true, pending: false });
      return true;
    } catch (error) {
      set({ pending: false, error: messageFor(error) });
      return false;
    }
  },

  signIn: async ({ email, password }) => {
    set({ pending: true, error: null });
    try {
      const account = await auth.signIn({ email, password });
      adoptAccountData(account.id);
      set({ status: "signed-in", account, pending: false });
      return true;
    } catch (error) {
      set({ pending: false, error: messageFor(error) });
      return false;
    }
  },

  signOut: async () => {
    await auth.signOut();
    // Order matters: drop the data before anything can render against a
    // signed-out shell holding the previous account's state.
    releaseAccountData();
    // The timer is device-level, so it is stopped rather than namespaced —
    // a block left running must not carry into the next account.
    useFocusStore.getState().clear();
    set({ status: "signed-out", account: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

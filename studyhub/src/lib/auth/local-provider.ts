"use client";

// The device-local auth provider. Accounts live in this browser's
// localStorage, which means: no server ever sees these credentials, and the
// account does not follow you to another device or browser. The sign-in screen
// says so out loud rather than implying a real backend.

import { uid } from "@/lib/utils";
import { hashPassword, verifyPassword, type PasswordDigest } from "./password";
import {
  AuthError,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  normalizeEmail,
  type Account,
  type AuthProvider,
  type Credentials,
  type SignUpInput,
} from "./types";

const ACCOUNTS_KEY = "studyhub:accounts";
const SESSION_KEY = "studyhub:session";

interface StoredAccount extends Account, PasswordDigest {}

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    throw new AuthError("unavailable", "Dieser Browser blockiert den lokalen Speicher, deshalb lassen sich keine Konten sichern.");
  }
}

/** Strips the password digest — nothing outside this module should ever see it. */
function publicAccount({ id, email, name, createdAt }: StoredAccount): Account {
  return { id, email, name, createdAt };
}

function setSession(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // A blocked store just means the session won't survive a reload.
  }
}

export const localAuthProvider: AuthProvider = {
  kind: "local",

  async signUp({ name, email, password }: SignUpInput): Promise<Account> {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) throw new AuthError("invalid-email", "Das sieht nicht nach einer E-Mail-Adresse aus.");
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError("weak-password", `Nimm mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`);
    }

    const accounts = readAccounts();
    if (accounts.some((a) => a.email === normalized)) {
      throw new AuthError("email-taken", "Auf diesem Gerät gibt es schon ein Konto mit dieser E-Mail.");
    }

    const digest = await hashPassword(password);
    const account: StoredAccount = {
      id: uid("acct"),
      email: normalized,
      name: name.trim() || normalized.split("@")[0],
      createdAt: new Date().toISOString(),
      ...digest,
    };
    writeAccounts([...accounts, account]);
    setSession(account.id);
    return publicAccount(account);
  },

  async signIn({ email, password }: Credentials): Promise<Account> {
    const normalized = normalizeEmail(email);
    const account = readAccounts().find((a) => a.email === normalized);
    // Same error whether the email is unknown or the password is wrong, so the
    // screen can't be used to enumerate which accounts exist.
    const ok = account ? await verifyPassword(password, account) : false;
    if (!account || !ok) throw new AuthError("invalid-credentials", "E-Mail oder Passwort stimmt nicht.");
    setSession(account.id);
    return publicAccount(account);
  },

  async signOut(): Promise<void> {
    setSession(null);
  },

  async restore(): Promise<Account | null> {
    try {
      const id = window.localStorage.getItem(SESSION_KEY);
      if (!id) return null;
      const account = readAccounts().find((a) => a.id === id);
      if (!account) {
        setSession(null);
        return null;
      }
      return publicAccount(account);
    } catch {
      return null;
    }
  },
};

/** How many accounts exist on this device — the sign-in screen opens on sign-up when there are none. */
export function localAccountCount(): number {
  return readAccounts().length;
}

// Auth is provider-shaped for the same reason the AI layer is: the UI talks to
// an interface, never to a backend. Today the only implementation stores
// accounts in this browser (see local-provider.ts). Swapping in Supabase Auth
// means adding a second file here — no component changes.

export interface Account {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type AuthErrorCode =
  | "invalid-email"
  | "weak-password"
  | "email-taken"
  | "invalid-credentials"
  | "unavailable";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpInput extends Credentials {
  name: string;
}

export interface AuthProvider {
  /** Which implementation is answering — surfaced in the UI so the storage model is never implied. */
  readonly kind: "local" | "supabase";
  signUp(input: SignUpInput): Promise<Account>;
  signIn(input: Credentials): Promise<Account>;
  signOut(): Promise<void>;
  /** The account from a previous visit, or null. */
  restore(): Promise<Account | null>;
}

export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}

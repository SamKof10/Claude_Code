import { localAuthProvider } from "./local-provider";
import type { AuthProvider } from "./types";

/**
 * The active provider. Everything in the UI imports this, never a concrete
 * implementation, so adding Supabase Auth later is a change in this file.
 */
export const auth: AuthProvider = localAuthProvider;

export { localAccountCount } from "./local-provider";
export * from "./types";

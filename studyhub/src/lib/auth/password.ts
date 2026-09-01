// Passwords are never stored — only a PBKDF2 derivation of them, with a random
// per-account salt. This is browser-side storage, so it is not a substitute for
// a server: anyone with access to the machine can read the derived hash and
// attack it offline. It does mean a readable password never sits in
// localStorage, which is the failure worth avoiding here.

import { AuthError } from "./types";

const ITERATIONS = 210_000;
const HASH = "SHA-256";
const KEY_BITS = 256;
const SALT_BYTES = 16;

function subtle(): SubtleCrypto {
  const c = globalThis.crypto;
  // Web Crypto is only exposed in secure contexts (https, or localhost).
  if (!c?.subtle) {
    throw new AuthError(
      "unavailable",
      "Dieser Browser kann hier keine Passwörter verschlüsseln. Konten brauchen eine sichere Verbindung (https oder localhost)."
    );
  }
  return c.subtle;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const key = await subtle().importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle().deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: HASH }, key, KEY_BITS);
  return toBase64(new Uint8Array(bits));
}

export interface PasswordDigest {
  salt: string;
  hash: string;
}

export async function hashPassword(password: string): Promise<PasswordDigest> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return { salt: toBase64(salt), hash: await derive(password, salt) };
}

export async function verifyPassword(password: string, digest: PasswordDigest): Promise<boolean> {
  const candidate = await derive(password, fromBase64(digest.salt));
  // Compare over the full length so a wrong password costs the same as a
  // right one, rather than returning on the first differing character.
  if (candidate.length !== digest.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i += 1) diff |= candidate.charCodeAt(i) ^ digest.hash.charCodeAt(i);
  return diff === 0;
}

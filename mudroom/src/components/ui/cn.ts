/** Minimal class joiner — no dependency needed for what we do with it. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

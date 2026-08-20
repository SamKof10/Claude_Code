export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"’]/g, "")
    .replace(/\s+/g, " ");
}

export function answersMatch(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b);
}

/** Loose similarity check for free-text grammar fixes — ignores case,
 * punctuation and doubled spaces so minor formatting differences still count. */
export function looseMatch(a: string, b: string): boolean {
  const strip = (s: string) => normalizeAnswer(s).replace(/[^a-z0-9 ]/g, "");
  return strip(a) === strip(b);
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

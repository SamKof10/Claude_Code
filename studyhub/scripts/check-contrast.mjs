#!/usr/bin/env node
/**
 * Contrast gate for StudyHub's design tokens.
 *
 * Parses the palette straight out of src/app/globals.css — no second copy of
 * the values to drift — and checks every foreground token against every
 * surface it can actually land on, in both appearances.
 *
 * Thresholds follow HIG Accessibility / WCAG:
 *   • text            ≥ 4.5:1   (up to 17pt, which is all of our UI text)
 *   • large/bold text ≥ 3:1
 *   • graphics/marks  ≥ 3:1     (chart fills, badge washes, borders)
 *
 * Run: node scripts/check-contrast.mjs      (exit code 1 on any failure)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "src", "app", "globals.css"), "utf8");

/** Pull `--name: #hex;` declarations out of the stylesheet. */
function readTokens(prefix) {
  const out = {};
  const re = new RegExp(`--${prefix}-([a-z0-9-]+)\\s*:\\s*(#[0-9a-fA-F]{3,8})\\s*;`, "g");
  let m;
  while ((m = re.exec(css))) out[m[1]] = m[2];
  return out;
}

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const dark = readTokens("d");
const light = readTokens("l");

// Surfaces any given foreground can sit on, per appearance.
const surfacesOf = (t) => [
  ["bg", t.bg],
  ["chrome", t.chrome],
  ["surface", t.surface],
  ["surface-2", t["surface-2"]],
  ["surface-overlay", t["surface-overlay"]],
];

// Foregrounds that render as TEXT (or as small icons that carry meaning).
const textOf = (t) => [
  ["ink", t.ink],
  ["ink-2", t["ink-2"]],
  ["ink-3", t["ink-3"]],
  ["success-text", t["success-text"]],
  ["warning-text", t["warning-text"]],
  ["danger-text", t["danger-text"]],
  ["signal-2", t["signal-2"]],
];

// Subject accents are used as chart fills and small dots — graphics, 3:1.
const marksOf = (t) =>
  Object.entries(t)
    .filter(([k]) => /^subj-\d$/.test(k))
    .map(([k, v]) => [k, v]);

let failures = 0;

function audit(label, tokens) {
  console.log(`\n═══ ${label} ═══`);
  const surfaces = surfacesOf(tokens);

  console.log("\n  text tokens — need ≥ 4.5:1");
  for (const [fgName, fgHex] of textOf(tokens)) {
    if (!fgHex) continue;
    let worst = Infinity;
    let worstOn = "";
    for (const [sName, sHex] of surfaces) {
      if (!sHex) continue;
      const r = contrast(fgHex, sHex);
      if (r < worst) {
        worst = r;
        worstOn = sName;
      }
    }
    const ok = worst >= 4.5;
    if (!ok) failures++;
    console.log(
      `    ${ok ? "PASS" : "FAIL"}  ${fgName.padEnd(13)} ${fgHex}  worst ${worst.toFixed(2)} on ${worstOn}`
    );
  }

  console.log("\n  graphic marks — need ≥ 3:1");
  for (const [fgName, fgHex] of marksOf(tokens)) {
    let worst = Infinity;
    let worstOn = "";
    for (const [sName, sHex] of surfaces) {
      if (!sHex) continue;
      const r = contrast(fgHex, sHex);
      if (r < worst) {
        worst = r;
        worstOn = sName;
      }
    }
    const ok = worst >= 3;
    if (!ok) failures++;
    console.log(
      `    ${ok ? "PASS" : "FAIL"}  ${fgName.padEnd(13)} ${fgHex}  worst ${worst.toFixed(2)} on ${worstOn}`
    );
  }

  // Depth check: an overlay must never be dimmer than the surface it floats
  // above (HIG Dark Mode base/elevated model).
  const surfaceL = relativeLuminance(tokens.surface);
  const overlayL = relativeLuminance(tokens["surface-overlay"]);
  const depthOk = label.startsWith("DARK") ? overlayL >= surfaceL : overlayL >= surfaceL;
  if (!depthOk) failures++;
  console.log(
    `\n  ${depthOk ? "PASS" : "FAIL"}  elevation: surface-overlay ${
      depthOk ? "is at least as bright as" : "is DIMMER than"
    } surface`
  );
}

audit("DARK", dark);
audit("LIGHT", light);

// White-on-accent, used by the primary button and every gradient chip.
console.log("\n═══ white on accent fills ═══");
const pick = (name) => (css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`)) || [])[1];
for (const [name, hex] of [
  ["gradient start (--grad-1)", pick("grad-1")],
  ["gradient end (--grad-2)", pick("grad-2")],
  ["danger (destructive button)", pick("danger")],
]) {
  if (!hex) continue;
  const r = contrast("#ffffff", hex);
  // Button labels are 13-14px semibold; hold them to the 4.5:1 text bar.
  const ok = r >= 4.5;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  white on ${name.padEnd(30)} ${hex}  ${r.toFixed(2)}`);
}

console.log(
  failures === 0
    ? "\n✓ All contrast checks passed.\n"
    : `\n✗ ${failures} contrast check(s) failed.\n`
);
process.exit(failures === 0 ? 0 : 1);

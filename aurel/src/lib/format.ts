const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const eurExact = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Cents → "€329" (whole) or "€329,50" (with a remainder). */
export function formatPrice(cents: number): string {
  return cents % 100 === 0 ? eur.format(cents / 100) : eurExact.format(cents / 100);
}

export function formatPriceExact(cents: number): string {
  return eurExact.format(cents / 100);
}

export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  // Tanner Helland's approximation, clamped to the range the ARC can render.
  const t = Math.min(6500, Math.max(1800, kelvin)) / 100;
  let r: number;
  let g: number;
  let b: number;

  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }

  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;

  const clamp = (n: number) => Math.round(Math.min(255, Math.max(0, n)));
  return { r: clamp(r), g: clamp(g), b: clamp(b) };
}

export function kelvinToCss(kelvin: number, mixWhite = 0): string {
  const { r, g, b } = kelvinToRgb(kelvin);
  const m = (c: number) => Math.round(c + (255 - c) * mixWhite);
  return `rgb(${m(r)} ${m(g)} ${m(b)})`;
}

/** 0–1 through the waking day → the Kelvin the ARC would be running. */
export function dayProgressToKelvin(p: number): number {
  const clamped = Math.min(1, Math.max(0, p));
  // Sunrise ember → midday daylight → evening ember, weighted to the afternoon.
  const curve = Math.sin(Math.PI * Math.pow(clamped, 0.92));
  return Math.round(1800 + curve * 4700);
}

/** 0–1 through the waking day → a clock label (06:00 → 23:00). */
export function dayProgressToClock(p: number): string {
  const minutes = 6 * 60 + Math.min(1, Math.max(0, p)) * 17 * 60;
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60 / 5) * 5;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Approximate sRGB for a visible wavelength (Dan Bruton's method).
 * Used for the spectral-power plot, where the bars should be the colour of
 * the light they represent rather than an arbitrary ramp.
 */
export function wavelengthToCss(nm: number, floor = 0.25): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }

  // Intensity rolls off at both ends of the visible range.
  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700 && nm <= 780) factor = 0.3 + (0.7 * (780 - nm)) / 80;
  else if (nm < 380 || nm > 780) factor = 0;

  // Lift off pure black so every bar stays visible on a dark panel.
  const ch = (c: number) => Math.round(255 * (floor + (1 - floor) * Math.pow(c * factor, 0.8)));
  return `rgb(${ch(r)} ${ch(g)} ${ch(b)})`;
}

/**
 * Chart-safe colour for a colour temperature: ember at the warm end,
 * daylight blue at the cool end. The physical blackbody colour goes white
 * at 6500K, which vanishes on pale paper — this keeps both ends legible.
 */
export function chartKelvinCss(kelvin: number): string {
  const t = Math.min(1, Math.max(0, (kelvin - 1800) / 4700));
  const stops: Array<[number, [number, number, number]]> = [
    [0, [232, 163, 61]],
    [0.5, [240, 223, 197]],
    [1, [176, 203, 232]],
  ];
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
  const [t0, c0] = stops[i];
  const [t1, c1] = stops[i + 1];
  const f = (t - t0) / (t1 - t0);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * f);
  return `rgb(${mix(c0[0], c1[0])} ${mix(c0[1], c1[1])} ${mix(c0[2], c1[2])})`;
}

/** German decimal, e.g. 60.9 → "60,9". */
export function formatDecimal(value: number, decimals = 1): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

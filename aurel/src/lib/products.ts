/**
 * AUREL catalogue.
 *
 * Prices are integer cents — never floats. A variant is a (model × finish)
 * pair and carries its own SKU, which is what the cart and the order
 * payload actually reference.
 */

export type FinishId = "graphite" | "alabaster" | "sand";
export type ModelId = "arc" | "arc-max";

export interface Finish {
  id: FinishId;
  /** Anodised body colour, used by the SVG product renderer. */
  body: string;
  bodyLight: string;
  bodyDark: string;
  /** Swatch ring colour on paper. */
  swatch: string;
}

export interface Model {
  id: ModelId;
  /** Product name — a brand mark, identical in every language. */
  name: string;
  priceCents: number;
  compareAtCents?: number;
  /** Emissive bar width in the SVG renderer, in viewBox units. */
  barWidth: number;
  /** Physical bar length, in centimetres. */
  barLengthCm: number;
  lumens: number;
}

export interface Variant {
  sku: string;
  modelId: ModelId;
  finishId: FinishId;
  priceCents: number;
  inStock: boolean;
}

export const FINISHES: Finish[] = [
  {
    id: "graphite",
    body: "#3a3a3e",
    bodyLight: "#5c5c62",
    bodyDark: "#242427",
    swatch: "#3a3a3e",
  },
  {
    id: "alabaster",
    body: "#e4e0d8",
    bodyLight: "#f4f1eb",
    bodyDark: "#c3bdb2",
    swatch: "#e4e0d8",
  },
  {
    id: "sand",
    body: "#c2a480",
    bodyLight: "#d8bf9f",
    bodyDark: "#9c8261",
    swatch: "#c2a480",
  },
];

export const MODELS: Model[] = [
  {
    id: "arc",
    name: "ARC",
    priceCents: 32900,
    barWidth: 300,
    barLengthCm: 58,
    lumens: 1100,
  },
  {
    id: "arc-max",
    name: "ARC MAX",
    priceCents: 44900,
    barWidth: 400,
    barLengthCm: 84,
    lumens: 1750,
  },
];

export const SHIPPING_FREE_THRESHOLD_CENTS = 0; // shipping is always included
export const SHIPPING_CENTS = 0;
export const VAT_RATE = 0.19;

export const VARIANTS: Variant[] = MODELS.flatMap((model) =>
  FINISHES.map<Variant>((finish) => ({
    sku: `AUREL-${model.id.toUpperCase().replace("-", "")}-${finish.id.slice(0, 3).toUpperCase()}`,
    modelId: model.id,
    finishId: finish.id,
    priceCents: model.priceCents,
    inStock: !(model.id === "arc-max" && finish.id === "sand"),
  })),
);

export function getModel(id: ModelId): Model {
  const m = MODELS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown model: ${id}`);
  return m;
}

export function getFinish(id: FinishId): Finish {
  const f = FINISHES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown finish: ${id}`);
  return f;
}

export function getVariant(modelId: ModelId, finishId: FinishId): Variant {
  const v = VARIANTS.find((x) => x.modelId === modelId && x.finishId === finishId);
  if (!v) throw new Error(`No variant for ${modelId}/${finishId}`);
  return v;
}

/* ── Accessories ──────────────────────────────────────────────────────
   Mounts that put the same ARC somewhere else. All descriptive copy
   lives in the dictionaries, keyed by these ids. */

export type AccessoryId = "clip" | "arch";

export interface Accessory {
  id: AccessoryId;
  /** Product name — a brand mark, identical in every language. */
  name: string;
  priceCents: number;
}

export const ACCESSORIES: Accessory[] = [
  { id: "clip", name: "CLIP", priceCents: 5900 },
  { id: "arch", name: "ARCH", priceCents: 14900 },
];

export interface AccessoryVariant {
  sku: string;
  accessoryId: AccessoryId;
  finishId: FinishId;
  priceCents: number;
  inStock: boolean;
}

export const ACCESSORY_VARIANTS: AccessoryVariant[] = ACCESSORIES.flatMap((a) =>
  FINISHES.map<AccessoryVariant>((f) => ({
    sku: `AUREL-${a.name}-${f.id.slice(0, 3).toUpperCase()}`,
    accessoryId: a.id,
    finishId: f.id,
    priceCents: a.priceCents,
    inStock: true,
  })),
);

export function getAccessory(id: AccessoryId): Accessory {
  const a = ACCESSORIES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown accessory: ${id}`);
  return a;
}

export function accessorySku(accessoryId: AccessoryId, finishId: FinishId): string {
  return `AUREL-${getAccessory(accessoryId).name}-${finishId.slice(0, 3).toUpperCase()}`;
}

export function lampSku(modelId: ModelId, finishId: FinishId): string {
  return `AUREL-${modelId.toUpperCase().replace("-", "")}-${finishId.slice(0, 3).toUpperCase()}`;
}

/* ── One catalogue for the cart ───────────────────────────────────────
   Cart and checkout deal in SKUs alone; `kind` decides what sits behind
   one, and the label is resolved from the dictionary at render time. */

export type CatalogEntry =
  | { kind: "lamp"; sku: string; priceCents: number; inStock: boolean; modelId: ModelId; finishId: FinishId }
  | {
      kind: "accessory";
      sku: string;
      priceCents: number;
      inStock: boolean;
      accessoryId: AccessoryId;
      finishId: FinishId;
    };

export function findCatalogEntry(sku: string): CatalogEntry | undefined {
  const lamp = VARIANTS.find((v) => v.sku === sku);
  if (lamp) {
    return {
      kind: "lamp",
      sku: lamp.sku,
      priceCents: lamp.priceCents,
      inStock: lamp.inStock,
      modelId: lamp.modelId,
      finishId: lamp.finishId,
    };
  }
  const acc = ACCESSORY_VARIANTS.find((v) => v.sku === sku);
  if (acc) {
    return {
      kind: "accessory",
      sku: acc.sku,
      priceCents: acc.priceCents,
      inStock: acc.inStock,
      accessoryId: acc.accessoryId,
      finishId: acc.finishId,
    };
  }
  return undefined;
}

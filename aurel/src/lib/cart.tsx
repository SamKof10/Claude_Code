"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  findCatalogEntry,
  SHIPPING_CENTS,
  VAT_RATE,
  type AccessoryId,
  type CatalogEntry,
  type FinishId,
  type ModelId,
} from "./products";

const STORAGE_KEY = "aurel.cart.v1";

export interface CartLine {
  sku: string;
  kind: "lamp" | "accessory";
  unitPriceCents: number;
  quantity: number;
  finishId: FinishId;
  /** Set for lamps — the cart thumbnail renders the real product. */
  modelId?: ModelId;
  /** Set for accessories. */
  accessoryId?: AccessoryId;
}

function lineFromEntry(entry: CatalogEntry): Omit<CartLine, "quantity"> {
  return {
    sku: entry.sku,
    kind: entry.kind,
    unitPriceCents: entry.priceCents,
    finishId: entry.finishId,
    modelId: entry.kind === "lamp" ? entry.modelId : undefined,
    accessoryId: entry.kind === "accessory" ? entry.accessoryId : undefined,
  };
}

interface CartState {
  lines: CartLine[];
}

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: Omit<CartLine, "quantity">; quantity: number }
  | { type: "setQuantity"; sku: string; quantity: number }
  | { type: "remove"; sku: string }
  | { type: "clear" };

const MAX_PER_LINE = 6;

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines };
    case "add": {
      const existing = state.lines.find((l) => l.sku === action.line.sku);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.sku === action.line.sku
              ? { ...l, quantity: Math.min(MAX_PER_LINE, l.quantity + action.quantity) }
              : l,
          ),
        };
      }
      return {
        lines: [...state.lines, { ...action.line, quantity: Math.min(MAX_PER_LINE, action.quantity) }],
      };
    }
    case "setQuantity": {
      if (action.quantity <= 0) {
        return { lines: state.lines.filter((l) => l.sku !== action.sku) };
      }
      return {
        lines: state.lines.map((l) =>
          l.sku === action.sku ? { ...l, quantity: Math.min(MAX_PER_LINE, action.quantity) } : l,
        ),
      };
    }
    case "remove":
      return { lines: state.lines.filter((l) => l.sku !== action.sku) };
    case "clear":
      return { lines: [] };
    default:
      return state;
  }
}

/** A single in-flight "product → cart" animation. */
export interface CartFlight {
  id: number;
  sku: string;
  from: { x: number; y: number; width: number; height: number };
  to: { x: number; y: number };
}

/** Centre of the cart icon, measured when a flight starts. */
function cartTargetCentre(): { x: number; y: number } | null {
  const el = document.getElementById("cart-target");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export interface CartTotals {
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  vatCents: number;
  totalCents: number;
}

interface CartContextValue {
  lines: CartLine[];
  totals: CartTotals;
  isOpen: boolean;
  /** Set while a line is being added, so the button can show a pending state. */
  pendingSku: string | null;
  /** Bumps on every successful add — the cart badge listens for it. */
  addPulse: number;
  /** Set while a product thumbnail is animating towards the cart icon. */
  flight: CartFlight | null;
  endFlight: (id: number) => void;
  open: () => void;
  close: () => void;
  add: (sku: string, quantity?: number, origin?: HTMLElement | null) => void;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Re-validate against the live catalogue: prices and names come from the
    // catalogue, never from storage, so a stale cart can't pin an old price.
    return parsed.flatMap((stored): CartLine[] => {
      if (typeof stored !== "object" || stored === null) return [];
      const { sku, quantity } = stored as { sku?: unknown; quantity?: unknown };
      if (typeof sku !== "string" || typeof quantity !== "number") return [];
      const entry = findCatalogEntry(sku);
      if (!entry) return [];
      return [
        {
          ...lineFromEntry(entry),
          quantity: Math.min(MAX_PER_LINE, Math.max(1, Math.round(quantity))),
        },
      ];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [addPulse, setAddPulse] = useState(0);
  const [flight, setFlight] = useState<CartFlight | null>(null);
  const flightId = useRef(1);
  const hydrated = useRef(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch({ type: "hydrate", lines: readStored() });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.lines.map((l) => ({ sku: l.sku, quantity: l.quantity }))),
      );
    } catch {
      /* storage full or blocked — the cart still works for this session */
    }
  }, [state.lines]);

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const endFlight = useCallback((id: number) => {
    setFlight((cur) => (cur && cur.id === id ? null : cur));
  }, []);

  const add = useCallback(
    (sku: string, quantity = 1, origin?: HTMLElement | null) => {
      const entry = findCatalogEntry(sku);
      if (!entry || !entry.inStock) return;

      if (origin) {
        const r = origin.getBoundingClientRect();
        const to = cartTargetCentre();
        if (to) {
          setFlight({
            id: flightId.current++,
            sku: entry.sku,
            from: { x: r.left, y: r.top, width: r.width, height: r.height },
            to,
          });
        }
      }

      setPendingSku(entry.sku);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      pendingTimer.current = setTimeout(() => {
        dispatch({ type: "add", quantity, line: lineFromEntry(entry) });
        setPendingSku(null);
        setAddPulse((n) => n + 1);
      }, 420);
    },
    [],
  );

  const setQuantity = useCallback(
    (sku: string, quantity: number) => dispatch({ type: "setQuantity", sku, quantity }),
    [],
  );
  const remove = useCallback((sku: string) => dispatch({ type: "remove", sku }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const totals = useMemo<CartTotals>(() => {
    const subtotalCents = state.lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
    const itemCount = state.lines.reduce((sum, l) => sum + l.quantity, 0);
    const shippingCents = subtotalCents > 0 ? SHIPPING_CENTS : 0;
    const totalCents = subtotalCents + shippingCents;
    // Prices are gross; VAT is shown as "included", not added on top.
    const vatCents = Math.round(totalCents - totalCents / (1 + VAT_RATE));
    return { itemCount, subtotalCents, shippingCents, vatCents, totalCents };
  }, [state.lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      totals,
      isOpen,
      pendingSku,
      addPulse,
      flight,
      endFlight,
      open,
      close,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [
      state.lines,
      totals,
      isOpen,
      pendingSku,
      addPulse,
      flight,
      endFlight,
      open,
      close,
      add,
      setQuantity,
      remove,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

/** Matches a media query, SSR-safe (false on the server, live after mount). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True only where hover + a fine pointer exist — gates magnetic effects. */
export function useHasPointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** Fires once the window has scrolled past `threshold` px. */
export function useScrolledPast(threshold = 24): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame: number | null = null;
    const check = () => {
      frame = null;
      setPast(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return past;
}

/** Escape-key handler for overlays. */
export function useEscape(active: boolean, onEscape: () => void) {
  const handler = useRef(onEscape);
  useEffect(() => {
    handler.current = onEscape;
  }, [onEscape]);
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}

/** Locks body scroll while `locked`, preserving the scroll position. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflowY: body.style.overflowY,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflowY = "scroll";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflowY = prev.overflowY;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

/** Magnetic pull towards the cursor. Returns a transform-ready offset. */
export function useMagnetic<T extends HTMLElement>(strength = 0.22, enabled = true) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const reset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        setOffset({
          x: (e.clientX - (rect.left + rect.width / 2)) * strength,
          y: (e.clientY - (rect.top + rect.height / 2)) * strength,
        });
      });
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [strength, enabled, reset]);

  return { ref, offset };
}

/** Ticks a callback every `ms`, pausable via `active`. */
export function useInterval(callback: () => void, ms: number | null, active: boolean) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (ms === null || !active) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms, active]);
}

/**
 * Avoids SSR/CSR hydration mismatches from `Math.random()`-based content
 * selection: renders `initial` on both the server and the client's first
 * pass (identical output, safe to hydrate), then swaps to a fresh pick once
 * mounted — a normal post-hydration update, not a mismatch.
 */
export function useRandomOnMount<T>(pick: () => T, initial: T): T {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only reroll after the SSR-safe initial render
    setValue(pick());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

interface IndicatorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Measures the active item among a set of registered elements and
 * returns a rect to position a sliding indicator behind it — the
 * Smooth UI idiom used for the sidebar's active-nav pill, tab
 * underlines and segmented-control backgrounds. Pure layout
 * measurement; the caller animates the returned rect with a CSS
 * `transition` on `transform`, no animation library involved.
 */
export function useSlidingIndicator<C extends HTMLElement = HTMLDivElement>(activeKey: string | undefined) {
  const containerRef = useRef<C>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  const register = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(key, el);
      else itemRefs.current.delete(key);
    },
    [],
  );

  useLayoutEffect(() => {
    const recalc = () => {
      const container = containerRef.current;
      const el = activeKey ? itemRefs.current.get(activeKey) : undefined;
      if (!container || !el) {
        setRect(null);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setRect({
        top: elRect.top - containerRect.top + container.scrollTop,
        left: elRect.left - containerRect.left + container.scrollLeft,
        width: elRect.width,
        height: elRect.height,
      });
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [activeKey]);

  return { containerRef, register, rect };
}

const CONFETTI_COLORS = ["var(--color-signal)", "var(--color-mint)", "var(--color-amber)", "var(--color-coral)", "var(--color-signal-soft)"];

/**
 * Confetti burst — Magic UI idiom, hand-rolled as a handful of `<span>`
 * nodes animated with the `.confetti-piece` keyframe (no canvas, no
 * library). Appends directly to `document.body` and cleans up after
 * itself, so it never touches React state or triggers a re-render.
 * Skips entirely under `prefers-reduced-motion`.
 */
export function useConfetti() {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const busy = useRef(false);

  return useCallback(
    (originX?: number, originY?: number, count = 24) => {
      if (reduce || busy.current) return;
      busy.current = true;
      const x = originX ?? window.innerWidth / 2;
      const y = originY ?? window.innerHeight / 3;
      const pieces: HTMLElement[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.random() - 0.5) * 340;
        const distance = 90 + Math.random() * 140;
        const el = document.createElement("span");
        el.className = "confetti-piece";
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        el.style.borderRadius = i % 3 === 0 ? "9999px" : "3px";
        el.style.setProperty("--x1", `${Math.cos((angle * Math.PI) / 180) * distance}px`);
        el.style.setProperty("--fall", `${260 + Math.random() * 260}px`);
        el.style.setProperty("--spin", `${360 + Math.random() * 540}deg`);
        el.style.setProperty("--dur", `${900 + Math.random() * 700}ms`);
        document.body.appendChild(el);
        pieces.push(el);
      }

      window.setTimeout(() => {
        pieces.forEach((el) => el.remove());
        busy.current = false;
      }, 1700);
    },
    [reduce],
  );
}

/** Simple count-up/count-down timer in seconds. `running` starts/stops it. */
export function useTimer(running: boolean, direction: "up" | "down" = "up", start = 0) {
  const [seconds, setSeconds] = useState(start);
  useInterval(
    () => setSeconds((s) => (direction === "up" ? s + 1 : Math.max(0, s - 1))),
    1000,
    running,
  );
  const reset = useCallback(() => setSeconds(start), [start]);
  return { seconds, reset };
}

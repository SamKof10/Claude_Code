"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

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

/** True only where hover and a fine pointer exist. */
export function useHasPointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** Pointer position relative to an element, normalised to -0.5…0.5. */
export function usePointerParallax<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        setOffset({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      });
    };
    const onLeave = () => setOffset({ x: 0, y: 0 });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  return { ref, offset };
}

/** Magnetic pull towards the cursor. */
export function useMagnetic<T extends HTMLElement>(strength = 0.2, enabled = true) {
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
        const r = el.getBoundingClientRect();
        setOffset({
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
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

/** Locks body scroll while `locked`, preserving position. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const y = window.scrollY;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflowY: body.style.overflowY };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.overflowY = "scroll";
    return () => {
      Object.assign(body.style, prev);
      window.scrollTo(0, y);
    };
  }, [locked]);
}

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

export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

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

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    const previous = document.activeElement as HTMLElement | null;
    const sel =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const timer = setTimeout(() => container.querySelector<HTMLElement>(sel)?.focus(), 60);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(sel)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      container.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [active]);
  return ref;
}

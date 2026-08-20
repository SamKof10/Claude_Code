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

/** True only where hover + a fine pointer exist — gates magnetic/parallax work. */
export function useHasPointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * Pointer position relative to an element, normalised to -0.5…0.5 on both
 * axes. rAF-throttled and only attached when a fine pointer is present, so
 * touch devices pay nothing.
 */
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
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        setOffset({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
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

/** Tracks which section id is currently in view, for nav highlighting. */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
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

/** Keeps focus inside a container while it is open. */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusFirst = () => {
      const first = container.querySelector<HTMLElement>(selector);
      first?.focus();
    };
    const timer = setTimeout(focusFirst, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null,
      );
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
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}

/** Magnetic pull towards the cursor. Returns a transform-ready offset. */
export function useMagnetic<T extends HTMLElement>(strength = 0.28, enabled = true) {
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

/**
 * Watches whether the sticky header band currently sits over a section
 * marked `data-nav-theme="dark"`, so the header can invert instead of
 * laying a pale slab over dark artwork.
 */
export function useNavOverDark(bandHeight = 72): boolean {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    let frame: number | null = null;

    const measure = () => {
      frame = null;
      const sections = document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]');
      let hit = false;
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        // The band is the top `bandHeight` px of the viewport.
        if (r.top < bandHeight && r.bottom > 0) {
          hit = true;
          break;
        }
      }
      setOverDark((prev) => (prev === hit ? prev : hit));
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [bandHeight]);

  return overDark;
}

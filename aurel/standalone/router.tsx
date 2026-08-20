"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Hash router for the standalone single-file build.
 *
 * A route lives in the hash and always starts with a slash (`#/produkt`).
 * A hash that does *not* start with a slash (`#faq`) is a plain in-page
 * anchor and must not be mistaken for a route — several CTAs use those.
 */
export interface Route {
  path: string;
  query: string;
}

interface RouterValue {
  route: Route;
  navigate: (href: string) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

const HOME: Route = { path: "/", query: "" };

function splitHref(href: string) {
  const [pathAndQuery, hash = ""] = href.split("#");
  const [path, query = ""] = pathAndQuery.split("?");
  return { path, query, hash };
}

function serialize(route: Route, hash: string) {
  const q = route.query ? `?${route.query}` : "";
  const h = hash ? `#${hash}` : "";
  return `#${route.path}${q}${h}`;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(HOME);

  // Read the hash on load and on every change. Anchors leave the route alone.
  useEffect(() => {
    const apply = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw.startsWith("/")) {
        if (raw) scrollToId(raw);
        return;
      }
      const { path, query, hash } = splitHref(raw);
      setRoute({ path: path || "/", query });
      window.requestAnimationFrame(() => {
        if (hash) scrollToId(hash);
        else window.scrollTo({ top: 0, behavior: "auto" });
      });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const navigate = useCallback((href: string) => {
    if (href.startsWith("#")) {
      scrollToId(href.slice(1));
      return;
    }
    const { path, query, hash } = splitHref(href);
    const next: Route = { path: path || "/", query };
    const target = serialize(next, hash);
    if (window.location.hash === target) {
      // Same target — the hashchange event will not fire, so act directly.
      if (hash) scrollToId(hash);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = target;
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRoute(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRoute must be used inside <RouterProvider>");
  return ctx;
}

"use client";

import * as React from "react";

/**
 * One 250ms clock shared by every subscriber.
 *
 * The value is cached rather than read per call because useSyncExternalStore
 * requires a snapshot that is stable within a render — returning Date.now()
 * directly would make React re-render forever.
 */
let current = Date.now();
const listeners = new Set<() => void>();
let handle: number | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (handle === null) {
    // Refresh immediately: the cached value may be minutes stale if nothing
    // has been subscribed since the module loaded.
    current = Date.now();
    handle = window.setInterval(() => {
      current = Date.now();
      for (const l of listeners) l();
    }, 250);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && handle !== null) {
      window.clearInterval(handle);
      handle = null;
    }
  };
}

function getSnapshot(): number {
  return current;
}

function getServerSnapshot(): number {
  // The server has no clock the client can agree with, so anything time-based
  // renders its idle state until hydration.
  return 0;
}

/** Current epoch ms, updated four times a second while something is watching. */
export function useNow(): number {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

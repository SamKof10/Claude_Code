"use client";

import * as React from "react";
import { useStudyStore } from "@/lib/store";

/** Kicks off localStorage rehydration once, client-side only (persist uses skipHydration to stay SSR-safe). */
export function StoreHydrator() {
  React.useEffect(() => {
    void useStudyStore.persist.rehydrate();
  }, []);
  return null;
}

"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useFocusStore } from "@/lib/store/focus";

/**
 * Restores the signed-in account once, client-side only. Restoring is also what
 * loads that account's data, so nothing reads localStorage during SSR.
 */
export function AuthBootstrap() {
  React.useEffect(() => {
    void useFocusStore.persist.rehydrate();
    void useAuthStore.getState().restore();
  }, []);
  return null;
}

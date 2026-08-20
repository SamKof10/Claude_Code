"use client";

import { useRoute } from "../router";

/** Stand-ins for the two next/navigation hooks the components use. */
export function usePathname(): string {
  return useRoute().route.path;
}

export function useRouter() {
  const { navigate } = useRoute();
  return {
    push: navigate,
    replace: navigate,
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(useRoute().route.query);
}

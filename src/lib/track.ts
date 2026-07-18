import { useConvexMutation } from "@convex-dev/react-query";
import { useCallback } from "react";
import { api } from "../../convex/_generated/api";

/**
 * Fire-and-forget first-party funnel event. No-ops without Convex so
 * the landing keeps working unconfigured; errors are swallowed —
 * analytics must never break the page.
 */
export function useTrack() {
  const convexAvailable = Boolean(import.meta.env.VITE_CONVEX_URL);
  const track = useConvexMutation(api.events.track);
  return useCallback(
    (name: "visit" | "form_start", payload?: Record<string, string>) => {
      if (!convexAvailable) {
        return;
      }
      track({ name, payload }).catch(() => {
        // analytics only — never surface
      });
    },
    [convexAvailable, track]
  );
}

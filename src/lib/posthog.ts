import posthog from "posthog-js";

let initialized = false;

/**
 * PostHog degrades gracefully: without VITE_POSTHOG_KEY every call is a
 * no-op, so the template works with zero analytics config.
 */
function ensureInit(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (initialized) {
    return true;
  }
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) {
    return false;
  }
  const host =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
    "https://eu.i.posthog.com";
  posthog.init(key, { api_host: host });
  initialized = true;
  return true;
}

export function capture(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (ensureInit()) {
    posthog.capture(event, properties);
  }
}

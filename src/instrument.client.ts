import { init } from "@sentry/tanstackstart-react";

/**
 * Client-side Sentry. Graceful no-op: without VITE_SENTRY_DSN nothing
 * initializes and the SDK stays dormant. Errors only — enable tracing
 * or replay here when an idea graduates past validation.
 */
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (dsn) {
  init({ dsn });
}

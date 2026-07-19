import { init } from "@sentry/tanstackstart-react";

/**
 * Server-side Sentry. Graceful no-op without SENTRY_DSN. Imported at
 * the top of src/server.ts (the no---import-flag setup, required on
 * serverless platforms like Vercel).
 */
if (process.env.SENTRY_DSN) {
  init({ dsn: process.env.SENTRY_DSN });
}

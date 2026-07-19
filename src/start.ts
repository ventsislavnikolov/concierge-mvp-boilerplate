import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";
import { createStart } from "@tanstack/react-start";

/**
 * Sentry's global middlewares capture server-request and server-function
 * errors. Safe no-ops while the SDK is uninitialized (no SENTRY_DSN).
 */
export const startInstance = createStart(() => ({
  functionMiddleware: [sentryGlobalFunctionMiddleware],
  requestMiddleware: [sentryGlobalRequestMiddleware],
}));

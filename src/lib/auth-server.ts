import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

/**
 * Server-side auth helpers. Degrades gracefully: without the Convex
 * URLs the proxy answers 503 and there is never a session token, so
 * the landing keeps working and /admin + /app simply stay locked.
 */
function createAuthServer() {
  const convexUrl = process.env.VITE_CONVEX_URL;
  const convexSiteUrl = process.env.VITE_CONVEX_SITE_URL;
  if (!(convexUrl && convexSiteUrl)) {
    return {
      getToken: () => Promise.resolve(undefined),
      handler: () =>
        Promise.resolve(
          new Response("Auth is not configured", { status: 503 })
        ),
    };
  }
  return convexBetterAuthReactStart({ convexSiteUrl, convexUrl });
}

export const { getToken, handler } = createAuthServer();

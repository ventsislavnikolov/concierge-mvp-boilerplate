import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { deLocalizeUrl, localizeUrl } from "@/paraglide/runtime";
import { routeTree } from "./routeTree.gen";

// Localized URLs (/en/…, /el/…) map onto the unprefixed route tree.
const rewrite = {
  input: ({ url }: { url: URL }) => deLocalizeUrl(url),
  output: ({ url }: { url: URL }) => localizeUrl(url),
};

export function getRouter() {
  // Absent env degrades gracefully: the landing renders, Convex-backed
  // features are simply offline until VITE_CONVEX_URL is provided.
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

  if (!convexUrl) {
    const queryClient = new QueryClient();
    const router = createRouter({
      context: { queryClient },
      rewrite,
      routeTree,
      scrollRestoration: true,
    });
    setupRouterSsrQueryIntegration({ queryClient, router });
    return router;
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl, {
    unsavedChangesWarning: false,
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: convexQueryClient.queryFn(),
        queryKeyHashFn: convexQueryClient.hashFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  // The Convex provider lives in __root, where ConvexBetterAuthProvider
  // wraps the tree whenever a ConvexQueryClient is in router context.
  const router = createRouter({
    context: { convexQueryClient, queryClient },
    rewrite,
    routeTree,
    scrollRestoration: true,
  });
  setupRouterSsrQueryIntegration({ queryClient, router });
  return router;
}

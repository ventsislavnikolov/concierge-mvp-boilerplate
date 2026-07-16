import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexProvider } from "convex/react";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // Absent env degrades gracefully: the landing renders, Convex-backed
  // features are simply offline until VITE_CONVEX_URL is provided.
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

  if (!convexUrl) {
    const queryClient = new QueryClient();
    const router = createRouter({
      context: { queryClient },
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

  const router = createRouter({
    context: { queryClient },
    routeTree,
    scrollRestoration: true,
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  });
  setupRouterSsrQueryIntegration({ queryClient, router });
  return router;
}

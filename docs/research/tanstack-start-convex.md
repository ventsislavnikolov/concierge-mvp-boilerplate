# Research: TanStack Start ↔ Convex integration

Resolves wayfinder ticket #2. Verified against official Convex docs on 2026-07-16.

## TL;DR

- Convex integrates through **TanStack Query**: four packages — `convex`, `@convex-dev/react-query`, `@tanstack/react-query`, `@tanstack/react-router-ssr-query`.
- The whole wiring lives in **`src/router.tsx`**: `ConvexReactClient` + `ConvexQueryClient` → `QueryClient` whose default `queryKeyHashFn`/`queryFn` are Convex's → router `context: { queryClient }` + `Wrap` with `ConvexProvider` → `setupRouterSsrQueryIntegration({ router, queryClient })`.
- **`useSuspenseQuery(convexQuery(api.x.y, args))`** SSRs the result, then the browser client **resumes the live subscription where SSR left off** — no loading flash, live updates for free (our realtime example #10 is nearly free).
- Convex sends one **logical timestamp** for all SSR queries, so server-rendered views are consistent.
- `npx convex dev` bootstraps the project: creates `convex/`, provisions the dev deployment, keeps functions synced. Env: `VITE_CONVEX_URL` (+ `CONVEX_DEPLOYMENT` written by the CLI).

## Canonical `src/router.tsx`

```tsx
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
  if (!CONVEX_URL) throw new Error("missing VITE_CONVEX_URL");
  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  });
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  });
  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}
```

`src/routes/__root.tsx` becomes `createRootRouteWithContext<{ queryClient: QueryClient }>()(…)`.

## Usage patterns

- **Component-local (default):** `const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}))` — SSR + live.
- **Loader-based (faster nav):** `loader: ({ context }) => context.queryClient.ensureQueryData(convexQuery(...))` to block, or `prefetchQuery` to warm without blocking. Loaders prefetch on link hover.
- Convex React hooks (`usePaginatedQuery`, `useMutation`) work alongside — same client, same consistent results.

## Notes for the schema ticket (#8)

1. Bootstrap order: `npx convex dev` first (interactive GitHub login + project creation — a **human step** the first time), then schema in `convex/schema.ts`, functions per file (`api.<file>.<export>`).
2. Zod validation: pair `convex` values with shared Zod schemas per the spec; Convex has its own validators (`v.*`) for schema/args — use those at the schema/function boundary, Zod at the form boundary.
3. Convex docs flag TanStack Start as **Release Candidate** — matches our pinned-versions posture.
4. `npm create convex@latest -- -t tanstack-start` exists for greenfield; we wire manually into the existing scaffold instead.

## Sources

- [Convex: TanStack Start Quickstart](https://docs.convex.dev/quickstart/tanstack-start) (raw: `get-convex/convex-backend` `npm-packages/docs/docs/quickstart/tanstack-start.mdx`)
- [Convex: TanStack Start client docs](https://docs.convex.dev/client/tanstack/tanstack-start) (raw: `.../client/tanstack/tanstack-start/index.mdx`)
- Official demo: `npm-packages/private-demos/tanstack-start` (router wiring verified against source)

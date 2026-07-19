import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"; // module:auth
import type { ConvexQueryClient } from "@convex-dev/react-query"; // module:auth
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start"; // module:auth
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client"; // module:auth
import { getToken } from "@/lib/auth-server"; // module:auth
import { getLocale } from "@/paraglide/runtime";
import { siteConfig } from "@/site.config";
import appCss from "@/styles.css?url";

// module:auth
const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  const token = await getToken();
  return token ?? null;
});
// end-module:auth

export const Route = createRootRouteWithContext<{
  convexQueryClient?: ConvexQueryClient; // module:auth
  queryClient: QueryClient;
}>()({
  // module:auth
  beforeLoad: async ({ context }) => {
    if (!context.convexQueryClient) {
      return { isAuthenticated: false, token: null };
    }
    const token = await getAuth();
    if (token) {
      // During SSR only (the only time serverHttpClient exists),
      // authenticate the HTTP client used for loader queries.
      context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return { isAuthenticated: Boolean(token), token };
  },
  // end-module:auth
  component: RootComponent,
  head: () => ({
    links: [{ href: appCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: siteConfig.meta.title() },
      { content: siteConfig.meta.description(), name: "description" },
    ],
  }),
});

function RootComponent() {
  const content = (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
  // module:auth
  const { convexQueryClient, token } = Route.useRouteContext();
  if (convexQueryClient) {
    return (
      <ConvexBetterAuthProvider
        authClient={authClient}
        client={convexQueryClient.convexClient}
        initialToken={token ?? undefined}
      >
        {content}
      </ConvexBetterAuthProvider>
    );
  }
  // end-module:auth
  return content;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { getToken } from "@/lib/auth-server";
import { getLocale } from "@/paraglide/runtime";
import { siteConfig } from "@/site.config";
import appCss from "@/styles.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  const token = await getToken();
  return token ?? null;
});

export const Route = createRootRouteWithContext<{
  convexQueryClient?: ConvexQueryClient;
  queryClient: QueryClient;
}>()({
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
  const { convexQueryClient, token } = Route.useRouteContext();
  const content = (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
  if (!convexQueryClient) {
    return content;
  }
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

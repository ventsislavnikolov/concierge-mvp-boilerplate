import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@/lib/auth-server";

/** Proxies auth requests to the Better Auth routes on the Convex deployment. */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});

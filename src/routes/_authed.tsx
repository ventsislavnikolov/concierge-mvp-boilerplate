import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * Pathless layout: everything nested under it requires a session.
 * The route guard is UX only — Convex functions behind it enforce
 * their own auth (e.g. leads.list throws when unauthenticated).
 */
export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        search: { redirect: location.href },
        to: "/sign-in",
      });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return <Outlet />;
}

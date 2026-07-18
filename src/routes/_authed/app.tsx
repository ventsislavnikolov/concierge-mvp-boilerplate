import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/auth/dashboard-shell";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_authed/app")({
  component: AppPage,
});

function AppPage() {
  return <DashboardShell title={m.auth_app_title()} />;
}

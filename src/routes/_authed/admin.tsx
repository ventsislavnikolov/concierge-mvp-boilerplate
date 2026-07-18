import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/auth/dashboard-shell";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_authed/admin")({
  component: AdminPage,
});

function AdminPage() {
  return <DashboardShell title={m.auth_admin_title()} />;
}

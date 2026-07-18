import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "convex/react";
import { DashboardShell } from "@/components/auth/dashboard-shell";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { siteConfig } from "@/site.config";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/_authed/admin")({
  component: AdminPage,
});

function AdminPage() {
  return (
    <DashboardShell title={m.auth_admin_title()}>
      {/* Queries wait for Convex to validate the session token —
          Better Auth reports signed-in before Convex does. */}
      <Authenticated>
        <div className="flex flex-col gap-8">
          <Funnel />
          <QuizSummary />
          <LeadsTable />
        </div>
      </Authenticated>
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-bold text-2xl tabular-nums">{value}</span>
    </div>
  );
}

function Funnel() {
  const { data } = useQuery(convexQuery(api.events.funnel, {}));
  if (!data) {
    return <p className="text-muted-foreground">{m.admin_loading()}</p>;
  }
  const joinRate =
    data.visits > 0 ? `${((data.joins / data.visits) * 100).toFixed(1)}%` : "—";
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">{m.admin_funnel_title()}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={m.admin_visits()} value={String(data.visits)} />
        <StatCard
          label={m.admin_form_starts()}
          value={String(data.formStarts)}
        />
        <StatCard label={m.admin_joins()} value={String(data.joins)} />
        <StatCard label={m.admin_join_rate()} value={joinRate} />
      </div>
    </section>
  );
}

function QuizSummary() {
  const { data } = useQuery(convexQuery(api.quiz.summary, {}));
  if (!data) {
    return <p className="text-muted-foreground">{m.admin_loading()}</p>;
  }
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">
        {m.admin_quiz_title()}{" "}
        <span className="font-normal text-muted-foreground text-sm">
          {m.admin_quiz_total()}: {data.total}
        </span>
      </h2>
      {siteConfig.quiz.questions.map((question) => {
        const answers = data.counts[question.id] ?? {};
        const max = Math.max(1, ...Object.values(answers));
        return (
          <div
            className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3"
            key={question.id}
          >
            <h3 className="font-medium">{question.question()}</h3>
            {question.options.map((option) => {
              const count = answers[option.id] ?? 0;
              return (
                <div className="flex items-center gap-2" key={option.id}>
                  <span className="w-1/2 truncate text-sm">
                    {option.label()}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

function LeadsTable() {
  const { data } = useQuery(convexQuery(api.leads.list, {}));
  if (!data) {
    return <p className="text-muted-foreground">{m.admin_loading()}</p>;
  }
  if (data.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">{m.admin_leads_title()}</h2>
        <p className="text-muted-foreground">{m.admin_leads_empty()}</p>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">
        {m.admin_leads_title()}{" "}
        <span className="font-normal text-muted-foreground text-sm">
          ({data.length})
        </span>
      </h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">{m.admin_col_email()}</th>
              <th className="px-3 py-2 font-medium">{m.admin_col_phone()}</th>
              <th className="px-3 py-2 font-medium">{m.admin_col_locale()}</th>
              <th className="px-3 py-2 font-medium">{m.admin_col_source()}</th>
              <th className="px-3 py-2 font-medium">{m.admin_col_date()}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lead) => (
              <tr className="border-t" key={lead._id}>
                <td className="px-3 py-2">{lead.email}</td>
                <td className="px-3 py-2">{lead.phone ?? "—"}</td>
                <td className="px-3 py-2">{lead.locale ?? "—"}</td>
                <td className="px-3 py-2">{lead.source ?? "—"}</td>
                <td className="px-3 py-2">
                  {new Date(lead._creationTime).toLocaleDateString(getLocale())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

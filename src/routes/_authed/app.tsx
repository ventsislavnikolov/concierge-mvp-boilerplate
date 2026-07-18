import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "convex/react";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { DashboardShell } from "@/components/auth/dashboard-shell";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/app")({
  component: AppPage,
});

function AppPage() {
  return (
    <DashboardShell title={m.auth_app_title()}>
      <Authenticated>
        <LiveList />
      </Authenticated>
    </DashboardShell>
  );
}

function ItemRow({
  item,
  onRemove,
}: {
  item: Doc<"demoItems">;
  onRemove: (id: Id<"demoItems">) => void;
}) {
  const handleRemove = useCallback(
    () => onRemove(item._id),
    [item._id, onRemove]
  );
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-2">
      <span className="truncate">{item.text}</span>
      <Button onClick={handleRemove} size="sm" variant="ghost">
        {m.app_list_remove()}
      </Button>
    </li>
  );
}

/**
 * The realtime pattern end-to-end: the useQuery(convexQuery(…)) below
 * is a live subscription — a mutation from any client (or another tab)
 * re-renders this list instantly. Copy for real product lists.
 */
function LiveList() {
  const { data } = useQuery(convexQuery(api.demo.list, {}));
  const add = useConvexMutation(api.demo.add);
  const remove = useConvexMutation(api.demo.remove);
  const [text, setText] = useState("");

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setText(event.target.value),
    []
  );

  const handleAdd = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!text.trim()) {
        return;
      }
      add({ text });
      setText("");
    },
    [add, text]
  );

  const handleRemove = useCallback(
    (id: Id<"demoItems">) => {
      remove({ id });
    },
    [remove]
  );

  return (
    <section className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-lg">{m.app_list_title()}</h2>
        <p className="text-muted-foreground text-sm">{m.app_list_hint()}</p>
      </div>
      <form className="flex gap-2" onSubmit={handleAdd}>
        <input
          className="h-11 flex-1 rounded-lg border bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          name="item"
          onChange={handleTextChange}
          placeholder={m.app_list_placeholder()}
          value={text}
        />
        <Button size="lg" type="submit">
          {m.app_list_add()}
        </Button>
      </form>
      {data && data.length === 0 ? (
        <p className="text-muted-foreground">{m.app_list_empty()}</p>
      ) : null}
      <ul className="flex flex-col gap-2" data-testid="live-list">
        {(data ?? []).map((item) => (
          <ItemRow item={item} key={item._id} onRemove={handleRemove} />
        ))}
      </ul>
    </section>
  );
}

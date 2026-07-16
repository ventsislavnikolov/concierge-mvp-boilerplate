import { useConvexMutation } from "@convex-dev/react-query";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/posthog";
import { leadSchema } from "@/lib/validation";
import { siteConfig } from "@/site.config";
import { api } from "../../../convex/_generated/api";

type Phase = "idle" | "joined" | "already";

const INPUT_CLASS =
  "h-11 rounded-lg border bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function LeadInput({
  field,
  ...inputProps
}: {
  field: {
    name: string;
    state: { value: string };
    handleChange: (value: string) => void;
  };
} & Pick<
  React.ComponentProps<"input">,
  "autoComplete" | "inputMode" | "placeholder"
>) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      field.handleChange(event.target.value),
    [field]
  );
  return (
    <input
      className={INPUT_CLASS}
      name={field.name}
      onChange={handleChange}
      value={field.state.value}
      {...inputProps}
    />
  );
}

/**
 * The fake-door conversion point: email (+ optional phone) → Convex
 * lead → `waitlist_joined` PostHog event → welcome email. Falls back
 * to a mailto link when Convex is not configured.
 */
export function WaitlistForm({ cta }: { cta: { label: string } }) {
  const convexAvailable = Boolean(import.meta.env.VITE_CONVEX_URL);
  const [phase, setPhase] = useState<Phase>("idle");
  const join = useMutation({
    mutationFn: useConvexMutation(api.leads.join),
  });

  const form = useForm({
    defaultValues: { email: "", phone: "" },
    onSubmit: async ({ value }) => {
      const parsed = leadSchema.parse(value);
      const result = await join.mutateAsync({
        brandName: siteConfig.brand.name,
        email: parsed.email,
        locale: siteConfig.meta.lang,
        phone: parsed.phone,
        source: "landing",
        tagline: siteConfig.brand.tagline,
      });
      capture("waitlist_joined", { alreadyJoined: result.alreadyJoined });
      setPhase(result.alreadyJoined ? "already" : "joined");
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.handleSubmit();
    },
    [form]
  );

  if (!convexAvailable) {
    return (
      <Button asChild size="lg">
        <a
          href={`mailto:?subject=${encodeURIComponent(siteConfig.brand.name)}`}
        >
          {cta.label}
        </a>
      </Button>
    );
  }

  if (phase !== "idle") {
    return (
      <p className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
        {phase === "joined"
          ? "Готово — ще ти пишем, когато отворим достъпа. ✅"
          : "Вече си в списъка — ще се чуем скоро. ✅"}
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3"
      onSubmit={handleSubmit}
    >
      <form.Field
        name="email"
        validators={{
          onSubmit: ({ value }) =>
            leadSchema.shape.email.safeParse(value).success
              ? undefined
              : "Въведи валиден имейл.",
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1 text-left">
            <LeadInput
              autoComplete="email"
              field={field}
              inputMode="email"
              placeholder="имейл адрес"
            />
            {field.state.meta.errors[0] ? (
              <span className="text-destructive text-sm">
                {String(field.state.meta.errors[0])}
              </span>
            ) : null}
          </div>
        )}
      </form.Field>
      <form.Field name="phone">
        {(field) => (
          <LeadInput
            autoComplete="tel"
            field={field}
            inputMode="tel"
            placeholder="телефон (по желание)"
          />
        )}
      </form.Field>
      <Button disabled={join.isPending} size="lg" type="submit">
        {join.isPending ? "Записваме те…" : cta.label}
      </Button>
      {join.isError ? (
        <p className="text-destructive text-sm">
          Нещо се обърка — опитай пак след малко.
        </p>
      ) : null}
    </form>
  );
}

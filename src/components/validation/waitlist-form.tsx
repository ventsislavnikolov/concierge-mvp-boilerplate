import { useConvexMutation } from "@convex-dev/react-query";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/components/validation/quiz";
import { capture } from "@/lib/posthog";
import { useTrack } from "@/lib/track";
import { leadSchema } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { siteConfig } from "@/site.config";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
  "autoComplete" | "inputMode" | "onFocus" | "placeholder"
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
export function WaitlistForm({ cta }: { cta: { label: () => string } }) {
  const convexAvailable = Boolean(import.meta.env.VITE_CONVEX_URL);
  const [phase, setPhase] = useState<Phase>("idle");
  const [leadId, setLeadId] = useState<Id<"leads"> | null>(null);
  const track = useTrack();
  const formStarted = useRef(false);
  const join = useMutation({
    mutationFn: useConvexMutation(api.leads.join),
  });

  const handleEmailFocus = useCallback(() => {
    if (formStarted.current) {
      return;
    }
    formStarted.current = true;
    track("form_start");
    capture("form_started");
  }, [track]);

  const form = useForm({
    defaultValues: { email: "", phone: "" },
    onSubmit: async ({ value }) => {
      const parsed = leadSchema.parse(value);
      const result = await join.mutateAsync({
        brandName: siteConfig.brand.name(),
        email: parsed.email,
        locale: getLocale(),
        phone: parsed.phone,
        source: "landing",
        tagline: siteConfig.brand.tagline(),
      });
      capture("waitlist_joined", { alreadyJoined: result.alreadyJoined });
      setLeadId(result.leadId);
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
          href={`mailto:?subject=${encodeURIComponent(siteConfig.brand.name())}`}
        >
          {cta.label()}
        </a>
      </Button>
    );
  }

  if (phase !== "idle") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <p className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
          {phase === "joined"
            ? m.form_success_joined()
            : m.form_success_already()}
        </p>
        {leadId ? <Quiz leadId={leadId} /> : null}
      </div>
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
              : m.form_email_invalid(),
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1 text-left">
            <LeadInput
              autoComplete="email"
              field={field}
              inputMode="email"
              onFocus={handleEmailFocus}
              placeholder={m.form_email_placeholder()}
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
            placeholder={m.form_phone_placeholder()}
          />
        )}
      </form.Field>
      <Button disabled={join.isPending} size="lg" type="submit">
        {join.isPending ? m.form_submitting() : cta.label()}
      </Button>
      {join.isError ? (
        <p className="text-destructive text-sm">{m.form_error()}</p>
      ) : null}
    </form>
  );
}

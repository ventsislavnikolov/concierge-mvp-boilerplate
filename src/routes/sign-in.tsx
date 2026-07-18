import { useConvexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
});

function SignInPage() {
  const { redirect } = Route.useSearch();
  const convexAvailable = Boolean(import.meta.env.VITE_CONVEX_URL);
  const providers = useConvexQuery(
    api.auth.providers,
    convexAvailable ? {} : "skip"
  );
  const callbackURL = redirect ?? "/app";
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value),
    []
  );

  const handleMagicLink = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPhase("sending");
      const { error } = await authClient.signIn.magicLink({
        callbackURL,
        email,
      });
      setPhase(error ? "error" : "sent");
    },
    [callbackURL, email]
  );

  const handleGoogle = useCallback(() => {
    authClient.signIn.social({ callbackURL, provider: "google" });
  }, [callbackURL]);

  if (!convexAvailable) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4">
        <p className="text-muted-foreground">{m.auth_error()}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4">
      <div className="flex w-full max-w-sm flex-col gap-2 text-center">
        <h1 className="font-bold text-2xl">{m.auth_signin_title()}</h1>
        <p className="text-muted-foreground">{m.auth_signin_subtitle()}</p>
      </div>
      {phase === "sent" ? (
        <p className="w-full max-w-sm rounded-lg border bg-card px-4 py-3 text-card-foreground">
          {m.auth_magic_sent()}
        </p>
      ) : (
        <form
          className="flex w-full max-w-sm flex-col gap-3"
          onSubmit={handleMagicLink}
        >
          <input
            autoComplete="email"
            className="h-11 rounded-lg border bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            inputMode="email"
            name="email"
            onChange={handleEmailChange}
            placeholder={m.form_email_placeholder()}
            required
            type="email"
            value={email}
          />
          <Button disabled={phase === "sending"} size="lg" type="submit">
            {phase === "sending" ? m.form_submitting() : m.auth_magic_button()}
          </Button>
          {phase === "error" ? (
            <p className="text-destructive text-sm">{m.auth_error()}</p>
          ) : null}
        </form>
      )}
      {providers?.google ? (
        <Button onClick={handleGoogle} size="lg" variant="outline">
          {m.auth_google_button()}
        </Button>
      ) : null}
    </main>
  );
}

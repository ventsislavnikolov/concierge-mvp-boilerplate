import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

const getServerGreeting = createServerFn({ method: "GET" }).handler(
  () => `Hello from the server at ${new Date().toISOString()}`
);

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getServerGreeting(),
});

function Home() {
  const router = useRouter();
  const greeting = Route.useLoaderData();
  const refresh = useCallback(() => router.invalidate(), [router]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="font-semibold text-2xl">concierge-mvp-boilerplate</h1>
      <p className="text-muted-foreground">{greeting}</p>
      <Button onClick={refresh}>Refresh greeting</Button>
    </main>
  );
}

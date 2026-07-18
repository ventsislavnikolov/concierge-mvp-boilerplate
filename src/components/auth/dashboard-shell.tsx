import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";

/** Empty dashboard shell for /admin and /app — filled in by later tickets. */
export function DashboardShell({ title }: { title: string }) {
  const handleSignOut = useCallback(() => {
    authClient.signOut({
      fetchOptions: {
        // Full navigation resets the Convex client's auth state cleanly.
        onSuccess: () => window.location.assign("/"),
      },
    });
  }, []);

  return (
    <main className="flex min-h-svh flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{title}</h1>
        <Button onClick={handleSignOut} variant="outline">
          {m.auth_signout()}
        </Button>
      </header>
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-muted-foreground">
        {m.auth_shell_empty()}
      </p>
    </main>
  );
}

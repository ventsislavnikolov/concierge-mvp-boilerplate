import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SectionRenderer } from "@/components/validation/sections";
import { useTrack } from "@/lib/track";
import { getLocale } from "@/paraglide/runtime";
import { siteConfig } from "@/site.config";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="min-h-svh">
      {/* Convex hooks (useTrack) only mount under the ConvexProvider,
          i.e. when VITE_CONVEX_URL is set. The landing renders regardless. */}
      {import.meta.env.VITE_CONVEX_URL ? <VisitTracker /> : null}
      <SectionRenderer sections={siteConfig.sections} />
    </main>
  );
}

function VisitTracker() {
  const track = useTrack();
  useEffect(() => {
    track("visit", { locale: getLocale() });
  }, [track]);
  return null;
}

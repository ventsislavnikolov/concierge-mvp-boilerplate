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
  const track = useTrack();

  useEffect(() => {
    track("visit", { locale: getLocale() });
  }, [track]);

  return (
    <main className="min-h-svh">
      <SectionRenderer sections={siteConfig.sections} />
    </main>
  );
}

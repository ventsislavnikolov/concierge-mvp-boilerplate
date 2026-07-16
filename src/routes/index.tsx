import { createFileRoute } from "@tanstack/react-router";
import { SectionRenderer } from "@/components/validation/sections";
import { siteConfig } from "@/site.config";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="min-h-svh">
      <SectionRenderer sections={siteConfig.sections} />
    </main>
  );
}

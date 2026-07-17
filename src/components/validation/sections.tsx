import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/validation/waitlist-form";
import type {
  CtaSection,
  HeroSection,
  PainSection,
  Section,
  SolutionSection,
} from "@/site.config";

function Hero({ section }: { section: HeroSection }) {
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
      <h1 className="max-w-2xl text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
        {section.headline()}
      </h1>
      <p className="max-w-xl text-balance text-lg text-muted-foreground">
        {section.subline()}
      </p>
      <Button asChild size="lg">
        <a href={section.cta.href}>{section.cta.label()}</a>
      </Button>
    </section>
  );
}

function Pain({ section }: { section: PainSection }) {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-14">
      <h2 className="mb-6 font-semibold text-2xl tracking-tight">
        {section.title()}
      </h2>
      <ul className="flex flex-col gap-3">
        {section.points.map((point) => (
          <li
            className="rounded-lg border bg-card px-4 py-3 text-card-foreground"
            key={point()}
          >
            {point()}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Solution({ section }: { section: SolutionSection }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-14">
      <h2 className="mb-8 text-center font-semibold text-2xl tracking-tight">
        {section.title()}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {section.features.map((feature) => (
          <div
            className="flex flex-col gap-2 rounded-lg border bg-card p-5 text-card-foreground"
            key={feature.title()}
          >
            <h3 className="font-medium">{feature.title()}</h3>
            <p className="text-muted-foreground text-sm">
              {feature.description()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta({ section }: { section: CtaSection }) {
  return (
    <section
      className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-20 text-center"
      id="waitlist"
    >
      <h2 className="text-balance font-semibold text-3xl tracking-tight">
        {section.title()}
      </h2>
      <p className="max-w-lg text-balance text-muted-foreground">
        {section.subtitle()}
      </p>
      <WaitlistForm cta={{ label: section.button.label }} />
      {section.disclaimer ? (
        <p className="text-muted-foreground text-xs">{section.disclaimer()}</p>
      ) : null}
    </section>
  );
}

const renderers = {
  cta: Cta,
  hero: Hero,
  pain: Pain,
  solution: Solution,
} satisfies {
  [K in Section["type"]]: (props: {
    section: Extract<Section, { type: K }>;
  }) => ReactNode;
};

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, index) => {
        // the map is exhaustive per Section["type"], so this lookup is safe
        const Renderer = renderers[section.type] as (props: {
          section: Section;
        }) => ReactNode;
        return (
          <Renderer
            // biome-ignore lint/suspicious/noArrayIndexKey: sections are a static config array with no natural id; order is stable
            key={`${section.type}-${index}`}
            section={section}
          />
        );
      })}
    </>
  );
}

# Research: Tailwind v4 + shadcn/ui on TanStack Start

Resolves wayfinder ticket #5. Verified against official docs on 2026-07-16.

## TL;DR

- **Tailwind v4 is CSS-first**: `@tailwindcss/vite` plugin + `@import "tailwindcss"` in the app CSS. No `tailwind.config.js`, no PostCSS setup — theme customization lives in CSS via `@theme`.
- **shadcn/ui supports TanStack Start natively** — three official paths; for our scaffold the CLI path is the fit: `npx shadcn@latest init -t start` (new project) or plain `init` on an existing one.
- The `@tanstack/cli create` scaffold already configures Tailwind + the `@/*` import alias; shadcn's init rides on top. **Do not pick the `shadcn` add-on inside `@tanstack/cli create`** — run shadcn's own CLI after (docs call this out explicitly).

## Canonical setup (existing project)

```bash
pnpm add tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts — alongside tanstackStart(), nitro(), viteReact()
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})
```

```css
/* src/styles.css */
@import "tailwindcss";
```

```bash
npx shadcn@latest init     # detects TanStack Start, writes components.json
npx shadcn@latest add button card …
```

Components land in `@/components/ui/*`; imports work in file routes as usual.

## Notes for the scaffold (#7)

1. **Requirements shadcn assumes**: Tailwind configured + `@/*` alias in `tsconfig.json`. Our scaffold must set both before running `shadcn init`.
2. **Companion libs** (`cva`, `clsx`, `tailwind-merge`) are installed by `shadcn init` automatically (`cn()` helper in `@/lib/utils`). `sonner`, `lucide-react` come with their components / peer installs; **Geist via fontsource** is manual (`@fontsource-variable/geist` imported in CSS or root route) — not shadcn's concern.
3. **shadcn/create presets** (visual builder → `init --preset [CODE] --template start`) could seed the boilerplate's base style once, then the repo stays on plain `add` commands.
4. Tailwind v4 dark mode / theming is CSS-first — fits our `site.config.ts` rebrand model (theme = CSS variables in one file).
5. Plugin order in `vite.config.ts` is not sensitive per docs; keeping `tailwindcss()` first is the common convention.

## Sources

- [Tailwind CSS: Install with Vite](https://tailwindcss.com/docs/installation/using-vite) (raw: `tailwindlabs/tailwindcss.com` `using-vite/page.tsx`)
- [shadcn/ui: TanStack Start installation](https://ui.shadcn.com/docs/installation/tanstack) (raw: `shadcn-ui/ui` `apps/v4/content/docs/installation/tanstack.mdx`)

# concierge-mvp-boilerplate

A cloneable **fake-door / concierge MVP-validation** boilerplate. Take a new
idea to a live, instrumented, trilingual (bg/en/el) validation landing page —
collecting real leads — in an evening. Ideas that prove out graduate to a
realtime MVP foundation (auth, admin, Convex realtime, Telegram bot) without
switching stacks.

- **Validate first**: the funnel loop and kill/build thresholds are in
  [PLAYBOOK.md](./PLAYBOOK.md).
- **Rebrand fast**: the clone-to-live procedure is in
  [NEW-IDEA.md](./NEW-IDEA.md).

## Stack

TanStack Start (Router + Query) on Nitro/Vercel · Convex (DB + realtime) ·
Better Auth (magic link + Google) · Tailwind v4 + shadcn/ui · TanStack Form +
Zod · PostHog · Resend + React Email · grammY · Paraglide i18n · Sentry ·
pnpm + Biome/Ultracite + Husky + commitlint + semantic-release · Vitest +
Playwright.

## Quickstart (10 minutes)

```sh
# 1. Clone + scaffold your idea (validation profile, bg/en/el)
git clone <this-repo> my-idea && cd my-idea
pnpm create-idea --name my-idea
pnpm install

# 2. Provision Convex (creates the project, writes .env.local)
npx convex dev --once --configure=new --project my-idea

# 3. Run it
pnpm dev            # http://localhost:3000  (also /en, /el)
```

The landing renders with **zero** backend configured — every integration
no-ops without its env, so you can see the page immediately and wire services
in as you go.

**Profiles**: `pnpm create-idea --name my-idea --profile product` keeps the
auth / admin / realtime / Telegram add-ons; the default `validation` profile
ships the fake-door core only. Single-locale: `--locales en --base en`.

## Rebrand surface

Two places, nothing else:

- **`src/site.config.ts`** — page structure (which sections, in what order;
  quiz questions).
- **`messages/{bg,en,el}.json`** — every user-facing string. Components never
  hardcode copy; they call `m.*` message functions.

## Optional integrations

Each no-ops until configured. See [`.env.example`](./.env.example) for the
full list.

| Service | Where the key lives | Absent → |
| --- | --- | --- |
| Convex | `.env.local` (`npx convex dev`) | landing renders, no lead storage |
| PostHog | `.env.local` (`VITE_POSTHOG_KEY`) | no analytics |
| Resend | Convex env (`npx convex env set RESEND_API_KEY`) | welcome email skipped |
| Better Auth | Convex env (`BETTER_AUTH_SECRET`, `SITE_URL`, Google optional) | `/admin` + `/app` locked |
| Sentry | `VITE_SENTRY_DSN` + `SENTRY_DSN` | SDK dormant |
| Telegram | Convex env (`TELEGRAM_BOT_TOKEN` …) | webhook 503, no group posts |

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` | Production build (Nitro output) |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright, 360×740, against a prod build |
| `pnpm lint` / `pnpm lint:fix` | Biome/Ultracite |
| `pnpm typecheck` | `tsc --noEmit` |

## CI

`.github/workflows/ci.yml`:

- **check** (every push/PR, no secrets): lint → typecheck → Vitest → build.
- **e2e** (when the `VITE_CONVEX_URL` secret is set): the fake-door Playwright
  smoke against that deployment. Point it at a **CI-only** Convex deployment —
  the specs write real `e2e-*` leads and funnel events.
- **release** (push to `main`): semantic-release from conventional commits.

## Deploy

`npx vercel link && npx vercel deploy --prod`, then set the same env in the
Vercel project. See [NEW-IDEA.md](./NEW-IDEA.md) §4.

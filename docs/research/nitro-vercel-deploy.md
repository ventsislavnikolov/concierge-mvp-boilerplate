# Research: TanStack Start → Vercel deploy (Nitro)

Resolves wayfinder ticket #4. Verified against official docs on 2026-07-16.

## TL;DR

- The integration moved to the **`nitro/vite` plugin** (package `nitro`, Nitro v3 line). The old vinxi/`app.config.ts` deployment story is gone — Nitro is now a Vite plugin next to `tanstackStart()`.
- **Vercel is zero-config**: it auto-detects TanStack Start + Nitro, sets build command and output itself, and compiles server code into Vercel Functions running on **Fluid compute**. The `vercel` preset is auto-selected at build time; no `vercel.json` needed.
- The plugin is **under active development** — pin exact versions and re-verify at scaffold time (ticket #7).

## Canonical setup

```bash
pnpm add nitro            # plus @tanstack/react-start, vite, @vitejs/plugin-react
```

```ts
// vite.config.ts
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact()],
})
```

```json
// package.json
{ "scripts": { "dev": "vite dev", "build": "vite build" } }
```

Deploy = connect the repo to Vercel. No build-command or output-directory overrides. An explicit `nitro({ preset: 'vercel' })` is optional (auto-detected on Vercel's build env); pass it only if deterministic local `vercel build` output matters.

## Gotchas

1. **Nitro's `/api` directory is not supported on Vercel.** Use TanStack Start's own API/server routes (file routes) or `routes/api/` in standalone Nitro. Our grammY webhook must be a Start server route, not a Nitro `/api` handler.
2. **Prerender + Nitro v3 on Vercel had a breaking bug** ([nitrojs/nitro#3905](https://github.com/nitrojs/nitro/issues/3905)). If we prerender the landing, verify it works at scaffold time; SSR fallback is safe.
3. **Node version pinning quirk** ([nitrojs/nitro#3965](https://github.com/nitrojs/nitro/issues/3965)): builds may use Node 22.x despite a 24.x project setting. Don't depend on >=24 features server-side.
4. `srvx` `FastResponse` tip is for self-hosted Node only — irrelevant on Vercel.

## Useful extras (later tickets)

- **Per-route function config**: `vercel.functionRules` in `nitro.config` (e.g. `maxDuration`/`memory` for the bot webhook route).
- **Scheduled tasks → Vercel Cron**: Nitro `scheduledTasks` auto-converts to Vercel Cron Jobs at build (secure with `CRON_SECRET`) — natural fit for match reminders later.
- **Proxy route rules** compile to CDN-level rewrites (no function invocation) when targeting external URLs with no advanced options.

## Sources

- [TanStack Start hosting guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) (raw: `TanStack/router` `docs/start/framework/react/guide/hosting.md`)
- [Nitro Vercel provider](https://nitro.build/deploy/providers/vercel) (raw: `nitrojs/nitro` `docs/2.deploy/20.providers/vercel.md`)
- [Vercel: TanStack Start framework docs](https://vercel.com/docs/frameworks/full-stack/tanstack-start), [changelog](https://vercel.com/changelog/support-for-tanstack-start)

# AGENTS.md

## What this repo is

A cloneable fake-door/concierge MVP-validation boilerplate: TanStack Start +
Convex + Tailwind v4/shadcn + PostHog + Resend + Paraglide (bg/en/el). The
validation loop per idea is documented in `PLAYBOOK.md`; the clone-and-rebrand
procedure in `NEW-IDEA.md`.

## Repo conventions

- **Stack is locked** (see the wayfinder map, issue #1). Ask before
  substituting any part of it.
- **Docs-first**: the stack is young and fast-moving — verify current official
  docs (Context7 MCP) before writing integration code; don't trust
  training-data memory for these APIs. Research summaries live in
  `docs/research/`.
- **Rebrand surface**: content changes belong in `src/site.config.ts`
  (structure) and `messages/{bg,en,el}.json` (copy) only. Never hardcode
  user-facing strings in components — always `m.*` message functions, added
  to all three locale files.
- **i18n**: `src/paraglide/` is compiler-generated (gitignored,
  biome-excluded). The server entry (`src/server.ts`) must pass the ORIGINAL
  request through `paraglideMiddleware` — de-localizing there plus the router
  rewrite causes an infinite redirect loop (see the comment in that file).
- **Env policy**: every optional integration no-ops without its env; the
  landing must always render. `RESEND_API_KEY` lives in the Convex deployment
  env (`npx convex env set`), not `.env.local`.
- **Convex**: dev deployment is `zealous-walrus-442`. Live-test mutations with
  `npx convex run` before calling a ticket done. Mutations are idempotent by
  design (dedup by email / patch per lead+question).
- **Gates**: `pnpm lint` (Biome/Ultracite — expect sort-keys,
  interface-over-type, noJsxPropsBind, noAwaitInLoops) and `pnpm typecheck`;
  Husky runs both pre-commit. Commits are conventional with **lowercase
  subjects** (commitlint rejects capitalized ones). When checking a gate in a
  shell, don't pipe — pipes mask exit codes; use `cmd >/dev/null 2>&1; echo $?`.
- **Mobile-first**: everything must be usable at 360px with no horizontal
  overflow — `pnpm test:e2e` (Playwright, 360×740, builds prod) asserts it.
  If E2E results look stale, kill the leftover server on port 3000.
- **Stacked PRs**: merge the base PR into main first and delete its branch
  before merging the stacked one — merging the stack into an already-merged
  base branch strands the commits (happened twice: PRs #34, #37).

## Working process

Defaults + escalation ladder for agent sessions: single session first, `/fork` → subagents (maker+checker) → teams → workflows only when the level below hits its ceiling. Lifecycle: small → direct; medium → `/to-spec` → `/to-tickets` → `/implement`; large & foggy → `/wayfinder`. See `docs/agents/process.md`.

## Agent skills

### Issue tracker

Issues tracked in GitHub Issues (`ventsislavnikolov/concierge-mvp-boilerplate`, via `gh`); external PRs are a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (one `CONTEXT.md` + `docs/adr/` at root). See `docs/agents/domain.md`.

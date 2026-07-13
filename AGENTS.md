# AGENTS.md

## Working process

Defaults + escalation ladder for agent sessions: single session first, `/fork` → subagents (maker+checker) → teams → workflows only when the level below hits its ceiling. Lifecycle: small → direct; medium → `/to-spec` → `/to-tickets` → `/implement`; large & foggy → `/wayfinder`. See `docs/agents/process.md`.

## Agent skills

### Issue tracker

Issues tracked in GitHub Issues (`ventsislavnikolov/concierge-mvp-boilerplate`, via `gh`); external PRs are a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (one `CONTEXT.md` + `docs/adr/` at root). See `docs/agents/domain.md`.

# Working Process

How agent sessions in this repo work: defaults first, escalation only when the current level hits its ceiling. Based on Claude Code's multi-agent capabilities and mattpocock/skills v1.1 (2026-07).

## The scale ladder — defaults

Escalate one rung only when the rung below is genuinely insufficient. ~95% of work is level 0. Stop escalating when *review* becomes the bottleneck.

| Level | Mode | Use when |
|-------|------|----------|
| 0 | Single session (+ plan mode for bigger items) | Daily work — almost everything |
| 1 | `/fork` | A side-question pops up mid-task; don't pollute the main context |
| 2 | Subagents | Clear, separable subtasks: tests, search, verification |
| 3 | Agent teams | Parts must negotiate with each other (e.g. API contract FE↔BE) |
| 4 | Dynamic workflows (`ultracode`) | Whole-codebase audits, mass migrations, cross-checked research |

## Work lifecycle (skills v1.1)

- **Small** (bugfix, tweak): just do it; `/tdd` when test-first fits.
- **Medium** (feature, refactor): `/to-spec` → `/to-tickets` → `/implement`.
- **Large & foggy**: `/wayfinder` — chart a map of tickets in the issue tracker (this repo's live map: issue #1). One ticket per session; claim before working.
- **Review**: `/code-review` for working diffs; `/review` for PRs. **Bugs**: `/diagnosing-bugs`.
- **Triage**: `/triage` — includes external PRs (see `issue-tracker.md`).

## Quality patterns

- **Maker + checker** (the most important one): for any nontrivial implementation, one agent writes, an *independent* subagent verifies against tests + linter. A model grades its own homework leniently.
- **`/goal` as the finish line**: define the stopping condition ("tests in X pass, lint clean") instead of eyeballing; a separate model checks after each move.
- **Expensive plans, cheap executes**: orchestrator (Opus) decomposes + reviews; workers (Sonnet) implement.
- **`/verify` before committing** nontrivial changes — drive the affected flow, not just typecheck.

## Loops & automation

- `/loop` for recurring babysitting (open PRs, CI). Always with clear stopping conditions + a consecutive-failure limit — a vague success criterion burns budget without progress.
- Hooks for event-driven checks (post-edit lint, pre-commit secret scan) — see `/setup-pre-commit`.
- Cron/routines for scheduled work that shouldn't depend on an open session.

## Parallelism

- Unblocked wayfinder tickets may run in **parallel sessions** — the tracker's claim (assignee) prevents collisions.
- Parallel agents touching files → **separate git worktrees**. Two agents in one file is chaos.

## Hygiene (the base under everything)

- Conventions live in `AGENTS.md` + `docs/agents/*` — read them before acting; without them an agent confidently invents commands.
- External memory over vibes: state lives in the tracker (map, tickets, decisions), not in a session's head.
- Docs-first for young integrations (see the map's Notes): verify current official docs before writing integration code.
- When offering choices, always state the recommended option and why.

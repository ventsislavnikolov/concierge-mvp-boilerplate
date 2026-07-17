# PLAYBOOK — idea → verdict in one week

This repo validates an idea with a **fake-door landing page** before any product
is built. The loop: rebrand the template, deploy, drive traffic, read the
funnel, decide. One idea per clone.

## 0. Qualify the idea (30 min, no code)

Write three sentences before touching the repo:

1. **Problem** — what recurring pain, in whose words?
2. **Who** — a person you can actually reach this week (channel, community).
3. **Promise** — the one-line fix the landing page sells.

If you can't name a reachable audience, stop here — traffic is the bottleneck,
not the page.

## 1. Rebrand (< 1 hour)

Follow [NEW-IDEA.md](./NEW-IDEA.md): clone, edit `src/site.config.ts`
(structure) + `messages/{bg,en,el}.json` (copy), provision Convex/PostHog/
Resend, deploy to Vercel.

Quiz questions must probe **current behavior** (Mom Test): "how do you do X
today?", "when did X last hurt?" — never "would you use/pay for this?".

## 2. Launch checklist

- [ ] Production URL live, renders at 360px width with no horizontal scroll
- [ ] All three locales work: `/` (bg), `/en`, `/el`
- [ ] Waitlist join lands a row in Convex `leads` (test with your own email)
- [ ] Welcome email arrives (Resend key set in Convex env)
- [ ] PostHog receives `$pageview`, `waitlist_joined`, `quiz_answered`,
      `quiz_completed`
- [ ] `pnpm test:e2e` green against the production build

## 3. Traffic (days 1–5)

The page measures nothing without visitors. Aim for **≥ 100 unique visitors**
before reading any rate — below that the numbers are noise.

Channels, cheapest first: the community where the audience already talks
(Facebook groups, forums, Telegram/Viber groups), direct messages to people
who match "Who", a small paid boost only if organic stalls. Post the problem,
not the product.

## 4. Read the funnel (PostHog)

Build one funnel: `$pageview` → `waitlist_joined` → `quiz_completed`.

| Visitor → lead | Verdict |
| --- | --- |
| **< 5%** | **Kill or reposition.** The promise doesn't bite. Rewrite hero/pain copy for the strongest quiz-confirmed pain and rerun once; if it's still < 5%, kill. |
| **5–15%** | **Iterate.** Real but weak signal. Change one variable at a time — audience, promise, or price framing — and drive a fresh cohort. |
| **> 15%** | **Build.** Start the concierge MVP: serve the first leads manually, then automate what repeats. |

Read the quiz answers (Convex `quizAnswers`, joined to `leads`) before any
rewrite — they tell you *which* pain converted. Answers are stored as option
ids, so they compare across locales.

## 5. Verdict (day 7)

Write the verdict down — in the repo README of the clone, one paragraph:
numbers, decision, why. Then either archive the clone (kill) or open the
build phase (concierge MVP with the product add-ons: auth, realtime,
Telegram bot).

Leads are an asset either way: on kill, send one honest "we're not building
this" email; on build, they're your first users.

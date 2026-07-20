# NEW-IDEA — clone → live landing in under 1 hour

Rebranding touches **4 content files**: `src/site.config.ts` (structure) and
`messages/{bg,en,el}.json` (copy). Everything else is provisioning.

## 1. Clone + scaffold (5 min)

```sh
git clone <this-repo> my-idea && cd my-idea
pnpm create-idea --name my-idea            # validation profile, bg/en/el
# --profile product                        # keep auth/admin/realtime/telegram
# --locales en --base en                   # single-locale idea
pnpm install
```

`create-idea` strips the add-ons your profile excludes, renames the
package, sets the locale defaults, and removes its own tooling — leaving a
clean repo. **Profiles**: `validation` (default) ships the fake-door core
only; `product` keeps the realtime/auth/admin/Telegram add-ons for ideas
that graduate to a real MVP.

## 2. Rewrite the copy (25 min)

- `messages/bg.json` — write the real copy in the base locale first: brand,
  hero, pains, solution features, CTA, quiz questions + options. Keep the
  existing key names where the structure fits.
- `messages/en.json`, `messages/el.json` — translate every key. All three
  files must have identical key sets (the Paraglide compiler errors on
  missing keys).
- `src/site.config.ts` — adjust *structure*: reorder/add/remove sections,
  change quiz question count, point fields at your `m.*` keys. Section types
  available: `hero`, `pain`, `solution`, `cta` (repeatable, render in array
  order).

Quiz rules: options are `{ id, label }` — ids are what gets stored, so keep
them stable and English. Questions probe current behavior only (Mom Test);
see [PLAYBOOK.md](./PLAYBOOK.md) §1.

Check locally: `pnpm dev` → http://localhost:3000, `/en`, `/el`.

## 3. Provision backends (15 min)

Each layer no-ops gracefully when unconfigured — the page renders without
any of them — but a validation run needs all three.

```sh
# Convex (leads + quiz storage) — creates project, writes .env.local
npx convex dev --once --configure=new --project my-idea

# Resend (welcome email) — lives in the CONVEX env, not .env.local
npx convex env set RESEND_API_KEY re_...
npx convex env set EMAIL_FROM hello@yourdomain.com   # optional

# PostHog — add to .env.local
# VITE_POSTHOG_KEY=phc_...   (EU host is the default)
```

Welcome email copy lives in `emails/welcome.tsx` (Bulgarian-only for now).

## 4. Deploy (10 min)

```sh
npx vercel link    # new Vercel project
npx vercel deploy --prod
```

Set the same `VITE_CONVEX_URL` / `VITE_POSTHOG_KEY` values in the Vercel
project env (Production), then redeploy. Use a Convex **prod** deployment
(`npx convex deploy`) if the idea graduates past a quick test; the dev
deployment works fine for a one-week fake-door run.

## 5. Verify (5 min)

- [ ] Join the waitlist with your own email → row in Convex `leads`, welcome
      email received
- [ ] Answer the quiz → rows in `quizAnswers` with your option ids
- [ ] Events visible in PostHog
- [ ] Update the copy assertions in `e2e/fake-door.spec.ts` (it asserts the
      example h1 text per locale), then `pnpm test:e2e` → green

Then start the clock: [PLAYBOOK.md](./PLAYBOOK.md) §3 — traffic.

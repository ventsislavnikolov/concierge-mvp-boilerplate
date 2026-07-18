# Better Auth ↔ Convex on TanStack Start — verified 2026-07-18

Sources: `get-convex/better-auth` docs + `examples/tanstack` (GitHub main),
`better-auth/better-auth` docs (GitHub main). Context7 quota was exhausted;
raw doc sources fetched directly.

## Verdict

**First-class.** Convex ships an official Better Auth component
(`@convex-dev/better-auth`) with a dedicated TanStack Start guide and a full
TanStack example app. Magic link and Google OAuth are both on the supported
list — **no schema changes, no local install needed**.

## Versions (npm, checked 2026-07-18)

- `@convex-dev/better-auth` **0.12.5** — peer deps: `better-auth >=1.6.11 <1.7.0`
  (install `better-auth@~1.6.15`), `convex ^1.25.0`, React 18/19.
- `better-auth` latest is 1.6.23 — inside the pinned peer range.
- Component is pre-1.0: expect breaking changes between minors (repo has
  migration guides for each 0.x step). Pin exact versions (repo policy anyway).

## Architecture (the key mental model)

Better Auth **runs inside Convex**, not in the TanStack server:

- `createClient(components.betterAuth)` → `authComponent`; the Better Auth
  instance is built per-request by `createAuth(ctx)` with
  `database: authComponent.adapter(ctx)` and the required `convex()` plugin.
- Auth HTTP routes are registered **on the Convex deployment**
  (`convex/http.ts`: `authComponent.registerRoutes(http, createAuth)`) and
  **proxied** from TanStack Start: `src/routes/api/auth/$.ts` forwards
  GET/POST to the `handler` from `convexBetterAuthReactStart(...)`.
- Consequence: **auth secrets live in the Convex env**
  (`npx convex env set`), same place as our `RESEND_API_KEY`.
- Sign in/out must happen **from the client** (`authClient.signIn.*`) —
  Convex functions run over websockets and can't set cookies. Server-side
  `auth.api.*` calls go inside Convex functions via
  `authComponent.getAuth(createAuth, ctx)` (returns `{ auth, headers }`).

## Files touched (wiring for ticket #9)

| File | Change |
| --- | --- |
| `vite.config.ts` | `ssr: { noExternal: ['@convex-dev/better-auth'] }` |
| `convex/convex.config.ts` | new — `app.use(betterAuth)` |
| `convex/auth.config.ts` | new — `providers: [getAuthConfigProvider()]` |
| `convex/auth.ts` | new — `authComponent` + `createAuth(ctx)` (magic link + Google config here) |
| `convex/http.ts` | new — `authComponent.registerRoutes(http, createAuth)` |
| `src/lib/auth-client.ts` | new — `createAuthClient({ plugins: [convexClient(), magicLinkClient()] })` |
| `src/lib/auth-server.ts` | new — `convexBetterAuthReactStart({ convexUrl, convexSiteUrl })` → `handler`, `getToken`, `fetchAuthQuery/Mutation/Action` |
| `src/routes/api/auth/$.ts` | new — proxy GET/POST to `handler` |
| `src/routes/__root.tsx` | `beforeLoad`: server fn `getToken()` → context `{ isAuthenticated, token }`; wrap in `ConvexBetterAuthProvider` |
| `src/router.tsx` | pass `convexQueryClient` into context; SSR auth via `serverHttpClient?.setAuth(token)` |

## Env vars

Convex deployment env (`npx convex env set …`):

- `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
- `SITE_URL` — the app origin (Better Auth `baseURL`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — read inside `createAuth`

`.env.local` (and Vercel env):

- `VITE_CONVEX_SITE_URL` — same as `VITE_CONVEX_URL` but ending `.site`
- `VITE_SITE_URL` — app origin

## Magic link

Better Auth `magicLink` plugin (supported, default component schema covers it):

```ts
// convex/auth.ts — inside createAuth(ctx) plugins:
magicLink({
  sendMagicLink: async ({ email, url }) => {
    await sendMagicLink(requireActionCtx(ctx), { to: email, url });
  },
}),
```

- `sendMagicLink` executes in a Convex **action** ctx — `requireActionCtx`
  (from `@convex-dev/better-auth/utils`) is the type guard. The official
  example sends via the **`@convex-dev/resend` component**; our existing
  `convex/emails.ts` uses the raw `resend` SDK in a `"use node"`
  internalAction. Both work — decision for #9: adopt the Resend component
  (queue/retries, one pattern for welcome + magic-link emails) or keep the
  raw SDK. **Recommendation: adopt `@convex-dev/resend`.**
- Client: `authClient.signIn.magicLink({ email, callbackURL: "/admin" })`.
  Token expires in 300 s, single-use, auto-signup unless `disableSignUp`.
- Client plugin `magicLinkClient()` added alongside `convexClient()`.

## Google OAuth

```ts
// convex/auth.ts — inside createAuth(ctx):
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  },
},
```

- Client: `authClient.signIn.social({ provider: "google" })`.
- Google Cloud Console redirect URI points at the **app domain** (the proxy
  route), not convex.site: `https://<app>/api/auth/callback/google` +
  `http://localhost:3000/api/auth/callback/google` for dev. `baseURL`
  (= `SITE_URL`) must be set or you get `redirect_uri_mismatch`.
- Optional hardening: `prompt: "select_account"`, `accessType: "offline"`
  for refresh tokens, `hd` to restrict to a Workspace domain.

## Session handling

- **Trust Convex, not Better Auth, for auth state in UI**: use
  `useConvexAuth()` / `<Authenticated>` / `<Unauthenticated>` from
  `convex/react`. Better Auth reports signed-in before Convex has validated
  the JWT; authed Convex queries called too early will throw.
- SSR: root `beforeLoad` fetches the token via server fn → sets it on
  `convexQueryClient.serverHttpClient` so `ensureQueryData`/
  `useSuspenseQuery` run authenticated during SSR.
- In Convex functions: `authComponent.getAuthUser(ctx)` (validates session)
  or plain `ctx.auth.getUserIdentity()` (JWT only, no session validation).
- **Sign-out gotcha**: with `expectAuth: true`, reload the page on sign-out
  (`authClient.signOut({ fetchOptions: { onSuccess: () => location.reload() } })`).

## Protected route pattern (for `/admin`, ticket #14)

Pathless layout route + `beforeLoad`:

```tsx
// src/routes/_authed.tsx
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
```

`context.isAuthenticated` comes from the root `beforeLoad` (token check on
the server), so protection holds on both SSR and client navigation. Convex
functions behind it still enforce their own check (`getAuthUser` throw) —
route guards are UX, function guards are security. This finally closes the
deferred auth-gating on `leads.list` (#8's note).

## Repo-specific conflicts to resolve in #9

1. **`expectAuth: true` vs public landing.** The guide's setting blocks
   client Convex calls until authentication — wrong for our mostly-public
   fake-door page (anonymous `leads.join` / `quiz.answer`). Options:
   (a) skip `expectAuth`, accept a flash of unauthed data on `/admin` SSR;
   (b) keep public functions on plain HTTP mutations. **Recommendation:
   skip `expectAuth`** — validation core must stay anonymous-first; `/admin`
   can tolerate a loading state.
2. **Graceful no-env branch in `router.tsx`** must survive: without
   `VITE_CONVEX_URL` the landing still renders; auth wiring goes in the
   Convex-enabled branch only.
3. **Paraglide catch-all urlPattern** also matches `/api/auth/...`. bg is
   unprefixed so paths pass through unchanged, and the middleware forwards
   the original request — expected to be inert, but verify the proxy route
   before calling #9 done (add an E2E or manual probe of
   `/api/auth/get-session`).
4. **Module layering**: auth is a product add-on — absent
   `BETTER_AUTH_SECRET`/Google env it must no-op. The component registers
   Convex HTTP routes unconditionally once wired; keeping `convex/auth.ts`
   present but the UI routes (`/sign-in`, `/_authed`) inert without env
   satisfies the policy.

## Optional extras seen in the example

- **Triggers**: `authComponent` `triggers.user.onCreate/onUpdate/onDelete`
  can mirror auth users into an app-owned `users` table
  (`authComponent.setUserId`). Useful if #14 wants to join leads ↔ admin
  users; not required for magic link + Google.
- Supported-plugins list also includes Email OTP, Anonymous, 2FA, One Tap,
  Username, Phone Number. Incompatible: SSO (Node-only).

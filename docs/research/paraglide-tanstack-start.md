# Research: Paraglide i18n (bg/en/el) on Vite/TanStack Start

Resolves wayfinder ticket #6. Verified against `@inlang/paraglide-js` 2.22.0
(npm readme) and the official `TanStack/router` example
`examples/react/start-i18n-paraglide` on 2026-07-17.

## TL;DR

- **First-class support**: Paraglide is compiler-first, Vite-native, and ships
  an official TanStack Start example maintained in the TanStack/router repo.
  bg/en/el is just a `locales` array — no special-casing for Cyrillic/Greek.
- One dev dependency (`@inlang/paraglide-js`), one Vite plugin, zero runtime
  packages: messages compile to tree-shakeable TS modules in `src/paraglide/`.
- **SSR works via a tiny middleware wrapper** around Start's server entry —
  locale is consistent server-side, `<html lang>` comes from `getLocale()`.
- Messages work in components, **loaders, and server functions** alike
  (`m.some_message({ params })`).

## Canonical wiring (from the official example)

### 1. `vite.config.ts`

```ts
import { paraglideVitePlugin } from "@inlang/paraglide-js";

plugins: [
  paraglideVitePlugin({
    project: "./project.inlang",
    outdir: "./src/paraglide",
    outputStructure: "message-modules",
    cookieName: "PARAGLIDE_LOCALE",
    strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
    urlPatterns: [
      {
        pattern: "/:path(.*)?",
        localized: [
          ["bg", "/:path(.*)?"],        // base locale unprefixed
          ["en", "/en/:path(.*)?"],
          ["el", "/el/:path(.*)?"],
        ],
      },
    ],
  }),
  tanstackStart(),
  // …
]
```

### 2. `project.inlang/settings.json`

```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "baseLocale": "bg",
  "locales": ["bg", "en", "el"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@4/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@2/dist/index.js"
  ],
  "plugin.inlang.messageFormat": { "pathPattern": "./messages/{locale}.json" }
}
```

### 3. Messages: `messages/bg.json`, `messages/en.json`, `messages/el.json`

```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "hero_headline": "Организирай мача с един линк",
  "example_with_param": "Здравей, {username}"
}
```

### 4. SSR middleware: `src/server.ts` (custom Start server entry)

```ts
import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
```

### 5. Usage anywhere

```ts
import { m } from "@/paraglide/messages";
import { getLocale, locales, setLocale } from "@/paraglide/runtime";

<html lang={getLocale()}>          // root document
m.hero_headline()                   // components, loaders, server functions
setLocale("en")                     // language switcher (navigates)
```

## Implications for the i18n ticket (#15)

1. **`site.config.ts` copy migrates to `messages/{bg,en,el}.json`**; config
   fields hold message *keys* (or the sections call `m.*()` directly). The
   "one file to rebrand" story becomes "config + three message files" —
   NEW-IDEA.md (#19) must reflect that.
2. `strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale']` gives
   bg-default URLs, `/en/…` + `/el/…` prefixes, cookie stickiness, and
   Accept-Language fallback — no custom code.
3. The E2E smoke (#16) asserts Bulgarian strings; after #15 they resolve via
   the same message files, so tests keep passing (import `m` in the spec or
   keep asserting the bg defaults).
4. `src/paraglide/` is generated — add to `.gitignore` and biome excludes.
5. Machine translation available via `npx @inlang/cli machine translate`
   (fills en/el from bg source) — good enough for validation copy.

## Sources

- npm: `@inlang/paraglide-js` 2.22.0 readme (compiler-first, strategy, SSR)
- Official example: `TanStack/router` → `examples/react/start-i18n-paraglide`
  (vite.config, project.inlang settings, server middleware, root/index routes)

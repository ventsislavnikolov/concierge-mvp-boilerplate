import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      cookieName: "PARAGLIDE_LOCALE",
      outdir: "./src/paraglide",
      outputStructure: "message-modules",
      project: "./project.inlang",
      strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
      urlPatterns: [
        {
          localized: [
            ["en", "/en"],
            ["el", "/el"],
            ["bg", "/"],
          ],
          pattern: "/",
        },
        {
          localized: [
            ["en", "/en/:path(.*)?"],
            ["el", "/el/:path(.*)?"],
            ["bg", "/:path(.*)?"],
          ],
          pattern: "/:path(.*)?",
        },
      ],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    // Last: uploads source maps to Sentry — only when a token is set.
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryTanstackStart({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
          }),
        ]
      : []),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  // module:auth
  // Bundle the Better Auth component during SSR to avoid module
  // resolution issues (per its TanStack Start guide).
  ssr: {
    noExternal: ["@convex-dev/better-auth"],
  },
  // end-module:auth
});

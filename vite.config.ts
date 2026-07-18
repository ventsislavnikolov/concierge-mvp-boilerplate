import { paraglideVitePlugin } from "@inlang/paraglide-js";
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
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  // Bundle the Better Auth component during SSR to avoid module
  // resolution issues (per its TanStack Start guide).
  ssr: {
    noExternal: ["@convex-dev/better-auth"],
  },
});

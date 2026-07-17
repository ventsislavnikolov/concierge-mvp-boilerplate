import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke E2E of the fake-door flow at mobile viewport (spec: usable at
 * 360px). Runs against the production build; `pnpm test:e2e` builds
 * first via the webServer command.
 */
export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  projects: [
    {
      name: "mobile-chromium",
      // 360px is the spec's floor for mobile usability
      use: { ...devices["Pixel 7"], viewport: { height: 740, width: 360 } },
    },
  ],
  reporter: [["list"]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm build && node .output/server/index.mjs",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: "http://localhost:3000",
  },
});

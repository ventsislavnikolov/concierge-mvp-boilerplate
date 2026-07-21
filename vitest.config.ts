import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only — E2E lives in e2e/ under Playwright.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

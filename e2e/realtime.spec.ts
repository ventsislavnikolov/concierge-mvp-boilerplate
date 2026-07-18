import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

/**
 * Signs in without email delivery: request a magic link (the email
 * no-ops without RESEND_API_KEY, but the token is stored), read the
 * token from the Better Auth component table, and open the verify URL
 * so the browser context receives session cookies.
 */
async function signIn(page: import("@playwright/test").Page, email: string) {
  const response = await page.request.post("/api/auth/sign-in/magic-link", {
    data: { callbackURL: "/app", email },
  });
  expect(response.ok()).toBe(true);
  const table = execSync(
    "npx convex data --component betterAuth verification --limit 1 --order desc",
    { encoding: "utf8" }
  );
  const token = table.match(/\|\s+"([A-Za-z0-9]{32})"\s+\|/)?.[1];
  expect(token).toBeTruthy();
  await page.goto(
    `/api/auth/magic-link/verify?token=${token}&callbackURL=/app`
  );
  await expect(page.getByTestId("live-list")).toBeAttached();
}

test("realtime: a second tab sees list changes live, without reload", async ({
  browser,
  page,
}) => {
  await signIn(page, `e2e-realtime-${Date.now()}@example.com`);

  // Second "tab": same session cookies, separate browser context
  const cookies = await page.context().cookies();
  const contextB = await browser.newContext({
    viewport: { height: 740, width: 360 },
  });
  await contextB.addCookies(cookies);
  const pageB = await contextB.newPage();
  await pageB.goto("/app");
  await expect(pageB.getByTestId("live-list")).toBeAttached();

  // Add in tab A → appears in tab B via subscription only
  const itemText = `realtime-check-${Date.now()}`;
  await page.getByPlaceholder("Добави ред…").fill(itemText);
  await page.getByRole("button", { name: "Добави" }).click();
  await expect(page.getByText(itemText)).toBeVisible();
  await expect(pageB.getByText(itemText)).toBeVisible();

  // Remove in tab B → disappears from tab A
  await pageB
    .locator("li", { hasText: itemText })
    .getByRole("button", { name: "Изтрий" })
    .click();
  await expect(pageB.getByText(itemText)).toBeHidden();
  await expect(page.getByText(itemText)).toBeHidden();

  await contextB.close();
});

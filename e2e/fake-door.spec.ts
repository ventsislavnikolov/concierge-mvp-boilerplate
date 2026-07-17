import { expect, test } from "@playwright/test";
import { siteConfig } from "../src/site.config";

const hero = siteConfig.sections.find((s) => s.type === "hero");
const cta = siteConfig.sections.find((s) => s.type === "cta");

test("fake-door flow: land → join waitlist → answer quiz", async ({ page }) => {
  await page.goto("/");

  // Landing renders the config-driven sections
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    hero?.headline ?? ""
  );
  await expect(page.locator("#waitlist")).toBeVisible();

  // No horizontal scroll at mobile viewport (360–412px)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);

  // Join the waitlist (unique email per run keeps join on the new-lead path)
  const email = `e2e-${Date.now()}@example.com`;
  await page.getByPlaceholder("имейл адрес").fill(email);
  await page
    .getByRole("button", { name: cta?.button.label ?? "Запиши се" })
    .click();
  await expect(page.getByText("Готово — ще ти пишем")).toBeVisible();

  // Quiz starts immediately after joining; answer every question
  for (const question of siteConfig.quiz.questions) {
    await expect(page.getByText(question.question)).toBeVisible();
    await page.getByRole("button", { name: question.options[0] ?? "" }).click();
  }
  await expect(page.getByText(siteConfig.quiz.thanks)).toBeVisible();
});

test("re-joining with the same email is acknowledged, not duplicated", async ({
  page,
}) => {
  const email = "e2e-repeat@example.com";
  for (const expected of [
    /Готово — ще ти пишем|Вече си в списъка/,
    /Вече си в списъка/,
  ]) {
    await page.goto("/");
    await page.getByPlaceholder("имейл адрес").fill(email);
    await page
      .getByRole("button", { name: cta?.button.label ?? "Запиши се" })
      .click();
    await expect(page.getByText(expected)).toBeVisible();
  }
});

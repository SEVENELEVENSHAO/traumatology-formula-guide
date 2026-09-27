import { expect, test } from "@playwright/test";

test("library search, drawer, bookmark, and compare journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Learn the family, not just the list." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Formula Families" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Si Wu Tang family/ })).toHaveAttribute("aria-expanded", "true");
  await page.getByPlaceholder(/Search names/).fill("Tao Hong");
  await page.getByText("Tao Hong Si Wu Tang", { exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Formulas contained here");
  await page.getByRole("dialog").getByRole("button", { name: "Add bookmark", exact: true }).click();
  await page.getByRole("button", { name: "Close formula" }).click();
  await page.getByRole("button", { name: "Compare" }).first().click();
  await expect(page.getByRole("heading", { name: "Shared ingredients" })).toBeVisible();
});

test("connections and study work at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "Connections" }).last().click();
  await expect(page.getByText("Accessible relationship list")).toBeVisible();
  await page.getByRole("button", { name: "Study" }).last().click();
  await expect(page.getByText(/Question 1 of/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("bookmarks persist and the application shell reloads offline", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("tfg-bookmarks", JSON.stringify(["si-wu-tang"])));
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tfg-bookmarks") ?? "[]"))).toEqual(["si-wu-tang"]);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; return true; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Learn the family, not just the list." })).toBeVisible();
});

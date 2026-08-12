import { expect, test } from "@playwright/test";

test("boots a themed arena and resizes its single canvas", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByText("Arena Survivor")).toBeHidden();

  await expect
    .poll(() =>
      page.evaluate(() => window.__ARENA_TEST__?.getSnapshot()),
    )
    .toMatchObject({ status: "ready", scene: "run", themeId: "knight_magic" });

  await page.setViewportSize({ width: 900, height: 600 });
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().canvas))
    .toEqual({ width: 900, height: 600 });

  expect(consoleErrors).toEqual([]);
});

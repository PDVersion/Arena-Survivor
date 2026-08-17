import { expect, test } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

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
    // Resolved from the facade rather than a literal, so swapping the
    // production pack stays a one-line change in `active-theme.ts`.
    .toMatchObject({ status: "ready", scene: "run", themeId: activeTheme.id });

  await page.setViewportSize({ width: 900, height: 600 });
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().canvas))
    .toEqual({ width: 900, height: 600 });

  expect(consoleErrors).toEqual([]);
});

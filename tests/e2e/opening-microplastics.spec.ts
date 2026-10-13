import { expect, test } from "@playwright/test";
import { difficultyIds } from "../../src/game/core/archetypes/difficulty";

for (const difficulty of difficultyIds) {
  test(`one ordinary starter hit clears opening Microplastics in ${difficulty}`, async ({ page }) => {
    await page.goto(`/?loadHarness=1&loadRole=enemy.fast_fragile&closeLoad=1&lineLoad=1&noContact=1&noXp=1&noHazards=1&critChance=0&difficulty=${difficulty}`);
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.kills)).toBe(1);
    const state = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    expect(state?.combat?.meleeHits).toBe(1);
    expect(state?.elites?.spawned).toBe(0);
    expect(state?.progression?.selectedUpgradeIds).toEqual([]);
    expect(state?.spawnOrigins?.spawned.benchmark).toBe(1);
    expect(state?.run?.difficulty).toBe(difficulty);
  });
}

test("sprite browser exposes starting health, starter hits and tool stats for each difficulty", async ({ page }) => {
  await page.goto("/sprite-browser.html");
  await page.locator('[data-id="enemy.fast_fragile"]').click();
  await page.locator("#stats-panel summary").click();
  for (const [difficulty, health] of [["beginner", "6.75"], ["normal", "8.55"], ["experienced", "9.9"]] as const) {
    await page.getByLabel("Starting difficulty").selectOption(difficulty);
    await expect(page.locator("#content-stats tr").filter({ has: page.getByRole("rowheader", { name: "Health", exact: true }) }).locator("td")).toHaveText(health);
    await expect(page.locator("#content-stats tr").filter({ hasText: "Starter hits (non-critical)" }).locator("td")).toHaveText("1");
  }
  await page.locator("#art").selectOption("all");
  await page.locator('[data-id="weapon.starter"]').click();
  await expect(page.locator("#content-stats tr").filter({ has: page.getByRole("rowheader", { name: "Damage", exact: true }) }).locator("td")).toHaveText("10");
  await page.getByLabel("Starting difficulty").selectOption("beginner");
  await expect(page.locator("#content-stats tr").filter({ has: page.getByRole("rowheader", { name: "Damage", exact: true }) }).locator("td")).toHaveText("12");
});

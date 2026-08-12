import { expect, test, type Page } from "@playwright/test";

async function waitForLevelUp(page: Page): Promise<void> {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 35_000,
    })
    .toBe("level_up");
}

test("level up freezes play and presents three distinct themed upgrades", async ({ page }) => {
  test.setTimeout(50_000);
  await waitForLevelUp(page);
  const paused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  expect(paused?.run).toMatchObject({ level: 2, pendingChoices: 1 });
  expect(paused?.progression?.choiceIds).toHaveLength(3);
  expect(new Set(paused?.progression?.choiceIds).size).toBe(3);
  expect(paused?.progression?.pickupsCollected).toBeGreaterThanOrEqual(2);
  expect(paused?.progression?.pickupsDropped).toBe(paused?.run?.kills);

  await page.waitForTimeout(250);
  const frozen = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(frozen?.run?.elapsedMs).toBe(paused?.run?.elapsedMs);
  expect(frozen?.player?.x).toBe(paused?.player?.x);
  expect(frozen?.player?.y).toBe(paused?.player?.y);
});

test("choosing an upgrade applies its stable effect and resumes safely", async ({ page }) => {
  test.setTimeout(50_000);
  await waitForLevelUp(page);
  const before = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  const chosenId = before?.progression?.choiceIds[0];
  expect(chosenId).toBeTruthy();

  await page.locator("canvas").click({ position: { x: 640, y: 255 } });
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
  const after = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  expect(after?.progression?.selectedUpgradeIds).toContain(chosenId);
  expect(after?.run?.pendingChoices).toBe(0);
  switch (chosenId) {
    case "upgrade.damage":
      expect(after?.player?.damageBonus).toBeGreaterThan(before?.player?.damageBonus ?? Infinity);
      break;
    case "upgrade.attack_speed":
      expect(after?.player?.attackSpeedBonus).toBeGreaterThan(
        before?.player?.attackSpeedBonus ?? Infinity,
      );
      break;
    case "upgrade.crit_chance":
      expect(after?.player?.critChance).toBeGreaterThan(before?.player?.critChance ?? Infinity);
      break;
    case "upgrade.pierce":
      expect(after?.progression?.pierceBonus).toBeGreaterThan(
        before?.progression?.pierceBonus ?? Infinity,
      );
      break;
    case "upgrade.projectile_count":
      expect(after?.progression?.projectileCountBonus).toBeGreaterThan(
        before?.progression?.projectileCountBonus ?? Infinity,
      );
      break;
    case "upgrade.move_speed":
      expect(after?.player?.moveSpeed).toBeGreaterThan(before?.player?.moveSpeed ?? Infinity);
      break;
    case "upgrade.health":
      expect(after?.player?.maxHealth).toBeGreaterThan(before?.player?.maxHealth ?? Infinity);
      break;
    case "upgrade.pickup_radius":
      expect(after?.player?.pickupRadius).toBeGreaterThan(before?.player?.pickupRadius ?? Infinity);
      break;
    default:
      throw new Error(`Unexpected upgrade choice: ${chosenId}`);
  }
});

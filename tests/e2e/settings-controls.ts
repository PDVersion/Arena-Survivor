import { expect, type Page } from "@playwright/test";
import type { SettingKey } from "../../src/game/state/settings-state";

/** Click the actual rendered hit target; do not assume row order/pitch/footer size. */
export async function clickSettingControl(page: Page, key: SettingKey | "manageSave"): Promise<void> {
  const locate = () => page.evaluate((key) => {
    const snapshot = window.__ARENA_TEST__?.getSnapshot();
    const controls = snapshot?.scene === "menu" ? snapshot.menu?.settingsControls : snapshot?.ui?.settingsControls;
    const point = controls?.[key];
    return point && snapshot?.canvas ? { ...point, ...snapshot.canvas } : null;
  }, key);
  await expect.poll(locate).not.toBeNull();
  const point = (await locate())!;
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("Missing game canvas");
  await page.mouse.click(box.x + point.x * box.width / point.width, box.y + point.y * box.height / point.height);
}

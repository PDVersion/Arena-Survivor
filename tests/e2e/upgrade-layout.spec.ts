import { expect, test } from "@playwright/test";

test("large measured upgrade cards fit the UI viewport and scaled pointer selection", async ({ page }) => {
  await page.goto("/sprite-browser.html");
  const result = await page.evaluate(async () => {
    const phaserPath = "/node_modules/phaser/dist/phaser.esm.js";
    const uiPath = "/src/game/ui/level-up-choice-ui.ts";
    const themePath = "/src/game/content/active-theme.ts";
    const [Phaser, { LevelUpChoiceUi }, { activeTheme }] = await Promise.all([
      import(phaserPath), import(uiPath), import(themePath),
    ]);
    const parent = document.createElement("div");
    parent.id = "layout-fixture";
    parent.style.cssText = "position:fixed;inset:0;z-index:9999";
    document.body.append(parent);
    return new Promise<{ contained: boolean; details: number; targets: { x: number; y: number }[] }>((resolve) => {
      class LayoutScene extends Phaser.Scene {
        create() {
          this.cameras.main.setZoom(2);
          const choices = activeTheme.upgrades.slice(0, 3);
          const descriptions = choices.map((choice: { id: string }, index: number) => ({
            id: choice.id, name: `Measured card ${index + 1} with a long wrapped heading`,
            summary: "A long summary with descenders: gently recover equipment while keeping every card readable and selectable.",
            tier: "unique", tierLabel: "Unique", tierMultiplier: 2.5,
            level: 1, nextLevel: 2, maxLevel: 6, track: "general", isNew: false,
            lines: Array.from({ length: 3 }, (_, row) => ({
              label: `Detail ${row + 1} with long wrapping text and descenders gypq`,
              from: "100", to: "200", delta: "+100%",
            })),
          }));
          const ui = new LevelUpChoiceUi(this, activeTheme);
          ui.show(choices, { descriptions, pendingAfterThis: 2, showDetail: true }, (choice: { id: string }) => {
            Object.assign(window, { __LAYOUT_SELECTION__: choice.id });
          });
          // Probe the actual rendered objects, not a duplicate layout formula.
          const container = this.children.list.find((child: { type: string; depth: number }) => child.type === "Container" && child.depth === 1000);
          const children = container.list;
          const panel = children[0].getBounds();
          const cards = children.filter((child: { type: string }) => child.type === "Rectangle").slice(1);
          const texts = children.filter((child: { type: string }) => child.type === "Text");
          const cardBounds = cards.map((card: { getBounds: () => { left: number; right: number; top: number; bottom: number } }) => card.getBounds());
          const contained = texts.every((text: { getBounds: () => { left: number; right: number; top: number; bottom: number } }) => {
            const bounds = text.getBounds();
            return bounds.left >= panel.left && bounds.right <= panel.right && bounds.top >= panel.top && bounds.bottom <= panel.bottom;
          });
          const inOwnCards = texts.filter((text: { text: string }) => text.text !== activeTheme.copy.levelUpTitle && !text.text.startsWith("+")).every((text: { getBounds: () => { left: number; right: number; top: number; bottom: number } }) => {
            const bounds = text.getBounds();
            return cardBounds.some((card: { left: number; right: number; top: number; bottom: number }) => bounds.left >= card.left && bounds.right <= card.right && bounds.top >= card.top && bounds.bottom <= card.bottom);
          });
          this.time.delayedCall(250, () => {
            const camera = this.cameras.main;
            const topLeft = camera.matrix.transformPoint(panel.left, panel.top);
            const bottomRight = camera.matrix.transformPoint(panel.right, panel.bottom);
            resolve({
              contained: contained && inOwnCards && topLeft.y >= 0 && bottomRight.y <= 900,
              details: texts.filter((text: { text: string }) => text.text.includes("Detail 3")).length,
              targets: cards.map((card: { getBounds: () => { centerX: number; centerY: number } }) => {
                const bounds = card.getBounds();
                const point = camera.matrix.transformPoint(bounds.centerX, bounds.centerY);
                return { x: point.x, y: point.y };
              }),
            });
          });
        }
      }
      new Phaser.Game({ type: Phaser.CANVAS, width: 1600, height: 900, parent, scene: [LayoutScene], scale: { mode: Phaser.Scale.FIT } });
    });
  });
  expect(result.contained).toBe(true);
  expect(result.details).toBe(3);
  const canvas = page.locator("#layout-fixture canvas");
  const box = (await canvas.boundingBox())!;
  await page.screenshot({ path: "/private/tmp/arena-q3-upgrade-layout.png" });
  await canvas.click({ position: { x: result.targets[2]!.x * box.width / 1600, y: result.targets[2]!.y * box.height / 900 } });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__LAYOUT_SELECTION__"))).toBe("upgrade.crit_chance");
});

import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const html = await readFile("dist/index.html", "utf8");
const assets = await readdir("dist/assets");
const emitted = await Promise.all(assets.filter((name) => name.endsWith(".js")).map(async (name) => ({ name, code: await readFile(`dist/assets/${name}`, "utf8") })));
for (const { name, code } of emitted) {
  for (const marker of ["__ARENA_TEST__", "summaryMetrics:", "liveByRole:", "averageSimulationDeltaMs:", "xpByBucket:"]) {
    if (code.includes(marker)) throw new Error(`Production retains diagnostic marker ${marker} in ${name}`);
  }
}
if (!html.includes("assets/game-")) throw new Error("Missing game entry");
const url = "http://127.0.0.1:4174";
if (await fetch(url).then(() => true, () => false)) throw new Error("Production validation port is already in use");
const server = spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"), "preview", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], { stdio: "ignore" });
const browser = await chromium.launch();
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await fetch(url).then((response) => response.ok, () => false)) { ready = true; break; }
    await new Promise((done) => setTimeout(done, 100));
  }
  if (!ready) throw new Error("Production server unavailable");
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${url}/?enemyCap=600&loadHarness=600&frameMeasure=1`);
  await page.waitForSelector("canvas");
  await page.waitForTimeout(500);
  if (await page.evaluate(() => Boolean(window.__ARENA_TEST__))) throw new Error("Production test interface leaked");
  await page.keyboard.press("Enter");
  await page.keyboard.down("ArrowRight"); await page.waitForTimeout(500); await page.keyboard.up("ArrowRight");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  await page.screenshot({ path: "/private/tmp/arena-p1-production.png" });
  if (errors.length) throw new Error(errors.join("; "));
  const spriteResponse = await page.goto(`${url}/sprite-browser.html`);
  if (!spriteResponse?.ok()) throw new Error("Production sprite-browser entry missing");
  await page.waitForSelector(".card canvas[data-loaded=true]");
  if (await page.evaluate(() => Boolean(window.__ARENA_TEST__))) throw new Error("Sprite tool test interface leaked");
  await page.locator('[data-id="enemy.fast_fragile"]').click();
  await page.getByLabel("Starting difficulty").selectOption("experienced");
  await page.locator("#stats-panel summary").click();
  const microplasticHealth = await page.locator("#content-stats tr").filter({ has: page.getByRole("rowheader", { name: "Health", exact: true }) }).locator("td").textContent();
  if (microplasticHealth !== "9.9") throw new Error(`Unexpected Experienced starting health ${microplasticHealth}`);
  await page.screenshot({ path: "/private/tmp/arena-q4-stats.png" });
  await page.locator("#stats-panel summary").click();
  await page.screenshot({ path: "/private/tmp/arena-q4-overview.png" });
  if (errors.length) throw new Error(errors.join("; "));
  await page.getByRole("link", { name: "Architecture atlas", exact: true }).click();
  await page.getByRole("heading", { name: "Architecture atlas", exact: true }).waitFor();
  await page.getByRole("link", { name: "Sprite browser ↗", exact: true }).click();
  await page.waitForSelector(".card canvas[data-loaded=true]");
  if (errors.length) throw new Error(errors.join("; "));
  const result = { checkedAt: new Date().toISOString(), browserVersion: browser.version(),
    bundlesChecked: emitted.map(({ name }) => name), diagnosticMarkersAbsent: true,
    testInterfaceAbsent: true, productionBootPlayPause: true, spriteBrowserLoads: true, startingStatsVerified: true, architectureNavigation: true, errors };
  await writeFile(process.argv[2] ?? "build/performance/P1_PRODUCTION_CHECK.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
} finally { await browser.close(); server.kill("SIGTERM"); }

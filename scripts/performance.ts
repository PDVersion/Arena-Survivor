import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { chromium, type Page } from "@playwright/test";
import { FrameMeasurements } from "../src/test-support/frame-measurements";

function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1] ?? fallback;
}

const seconds = Number(argument("seconds", "60"));
const warmup = Number(argument("warmup", "10"));
const repeats = Number(argument("repeats", "3"));
const mode = argument("mode", "both");
const scenario = argument("scenario", "default");
const interfaces = argument("interface", "visible").split(",");
const profile = process.argv.includes("--profile");
const quality = argument("quality", "default");
if (!["default", "low"].includes(quality)) throw new Error("quality must be default or low");
const p3 = argument("p3", "none");
if (!["none", "dense", "distributed", "combat", "pickups"].includes(p3) || (p3 !== "none" && (mode !== "test" || scenario !== "capacity"))) throw new Error("P3 fixtures require test/capacity and dense/distributed/combat/pickups");
const headed = process.argv.includes("--headed");
const loads = argument("loads", "150,300,450,600").split(",").map(Number);
if (p3 !== "none" && (loads.some((count) => count > 300) || interfaces.includes("paused"))) {
  throw new Error("P3 fixtures require active windows and retain the production 300-enemy cap");
}
const output = resolve(argument("output", "build/performance/P0_SAMPLES.json"));
const screenshotDirectory = argument("screenshots", "");
if (!Number.isFinite(seconds) || seconds < 1 || seconds > 300 ||
    !Number.isFinite(warmup) || warmup < 0 || warmup > 60 ||
    !Number.isInteger(repeats) || repeats < 1 || repeats > 10 ||
    !["both", "test", "production"].includes(mode) ||
    !["default", "stress", "capacity"].includes(scenario) || (scenario !== "default" && mode !== "test") ||
    (scenario === "stress" && interfaces.some((value) => value !== "visible")) ||
    interfaces.some((value) => !["visible", "hidden", "paused"].includes(value)) ||
    loads.some((count) => !Number.isInteger(count) || count < 1 || count > 1000)) {
  throw new Error("Use seconds 1–300, warmup 0–60, repeats 1–10, mode both/test/production; stress/capacity are test-only; interface visible/hidden/paused (stress visible only); loads must be 1–1000");
}
await mkdir(dirname(output), { recursive: true });
if (screenshotDirectory) await mkdir(resolve(screenshotDirectory), { recursive: true });

const servers: ChildProcess[] = [];
const browser = await chromium.launch({ headless: !headed });
const results: unknown[] = [];
const sourceSha256 = Object.fromEntries(await Promise.all([
  "src/game/scenes/run-scene.ts", "src/game/ui/hud.ts", "src/game/ui/minimap-ui.ts",
  "src/game/systems/spatial/spatial-hash.ts", "src/game/systems/separation/crowd-separation.ts",
  "src/game/systems/statistics/run-statistics.ts",
  "src/game/content/active-theme.ts", "src/game/ui/pause-menu-ui.ts",
  "src/game/state/settings-state.ts", "src/game/scenes/menu-scene.ts",
  "src/game/core/archetypes/tuning.ts", "src/game/content/define-theme.ts",
  "src/game/content/themes/eco-guardian/view.ts", "src/game/content/themes/knight-magic/view.ts",
].map(async (path) => [path, createHash("sha256").update(await readFile(path)).digest("hex")])));
const productionSha256 = mode === "test" ? undefined : Object.fromEntries(await Promise.all(
  (await readdir("dist/assets")).filter((name) => name.endsWith(".js")).map(async (name) =>
    [name, createHash("sha256").update(await readFile(`dist/assets/${name}`)).digest("hex")]),
));

async function startServer(buildMode: "test" | "production"): Promise<string> {
  const port = buildMode === "test" ? 4173 : 4174;
  const url = `http://127.0.0.1:${port}`;
  // A dedicated server is owned and cleaned up by this command. Never reuse an unknown process.
  if (await fetch(url).then(() => true, () => false)) {
    throw new Error(`Measurement port already serves another process: ${url}`);
  }
  const args = buildMode === "test" ? ["--mode", "test"] : ["preview"];
  const server = spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"),
    ...args, "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  servers.push(server);
  let serverOutput = "";
  server.stdout?.on("data", (chunk) => { serverOutput = (serverOutput + String(chunk)).slice(-4000); });
  server.stderr?.on("data", (chunk) => { serverOutput = (serverOutput + String(chunk)).slice(-4000); });
  let spawnError: Error | undefined;
  server.on("error", (error) => { spawnError = error; });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null) throw new Error(`Measurement server failed: ${serverOutput}`);
    try {
      if (serverOutput.includes(url) && (await fetch(url)).ok) return url;
    } catch { /* The dedicated server is still starting. */ }
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error(`Measurement server unavailable: ${serverOutput}`);
}

async function metadata(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
    const debug = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      userAgent: navigator.userAgent,
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
      canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
      renderer: gl ? {
        type: gl instanceof WebGL2RenderingContext ? "WebGL2" : "WebGL",
        vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        name: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      } : { type: "Canvas/unknown" },
      testInterface: Boolean(window.__ARENA_TEST__),
    };
  });
}

function counters(metrics: readonly { name: string; value: number }[]) {
  return Object.fromEntries(metrics.map(({ name, value }) => [name, value]));
}

const stressPath = "/?frameMeasure=1&representativeLoad=1&closeLoad=1&loadHarness=300&compoundBuild=1&critChance=3.4&pierce=12&attackSpeedBonus=9&worldScenario=all&runDurationMs=1500&noXp=1&noContact=1&atTimeUp=complete";

try {
  for (const buildMode of mode === "both" ? ["test", "production"] as const : [mode as "test" | "production"]) {
    const url = await startServer(buildMode);
    for (const loadCount of scenario === "capacity" ? loads : [0]) {
      for (const interfaceState of interfaces) for (let repeat = 1; repeat <= repeats; repeat += 1) {
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("response", (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
        page.on("console", (message) => { if (message.type() === "error") errors.push(`${message.text()} [${message.location().url}]`); });
        const startedAt = new Date().toISOString();
        const path = scenario === "capacity"
          ? `/?frameMeasure=1&representativeLoad=1&closeLoad=1&loadHarness=${loadCount}&enemyCap=${Math.max(300, loadCount)}${p3 === "combat" ? "&compoundBuild=1&critChance=1.4&pierce=8&attackSpeedBonus=3" : "&noWeapon=1"}&noContact=1${p3 === "pickups" ? "&xpLevelCap=1" : "&noXp=1"}&noHazards=1`
          : scenario === "stress" ? stressPath : buildMode === "test" ? "/?frameMeasure=1&menu=1" : "/";
        await page.goto(url + path);
        await page.waitForSelector("canvas");
        if (scenario === "default") {
          // Asset boot is outside this steady-state sample. Production has no writable state hook.
          await page.waitForTimeout(1000);
          await page.keyboard.press("Enter");
          if (buildMode === "test") await page.waitForFunction(
            () => window.__ARENA_TEST__?.getSnapshot().run?.status === "playing",
          );
        }
        if (scenario === "capacity") await page.waitForFunction((count) =>
          window.__ARENA_TEST__?.getSnapshot().load?.spawned === count, loadCount, { timeout: 60_000 });
        if (p3 !== "none") await page.evaluate(async ({ fixture, count }) => {
          const browserImport = new Function("url", "return import(url)");
          const { RunScene } = await browserImport("/src/game/scenes/run-scene.ts");
          const updateEnemies = RunScene.prototype.updateEnemies;
          let sequence = 0, nextBurstAt = 0;
          const control = { fixture, bursts: 0, replenished: 0, controllerMs: 0, activePickups: 0, trackedPickups: 0 };
          RunScene.prototype.updateEnemies = function() {
            const start = performance.now();
            if (fixture === "distributed") {
              let index = 0;
              for (const enemy of this.enemies) {
                enemy.setPosition(500 + (index % 20) * 100, 400 + Math.floor(index / 20) * 100);
                index += 1;
              }
            } else if (fixture === "pickups" && this.runState.elapsedMs >= nextBurstAt) {
              nextBurstAt = this.runState.elapsedMs + 500;
              for (let i = 0; i < 80; i += 1) this.dropExperience(100 + (i % 10) * 10, 100 + Math.floor(i / 10) * 10, 1, "ambient");
              control.bursts += 1;
            } else if (fixture === "combat" && this.runState.elapsedMs >= nextBurstAt) {
              nextBurstAt = this.runState.elapsedMs + 1000;
              control.bursts += 1;
              const vacant = Math.max(0, count - this.enemies.size);
              for (let i = 0; i < vacant; i += 1) {
                const definition = this.enemyDefinitions[(sequence++) % this.enemyDefinitions.length];
                const angle = sequence * 2.399963229728653;
                this.enqueueSpawnRequest(definition.id, "ambient", 1, undefined, undefined, "roster",
                  { x: this.player.x + Math.cos(angle) * 70, y: this.player.y + Math.sin(angle) * 70 });
                control.replenished += 1;
              }
            }
            if (fixture === "pickups") {
              control.trackedPickups = this.pickups.size;
              control.activePickups = 0;
              for (const pickup of this.pickups) if (pickup.active) control.activePickups += 1;
            }
            control.controllerMs += performance.now() - start;
            return updateEnemies.call(this);
          };
          Object.assign(window, { __P3_CONTROL__: control });
        }, { fixture: p3, count: loadCount });
        if (quality === "low") {
          await page.keyboard.press("Escape");
          await page.waitForTimeout(200);
          for (let tab = 0; tab < 4; tab += 1) {
            await page.keyboard.press("Tab");
            await page.waitForTimeout(150);
          }
          const box = await page.locator("canvas").boundingBox();
          if (!box) throw new Error("Missing canvas bounds");
          await page.locator("canvas").click({ position: { x: 1230 * box.width / 1600, y: 507.5 * box.height / 900 } });
          if (buildMode === "test") await page.waitForFunction(() =>
            (window.__ARENA_TEST__?.getSnapshot().ui?.settings as { presentationQuality?: string } | undefined)?.presentationQuality === "low");
          await page.keyboard.press("Escape");
        }
        // Exercise the real pause/settings pointer path; no writable state hook.
        if (interfaceState !== "visible") {
          await page.keyboard.press("Escape");
          await page.waitForTimeout(200);
          if (interfaceState === "hidden") {
            for (let tab = 0; tab < 4; tab += 1) {
              await page.keyboard.press("Tab");
              await page.waitForTimeout(250);
            }
            const box = await page.locator("canvas").boundingBox();
            if (!box) throw new Error("Missing canvas bounds");
            // Authored 1600×900, UI scale 1.25; default .6 → .85 → OFF.
            for (let click = 0; click < 2; click += 1) {
              await page.locator("canvas").click({ position: { x: 1230 * box.width / 1600, y: 387 * box.height / 900 } });
              await page.waitForTimeout(250);
            }
            await page.keyboard.press("Escape");
          }
          if (buildMode === "test") await page.waitForFunction((state) => {
            const snapshot = window.__ARENA_TEST__?.getSnapshot();
            return state === "paused" ? snapshot?.run?.status === "paused" :
              snapshot?.run?.status === "playing" && snapshot.ui?.settings.minimapOpacity === 0 && !snapshot.ui.minimapVisible;
          }, interfaceState);
        }
        const environment = await metadata(page);
        if (environment.testInterface !== (buildMode === "test")) throw new Error("Build-mode/test-interface mismatch");
        const cdp = await context.newCDPSession(page);
        await cdp.send("Performance.enable");

        // Ordinary input in both builds: rectangular patrol and automatic first-card choice.
        // Neither invulnerability nor a shortened run is used in the sustained default case.
        let drive = true;
        const patrol = (async () => {
          const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
          let held: string | undefined;
          let step = 0;
          while (drive && scenario === "default" && interfaceState !== "paused") {
            const next = keys[Math.floor(step / 10) % keys.length]!;
            if (next !== held) {
              if (held) await page.keyboard.up(held);
              held = next;
              await page.keyboard.down(held);
            }
            await page.keyboard.press("1");
            await page.waitForTimeout(500);
            step += 1;
          }
          if (held) await page.keyboard.up(held);
        })();
        try {
          if (scenario === "stress") {
            await page.waitForFunction(() => window.__ARENA_TEST__?.getSnapshot().run?.status === "complete", { }, { timeout: 90_000 });
            const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
            if (snapshot?.load?.spawned !== 300 || snapshot.statistics?.peakEnemiesAlive !== 300) {
              throw new Error("Stress measurement did not reach the scripted 300-enemy prerequisite");
            }
            results.push({ buildMode, scenario, interfaceState, repeat, startedAt, environment, instrumented: snapshot?.load,
              run: snapshot?.run, impact: snapshot?.impact, statistics: snapshot?.statistics, errors,
              note: "Short correctness fixture, not sustained 300-live load; noContact/noXp/compoundBuild overrides" });
          } else {
            await page.waitForTimeout(warmup * 1000);
            if (profile && buildMode === "test") await page.evaluate(async () => {
              const pathMap = "/src/game/ui/minimap-ui.ts";
              const pathHud = "/src/game/ui/hud.ts";
              const browserImport = new Function("url", "return import(url)");
              const [{ MinimapUi }, { Hud }] = await Promise.all([browserImport(pathMap), browserImport(pathHud)]);
              const counts = { mapUpdates: 0, hiddenMapUpdates: 0, mapEnemyInputs: 0, hudUpdates: 0, hudSetText: 0, hudTextureUpdates: 0 };
              const mapUpdate = MinimapUi.prototype.update;
              MinimapUi.prototype.update = function(view: { enemies: readonly unknown[] }) {
                counts.mapUpdates += 1;
                if (this.opacity === 0 || this.overlayHidden) counts.hiddenMapUpdates += 1;
                counts.mapEnemyInputs += view.enemies.length;
                return mapUpdate.call(this, view);
              };
              const hudUpdate = Hud.prototype.update;
              const attached = new WeakSet();
              Hud.prototype.update = function(...args: unknown[]) {
                counts.hudUpdates += 1;
                for (const key of ["healthLabel", "experienceLabel", "right", "status", "levelLabel"]) {
                  const text = this[key];
                  if (attached.has(text)) continue;
                  attached.add(text);
                  const setText = text.setText;
                  const updateText = text.updateText;
                  text.setText = function(...values: unknown[]) { counts.hudSetText += 1; return setText.apply(this, values); };
                  text.updateText = function(...values: unknown[]) { counts.hudTextureUpdates += 1; return updateText.apply(this, values); };
                }
                return hudUpdate.apply(this, args);
              };
              Object.assign(window, { __INTERFACE_PROFILE__: counts });
            });
            if (profile && p3 !== "none") await page.evaluate(async () => {
              const browserImport = new Function("url", "return import(url)");
              const { RunScene } = await browserImport("/src/game/scenes/run-scene.ts");
              const counts: Record<string, { calls: number; cpuMs: number }> = {};
              for (const key of ["rebuildEnemyIndex", "resolveCrowd", "fireIfReady", "processCausalEvents", "processExplosionEvent", "enforcePickupCap", "updatePickups", "commitEnemyDamage", "publishTelemetry"]) {
                const method = RunScene.prototype[key];
                counts[key] = { calls: 0, cpuMs: 0 };
                RunScene.prototype[key] = function(...args: unknown[]) {
                  const start = performance.now();
                  try { return method.apply(this, args); }
                  finally { counts[key]!.calls += 1; counts[key]!.cpuMs += performance.now() - start; }
                };
              }
              Object.assign(window, { __P3_WORK__: counts });
            });
            if (profile) {
              await cdp.send("HeapProfiler.startSampling", { samplingInterval: 16384 });
              await cdp.send("Profiler.enable");
              await cdp.send("Profiler.setSamplingInterval", { interval: 1000 });
              await cdp.send("Profiler.start");
            }
            const windowStartSnapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
            const before = counters((await cdp.send("Performance.getMetrics")).metrics);
            const sample = await page.evaluate(async (durationMs) => {
              const intervals: number[] = [];
              const stateFrames: Record<string, number> = {};
              let previous: number | undefined;
              let cursor = 0;
              let frames = 0;
              let liveMin = Infinity, liveMax = 0, visibleMin = Infinity, visibleMax = 0;
              let maxMs = 0;
              let totalMs = 0;
              const from = performance.now();
              return new Promise<{ intervals: number[]; frames: number; maxMs: number; totalMs: number; elapsedMs: number; liveMin: number; liveMax: number; visibleMin: number; visibleMax: number; stateFrames: Record<string, number> }>((done) => {
                const tick = (now: number) => {
                  if (previous !== undefined && !document.hidden) {
                    const interval = now - previous;
                    intervals[cursor] = interval;
                    cursor = (cursor + 1) % 8192;
                    frames += 1;
                    maxMs = Math.max(maxMs, interval);
                    totalMs += interval;
                    const snapshot = window.__ARENA_TEST__?.getSnapshot();
                    if (snapshot?.run) { liveMin = Math.min(liveMin, snapshot.run.liveEnemies); liveMax = Math.max(liveMax, snapshot.run.liveEnemies); }
                    if (snapshot?.view) { visibleMin = Math.min(visibleMin, snapshot.view.visibleEnemies); visibleMax = Math.max(visibleMax, snapshot.view.visibleEnemies); }
                    const status = snapshot?.run?.status ?? "unobservable-production";
                    stateFrames[status] = (stateFrames[status] ?? 0) + 1;
                  }
                  previous = document.hidden ? undefined : now;
                  if (now - from >= durationMs) done({ intervals, frames, maxMs, totalMs, elapsedMs: now - from, liveMin, liveMax, visibleMin, visibleMax, stateFrames });
                  else requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
              });
            }, seconds * 1000);
            const interfaceWork = profile && buildMode === "test" ? await page.evaluate(() =>
              (window as Window & { __INTERFACE_PROFILE__?: object }).__INTERFACE_PROFILE__) : undefined;
            const p3Work = await page.evaluate(() => {
              const diagnostic = window as Window & { __P3_WORK__?: object; __P3_CONTROL__?: object };
              return { methods: diagnostic.__P3_WORK__, control: diagnostic.__P3_CONTROL__ };
            });
            const allocationProfile = profile ? (await cdp.send("HeapProfiler.stopSampling")).profile : undefined;
            if (allocationProfile) await writeFile(`${output.replace(/\.json$/, "")}-${buildMode}-${loadCount || "default"}-${interfaceState}-${repeat}.heapprofile`, JSON.stringify(allocationProfile));
            const cpuProfile = profile ? (await cdp.send("Profiler.stop")).profile : undefined;
            if (cpuProfile) await writeFile(`${output.replace(/\.json$/, "")}-${buildMode}-${loadCount || "default"}-${interfaceState}-${repeat}.cpuprofile`, JSON.stringify(cpuProfile));
            const after = counters((await cdp.send("Performance.getMetrics")).metrics);
            drive = false;
            await patrol;
            if (buildMode === "test" && await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status === "playing")) {
              await page.keyboard.press("Escape"); // Flush exact rolling quantiles without a writable game hook.
            }
            const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
            if (scenario === "capacity" && p3 !== "combat" && (sample.liveMin !== loadCount || sample.liveMax !== loadCount ||
                Object.keys(sample.stateFrames).some((state) => state !== (interfaceState === "paused" ? "paused" : "playing")))) {
              throw new Error("Capacity window did not sustain the requested live playing population");
            }
            if (p3 === "combat") {
              if (sample.liveMax > loadCount || (snapshot?.effects?.explosionsCommitted ?? 0) <= 0 ||
                  (snapshot?.effects?.fractureSpawned ?? 0) <= 0) throw new Error("Combat fixture did not preserve cap/exercise effects/fragments");
              const ledger = Object.values(snapshot?.statistics?.damageBreakdown ?? {}).reduce((sum, value) => sum + value, 0);
              if (Math.abs(ledger - (snapshot?.statistics?.totalDamage ?? 0)) > 0.000001) throw new Error("Combat damage ledger mismatch");
            }
            const frames = new FrameMeasurements(8192);
            frames.observe({ wallFrameMs: 1, simulationDeltaMs: 0, active: true });
            for (const wallFrameMs of sample.intervals) frames.observe({ wallFrameMs, simulationDeltaMs: 0, active: true });
            const measured = frames.snapshot(true);
            const durations = Object.fromEntries(["ScriptDuration", "TaskDuration", "LayoutDuration", "RecalcStyleDuration"].map((name) => [name, (after[name] ?? 0) - (before[name] ?? 0)]));
            results.push({ buildMode, quality, scenario, interfaceState, loadCount: loadCount || undefined, repeat, startedAt, environment, warmupSeconds: warmup,
              requestedSeconds: seconds, actualSeconds: sample.elapsedMs / 1000,
              pageRaf: { capturedFrames: sample.frames, retainedFrames: sample.intervals.length,
                averageMs: sample.frames === 0 ? 0 : sample.totalMs / sample.frames,
                maxMs: sample.maxMs, distribution: measured.distribution?.wall,
                stallPercent: measured.distribution?.stallPercent, stateFrames: sample.stateFrames },
              mainThread: { units: "seconds of Chromium main-thread work over the measured page window", ...durations },
              heap: { beforeBytes: before.JSHeapUsedSize, afterBytes: after.JSHeapUsedSize, note: "GC-dependent observations, not leak evidence" },
              population: { liveMin: sample.liveMin, liveMax: sample.liveMax, visibleMin: sample.visibleMin, visibleMax: sample.visibleMax },
              windowStart: { kills: windowStartSnapshot?.statistics?.kills, effects: windowStartSnapshot?.effects, elapsedMs: windowStartSnapshot?.run?.elapsedMs },
              spawnOrigins: snapshot?.spawnOrigins,
              interfaceWork, p3Work, combat: snapshot?.combat, progression: snapshot?.progression, crowd: snapshot?.crowd, effects: snapshot?.effects, statistics: snapshot?.statistics, instrumented: snapshot?.load, run: snapshot?.run, impact: snapshot?.impact, errors,
              note: (p3 !== "none" ? `P3 ${p3}: measurement-only controller; inspect control/actual population, not sustained 300 combat. ` : "") + (interfaceState === "paused" ? "Paused overlay: page/render activity; active-update sampler belongs to pre-pause play, not this window. " : "") + (scenario === "capacity" ? "Controlled mixed crowd; see P3 fixture/options for gameplay overrides. Test instrumentation included, not combat/device acceptance. " : "") + "Page rAF includes menus/choices/feedback; production state unavailable. Instrumented active metrics begin at scene creation and use a rolling 4096-sample window. No hardware acceptance or causal cost attribution." });
          }
          if (screenshotDirectory) {
            const screenshot = resolve(screenshotDirectory, `${buildMode}-${scenario}-${interfaceState}-${loadCount || "default"}-${repeat}.png`);
            await page.screenshot({ path: screenshot });
            Object.assign(results.at(-1) as object, { screenshot });
          }
          console.log(JSON.stringify({ buildMode, scenario, interfaceState, loadCount: loadCount || undefined, repeat, complete: true, errors }));
          if (errors.length > 0) throw new Error(`Browser errors: ${errors.join("; ")}`);
        } finally {
          drive = false;
          await patrol;
          await context.close();
        }
      }
    }
  }
} finally {
  try {
    await writeFile(output, JSON.stringify({
    recordedAt: new Date().toISOString(), sourceSha256, productionSha256,
    revision: argument("source-revision", "") || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    workingTree: argument("source-state", "") || execFileSync("git", ["status", "--short"], { encoding: "utf8" }),
    device: { cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, memoryBytes: os.totalmem(),
      platform: os.platform(), release: os.release(), arch: os.arch(), node: process.version },
    browserVersion: browser.version(), options: { seconds, warmup, repeats, mode, scenario, headed, interfaces, profile, p3, quality, loads: scenario === "capacity" ? loads : undefined }, results,
    }, null, 2) + "\n");
  } finally {
    try {
      await browser.close();
    } finally {
      for (const server of servers) server.kill("SIGTERM");
    }
  }
}

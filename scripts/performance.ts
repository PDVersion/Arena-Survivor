import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import os from "node:os";
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
const headed = process.argv.includes("--headed");
const loads = argument("loads", "150,300,450,600").split(",").map(Number);
const output = resolve(argument("output", "build/performance/P0_SAMPLES.json"));
const screenshotDirectory = argument("screenshots", "");
if (!Number.isFinite(seconds) || seconds < 1 || seconds > 300 ||
    !Number.isFinite(warmup) || warmup < 0 || warmup > 60 ||
    !Number.isInteger(repeats) || repeats < 1 || repeats > 10 ||
    !["both", "test", "production"].includes(mode) ||
    !["default", "stress", "capacity"].includes(scenario) || (scenario !== "default" && mode !== "test") ||
    loads.some((count) => !Number.isInteger(count) || count < 1 || count > 1000)) {
  throw new Error("Use seconds 1–300, warmup 0–60, repeats 1–10, mode both/test/production; stress/capacity are test-only; loads must be 1–1000");
}
await mkdir(dirname(output), { recursive: true });
if (screenshotDirectory) await mkdir(resolve(screenshotDirectory), { recursive: true });

const servers: ChildProcess[] = [];
const browser = await chromium.launch({ headless: !headed });
const results: unknown[] = [];

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
      for (let repeat = 1; repeat <= repeats; repeat += 1) {
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("response", (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
        page.on("console", (message) => { if (message.type() === "error") errors.push(`${message.text()} [${message.location().url}]`); });
        const startedAt = new Date().toISOString();
        const path = scenario === "capacity"
          ? `/?frameMeasure=1&representativeLoad=1&closeLoad=1&loadHarness=${loadCount}&enemyCap=${Math.max(300, loadCount)}&noWeapon=1&noContact=1&noXp=1&noHazards=1`
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
          while (drive && scenario === "default") {
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
            results.push({ buildMode, scenario, repeat, startedAt, environment, instrumented: snapshot?.load,
              run: snapshot?.run, impact: snapshot?.impact, statistics: snapshot?.statistics, errors,
              note: "Short correctness fixture, not sustained 300-live load; noContact/noXp/compoundBuild overrides" });
          } else {
            await page.waitForTimeout(warmup * 1000);
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
            const after = counters((await cdp.send("Performance.getMetrics")).metrics);
            drive = false;
            await patrol;
            if (buildMode === "test" && await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status === "playing")) {
              await page.keyboard.press("Escape"); // Flush exact rolling quantiles without a writable game hook.
            }
            const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
            if (scenario === "capacity" && (sample.liveMin !== loadCount || sample.liveMax !== loadCount ||
                Object.keys(sample.stateFrames).some((state) => state !== "playing"))) {
              throw new Error("Capacity window did not sustain the requested live playing population");
            }
            const frames = new FrameMeasurements(8192);
            frames.observe({ wallFrameMs: 1, simulationDeltaMs: 0, active: true });
            for (const wallFrameMs of sample.intervals) frames.observe({ wallFrameMs, simulationDeltaMs: 0, active: true });
            const measured = frames.snapshot(true);
            const durations = Object.fromEntries(["ScriptDuration", "TaskDuration", "LayoutDuration", "RecalcStyleDuration"].map((name) => [name, (after[name] ?? 0) - (before[name] ?? 0)]));
            results.push({ buildMode, scenario, loadCount: loadCount || undefined, repeat, startedAt, environment, warmupSeconds: warmup,
              requestedSeconds: seconds, actualSeconds: sample.elapsedMs / 1000,
              pageRaf: { capturedFrames: sample.frames, retainedFrames: sample.intervals.length,
                averageMs: sample.frames === 0 ? 0 : sample.totalMs / sample.frames,
                maxMs: sample.maxMs, distribution: measured.distribution?.wall,
                stallPercent: measured.distribution?.stallPercent, stateFrames: sample.stateFrames },
              mainThread: { units: "seconds of Chromium main-thread work over the measured page window", ...durations },
              heap: { beforeBytes: before.JSHeapUsedSize, afterBytes: after.JSHeapUsedSize, note: "GC-dependent observations, not leak evidence" },
              population: { liveMin: sample.liveMin, liveMax: sample.liveMax, visibleMin: sample.visibleMin, visibleMax: sample.visibleMax },
              spawnOrigins: snapshot?.spawnOrigins,
              instrumented: snapshot?.load, run: snapshot?.run, impact: snapshot?.impact, errors,
              note: (scenario === "capacity" ? "Controlled mixed crowd with no weapon/contact/XP/hazards; test instrumentation included. Not combat/device acceptance. " : "") + "Page rAF includes menus/choices/feedback; production state unavailable. Instrumented active metrics begin at scene creation and use a rolling 4096-sample window. No hardware acceptance or causal cost attribution." });
          }
          if (screenshotDirectory) {
            const screenshot = resolve(screenshotDirectory, `${buildMode}-${scenario}-${loadCount || "default"}-${repeat}.png`);
            await page.screenshot({ path: screenshot });
            Object.assign(results.at(-1) as object, { screenshot });
          }
          console.log(JSON.stringify({ buildMode, scenario, loadCount: loadCount || undefined, repeat, complete: true, errors }));
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
    recordedAt: new Date().toISOString(),
    revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    workingTree: execFileSync("git", ["status", "--short"], { encoding: "utf8" }),
    device: { cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, memoryBytes: os.totalmem(),
      platform: os.platform(), release: os.release(), arch: os.arch(), node: process.version },
    browserVersion: browser.version(), options: { seconds, warmup, repeats, mode, scenario, headed, loads: scenario === "capacity" ? loads : undefined }, results,
    }, null, 2) + "\n");
  } finally {
    try {
      await browser.close();
    } finally {
      for (const server of servers) server.kill("SIGTERM");
    }
  }
}

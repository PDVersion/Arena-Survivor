import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
import { createHash } from "node:crypto";
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { activeTheme } from "../src/game/content/active-theme";

type Probe = { menuTextMs: number | null; hudTextMs: number | null; rendererDetail: string | null; menuMs: number | null; runMs: number | null; inputMs: number | null; textureCalls: number; textureCpuMs: number; renderer: string | null; textures: number | null };
type ProbeWindow = Window & { __P5_STARTUP_PROBE__: Probe };
const args = process.argv.slice(2);
const value = (key: string, fallback: string) => { const index = args.indexOf(key); return index < 0 ? fallback : args[index + 1] ?? fallback; };
const output = value("--output", "build/performance/P5_STARTUP_SAMPLES.json");
const pairs = Number(args.includes("--pairs") ? value("--pairs", "1") : 3);
if (![0, 1, 3].includes(pairs)) throw new Error("Use 0, 1 or 3 cold/warm pairs");
const url = "http://127.0.0.1:4174";
const emitted = await Promise.all((await readdir("dist/assets")).filter((n) => n.endsWith(".js")).map(async (name) => ({ name, code: await readFile(`dist/assets/${name}`, "utf8") })));
for (const { name, code } of emitted) for (const marker of ["__ARENA_TEST__", "summaryMetrics:", "liveByRole:", "averageSimulationDeltaMs:", "xpByBucket:", "__P5_STARTUP_PROBE__"]) {
  if (code.includes(marker)) throw new Error(`Production retains ${marker} in ${name}`);
}
if (await fetch(url).then(() => true, () => false)) throw new Error("Port 4174 already in use; leave unknown server alone");
const server = spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"), "preview", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], { stdio: "ignore" });
let browser: Browser | undefined;
const records: unknown[] = [];
async function instrument(context: BrowserContext, fault: string): Promise<void> {
  await context.addInitScript(({ fault, title, health }) => {
    const probe: Probe = { menuTextMs: null, hudTextMs: null, rendererDetail: null, menuMs: null, runMs: null, inputMs: null, textureCalls: 0, textureCpuMs: 0, renderer: null, textures: null };
    (window as unknown as ProbeWindow).__P5_STARTUP_PROBE__ = probe;
    const draw = (renderer: string) => {
      if (probe.menuTextMs !== null && probe.menuMs === null) probe.menuMs = performance.now();
      if (probe.hudTextMs !== null && probe.runMs === null) probe.runMs = performance.now();
      probe.renderer = renderer;
    };
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(this: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth?: number) {
      if (text === title && probe.menuTextMs === null) probe.menuTextMs = performance.now();
      if (text.startsWith(`${health}:`) && probe.hudTextMs === null) probe.hudTextMs = performance.now();
      return maxWidth === undefined ? fillText.call(this, text, x, y) : fillText.call(this, text, x, y, maxWidth);
    };
    const drawImage = CanvasRenderingContext2D.prototype.drawImage;
    Object.defineProperty(CanvasRenderingContext2D.prototype, "drawImage", { configurable: true, writable: true, value: function(this: CanvasRenderingContext2D, ...args: unknown[]) {
      const result = Reflect.apply(drawImage, this, args);
      if (this.canvas.parentElement?.id === "game-container") draw("Canvas");
      return result;
    } });
    window.addEventListener("keydown", (event) => { if (event.code === "Enter" && probe.inputMs === null) probe.inputMs = performance.now(); });
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, kind: string, ...options: unknown[]) {
      if ((fault === "canvas" && /webgl/.test(kind)) || (fault === "no-renderer" && /^(2d|webgl|webgl2|experimental-webgl)$/.test(kind))) return null;
      return Reflect.apply(getContext, this, [kind, ...options]);
    } as typeof getContext;
    if (typeof WebGLRenderingContext !== "undefined") {
      const upload = WebGLRenderingContext.prototype.texImage2D;
      const textures = new Set<WebGLTexture>();
      Object.defineProperty(WebGLRenderingContext.prototype, "texImage2D", { configurable: true, writable: true, value: function(this: WebGLRenderingContext, ...args: unknown[]) {
        const start = performance.now();
        try { return Reflect.apply(upload, this, args); }
        finally {
          probe.textureCalls += 1; probe.textureCpuMs += performance.now() - start;
          const texture = this.getParameter(this.TEXTURE_BINDING_2D) as WebGLTexture | null;
          if (texture) textures.add(texture);
          probe.textures = textures.size;
        }
      } });
      const elements = WebGLRenderingContext.prototype.drawArrays;
      Object.defineProperty(WebGLRenderingContext.prototype, "drawArrays", { configurable: true, writable: true, value: function(this: WebGLRenderingContext, ...args: unknown[]) {
        const result = Reflect.apply(elements, this, args);
        if (this.canvas instanceof HTMLCanvasElement && this.canvas.parentElement?.id === "game-container") {
          draw("WebGL");
          if (probe.rendererDetail === null) {
            const debug = this.getExtension("WEBGL_debug_renderer_info");
            if (debug) probe.rendererDetail = String(this.getParameter(debug.UNMASKED_RENDERER_WEBGL));
          }
        }
        return result;
      } });
    }
  }, { fault, title: activeTheme.copy.gameTitle, health: activeTheme.copy.vocabulary.health });
}
async function sample(page: Page, label: string, reload: boolean | "retry" = false, expectFailure = false) {
  const errors: string[] = [];
  const onError = (error: Error) => errors.push(error.message);
  page.on("pageerror", onError);
  if (reload === "retry") await Promise.all([page.waitForNavigation({ waitUntil: "load" }), page.locator(".boot-failure button").click()]);
  else if (reload) await page.reload({ waitUntil: "load" }); else await page.goto(url, { waitUntil: "load" });
  let ready = false;
  try {
    await page.waitForFunction(() => {
      const host = window as unknown as ProbeWindow;
      return host.__P5_STARTUP_PROBE__?.menuMs !== null || Boolean(document.querySelector(".boot-failure"));
    }, undefined, { timeout: expectFailure ? 3000 : 20_000 });
    ready = await page.evaluate(() => (window as unknown as ProbeWindow).__P5_STARTUP_PROBE__.menuMs !== null);
  } catch { /* Record failed startup honestly, including pre-fix fault behavior. */ }
  if (ready && !expectFailure) {
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => (window as unknown as ProbeWindow).__P5_STARTUP_PROBE__.runMs !== null, undefined, { timeout: 10_000 });
  }
  const state = await page.evaluate(() => {
    const host = window as unknown as ProbeWindow;
    const probe = host.__P5_STARTUP_PROBE__;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const resources = (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).map((r) => ({ path: new URL(r.name).pathname, startMs: r.startTime, responseEndMs: r.responseEnd, durationMs: r.duration, transferBytes: r.transferSize, encodedBytes: r.encodedBodySize, decodedBytes: r.decodedBodySize }));
    return { ...probe, inputToRunFrameMs: probe.runMs === null || probe.inputMs === null ? null : probe.runMs - probe.inputMs,
      loadEndMs: navigation.loadEventEnd, domReadyMs: navigation.domContentLoadedEventEnd, resources,
      failureText: document.querySelector(".boot-failure")?.textContent ?? null,
      retryButton: document.querySelector(".boot-failure button")?.textContent ?? null,
      testInterfaceAbsent: !("__ARENA_TEST__" in window), canvasCount: document.querySelectorAll("#game-container canvas").length };
  });
  page.off("pageerror", onError);
  if (args.includes("--verify") && expectFailure) {
    const button = page.locator(".boot-failure button");
    const box = await button.boundingBox();
    const viewport = page.viewportSize()!;
    if (!box || box.x < 0 || box.y < 0 || box.x + box.width > viewport.width || box.y + box.height > viewport.height) throw new Error(`${label} retry control outside viewport`);
    await page.screenshot({ path: `/private/tmp/arena-p5-startup-session/${label}.png` });
  }
  if (!state.testInterfaceAbsent) throw new Error("Production test interface leaked");
  if (args.includes("--verify") && expectFailure && (ready || !state.failureText || !state.retryButton || errors.length)) throw new Error(`${label} recovery failed: ${JSON.stringify({ ready, state, errors })}`);
  if (!expectFailure && (!ready || errors.length)) throw new Error(`${label} did not boot: ${errors.join("; ")}`);
  records.push({ label, ready, expectedFailure: expectFailure, errors, ...state });
  console.log(JSON.stringify({ label, ready, menuMs: state.menuMs, runMs: state.runMs, failureText: state.failureText, errors }));
  return state;
}
try {
  browser = await chromium.launch();
  for (let attempt = 0; ; attempt++) {
    if (await fetch(url).then((r) => r.ok, () => false)) break;
    if (attempt === 100) throw new Error("Preview failed to start");
    await new Promise((done) => setTimeout(done, 100));
  }
  for (let repeat = 1; repeat <= pairs; repeat++) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    try {
      await instrument(context, "none");
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.clearBrowserCache");
      await sample(page, `cold-${repeat}`);
      await sample(page, `warm-${repeat}`, true);
    } finally { await context.close(); }
  }
  if (!args.includes("--normal-only")) for (const fault of ["canvas", "no-renderer", "asset", "module"]) {
    const context = await browser.newContext({ viewport: { width: 900, height: 600 } });
    try {
      await instrument(context, fault);
      if (fault === "module") await context.route("**/assets/start-game-*.js", (route) => route.abort("failed"));
      if (fault === "asset") await context.route("**/sprites/**/*.png", (route) => route.abort("failed"));
      const page = await context.newPage();
      await sample(page, fault, false, fault !== "canvas");
      if (["asset", "module"].includes(fault) && args.includes("--verify")) {
        await context.unroute(fault === "asset" ? "**/sprites/**/*.png" : "**/assets/start-game-*.js");
        await sample(page, `${fault}-retry`, "retry");
      }
    } finally { await context.close(); }
  }
  if (args.includes("--slow")) {
    const context = await browser.newContext({ viewport: { width: 900, height: 600 } });
    try {
      await instrument(context, "none");
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.clearBrowserCache");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 100, downloadThroughput: 200_000, uploadThroughput: 100_000 });
      await sample(page, "slow-100ms-200KBps");
    } finally { await context.close(); }
  }
  if (args.includes("--decode")) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    try {
      await instrument(context, "none");
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.clearBrowserCache");
      const complete = new Promise<string>((done) => cdp.once("Tracing.tracingComplete", (event) => done(event.stream!)));
      await cdp.send("Tracing.start", { categories: "devtools.timeline,disabled-by-default-devtools.timeline,cc", transferMode: "ReturnAsStream" });
      await sample(page, "decode-probe-traced");
      await cdp.send("Tracing.end");
      const stream = await complete;
      let raw = "";
      for (;;) {
        const chunk = await cdp.send("IO.read", { handle: stream });
        raw += chunk.data;
        if (chunk.eof) break;
      }
      await cdp.send("IO.close", { handle: stream });
      const events = (JSON.parse(raw).traceEvents as { name: string; ph: string; dur?: number }[]).filter((event) => /decode.*image|image.*decode/i.test(event.name));
      const names = [...new Set(events.map((event) => event.name))];
      records.push({ label: "image-decode-trace", names, byName: names.map((name) => ({ name, count: events.filter((e) => e.name === name).length, completeDurationMs: events.filter((e) => e.name === name && e.ph === "X").reduce((sum, e) => sum + (e.dur ?? 0), 0) / 1000 })), eventCount: events.length, completeDurationMs: events.filter((e) => e.ph === "X").reduce((sum, e) => sum + (e.dur ?? 0), 0) / 1000,
        scope: "Separate traced probe; durations are summed complete trace spans, may overlap/nest across threads, not critical-path or GPU time. No captured event is reported as no evidence, not zero decode cost." });
    } finally { await context.close(); }
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ recordedAt: new Date().toISOString(), browser: browser.version(), host: { cpu: os.cpus()[0]?.model, memoryGiB: os.totalmem() / 2 ** 30, platform: os.platform(), release: os.release() }, viewport: { default: "1280x720", faults: "900x600", dpr: 1 }, mode: "production", source: value("--source-revision", "working-tree; see bundle digests and the accompanying report"), diagnosticMarkersAbsent: true, bundleDigests: emitted.map(({ name, code }) => ({ name, sha256: createHash("sha256").update(code).digest("hex") })), timing: "Navigation-start-relative ms; first on-screen draw after title/HUD text creation, not exact compositor presentation. Browser rendering-call observers add overhead. HTTP cache cold, not process/OS cold. ResourceTiming decodedBytes means decompressed bytes, not image decode CPU.", records }, null, 2) + "\n");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await new Promise<void>((done) => { if (server.exitCode !== null) done(); else server.once("exit", () => done()); });
}

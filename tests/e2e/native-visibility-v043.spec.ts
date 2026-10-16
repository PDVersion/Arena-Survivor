import { expect, test } from "@playwright/test";
import { cpus, release, tmpdir, totalmem } from "node:os";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";

const enabled = process.env.ARENA_NATIVE_VISIBILITY === "1";

// A focused acceptance check, not a headless regression or throughput test.
// Run with ARENA_NATIVE_VISIBILITY=1 and --headed, one worker/zero retries.
test("@native-visibility same-window tabs freeze and resume the run without catch-up", async ({ playwright }, testInfo) => {
  test.skip(!enabled, "Requires explicit headed native tab visibility acceptance");
  test.setTimeout(30_000);
  const profile = await mkdtemp(join(tmpdir(), "arena-native-"));
  const child = spawn(playwright.chromium.executablePath(), [
    `--user-data-dir=${profile}`, "--remote-debugging-port=0", "--no-first-run",
    "--no-default-browser-check", "--window-size=1280,800", "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let browser: Awaited<ReturnType<typeof playwright.chromium.connectOverCDP>> | undefined;
  try {
    const endpoint = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Native Chromium endpoint unavailable")), 5000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      let stderr = "";
      child.stderr!.on("data", (data: Buffer) => {
        stderr += data.toString();
        const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timer); resolve(match[1]!); }
      });
    });
    browser = await playwright.chromium.connectOverCDP(endpoint, { noDefaults: true, timeout: 5000 });
    const context = browser.contexts()[0]!;
    const page = context.pages()[0]!;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const session = await context.newCDPSession(page);
    let other: Awaited<ReturnType<typeof context.newPage>> | undefined;
    let otherSession: Awaited<ReturnType<typeof context.newCDPSession>> | undefined;
    try {
      // Attach with noDefaults to the external browser's default context:
      // focus/media emulation is never installed in either tab.
      await page.goto(new URL("/?noContact=1&noXp=1&noHazards=1&noWeapon=1", testInfo.project.use.baseURL).href);
      await page.bringToFront();
      await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");
      await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe("visible");
      const windowInfo = await session.send("Browser.getWindowForTarget");
      const renderer = await page.evaluate(() => {
        const canvas = document.querySelector("canvas")!;
        const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
        const debug = gl?.getExtension("WEBGL_debug_renderer_info");
        return { kind: gl ? "WebGL" : "Canvas", detail: debug && gl ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) as string : null, dpr: devicePixelRatio };
      });
      const native = await page.evaluateHandle(() => {
        const sample = () => {
          const snapshot = window.__ARENA_TEST__!.getSnapshot();
          return { elapsed: snapshot.run!.elapsedMs, status: snapshot.run!.status, spawns: snapshot.spawnOrigins, loadBacklog: snapshot.load?.eventBacklog, gameplayBacklog: snapshot.effects?.eventBacklog, processedEvents: snapshot.effects?.processedEvents, rate: snapshot.pacing?.gameplayRate };
        };
        const record = { before: sample(), events: [] as { type: string; trusted: boolean; at: number; sample: ReturnType<typeof sample> }[], firstAdvance: null as ReturnType<typeof sample> | null, armed: false };
        const observe = (event: Event) => {
          record.events.push({ type: event.type === "visibilitychange" ? document.visibilityState : event.type, trusted: event.isTrusted, at: performance.now(), sample: sample() });
          if (document.visibilityState === "visible" && event.type === "visibilitychange") record.armed = true;
        };
        document.addEventListener("visibilitychange", observe);
        window.addEventListener("blur", observe);
        window.addEventListener("focus", observe);
        const frame = () => {
          if (record.armed && record.firstAdvance === null) {
            const hidden = record.events.find((event) => event.type === "hidden");
            const current = sample();
            if (hidden && current.elapsed > hidden.sample.elapsed) record.firstAdvance = current;
          }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        return record;
      });
      // Both pages are tabs in the SAME native Chromium window. Fail the setup
      // instead of treating another window or synthetic event as equivalent.
      other = await context.newPage();
      otherSession = await context.newCDPSession(other);
      const otherWindow = await otherSession.send("Browser.getWindowForTarget");
      expect(otherWindow.windowId).toBe(windowInfo.windowId);
      await other.bringToFront();
      await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe("hidden");
      const hidden = await page.evaluate(() => window.__ARENA_TEST__!.getSnapshot());
      await page.waitForTimeout(1200); // one bounded native hidden interval
      const held = await page.evaluate(() => window.__ARENA_TEST__!.getSnapshot());
      expect(held.run?.elapsedMs).toBe(hidden.run?.elapsedMs);
      expect(held.spawnOrigins).toEqual(hidden.spawnOrigins);
      expect(held.load?.eventBacklog).toBe(hidden.load?.eventBacklog);
      expect(held.effects?.eventBacklog).toBe(hidden.effects?.eventBacklog);
      await page.bringToFront();
      await expect.poll(() => native.evaluate((record) => record.firstAdvance !== null)).toBe(true);
      const result = await native.jsonValue();
      const visibility = result.events.filter((event) => event.type === "hidden" || event.type === "visible");
      expect(visibility.map((event) => event.type)).toEqual(["hidden", "visible"]);
      expect(result.events.every((event) => event.trusted)).toBe(true);
      expect(result.firstAdvance!.rate).toBe(0.5);
      expect(result.firstAdvance!.status).toBe("playing");
      expect(result.firstAdvance!.elapsed - visibility[0]!.sample.elapsed).toBeLessThan(250);
      expect(result.firstAdvance!.gameplayBacklog).toBe(0);
      expect(result.firstAdvance!.loadBacklog).toBe(0);
      expect(errors).toEqual([]);
      const record = { source: "b8114cb plus acceptance fixture only", browser: browser.version(), host: { cpu: cpus()[0]?.model, release: release(), platform: process.platform, memoryGiB: totalmem() / 1024 ** 3 }, viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })), renderer, mode: "test/default", windowId: windowInfo.windowId, otherWindowId: otherWindow.windowId, hidden, held, result, errors };
      const output = testInfo.outputPath("native-visibility.json");
      await writeFile(output, JSON.stringify(record, null, 2));
      await testInfo.attach("native-visibility", { path: output, contentType: "application/json" });
      await native.dispose();
    } finally {
      await otherSession?.detach();
      await other?.close();
      await session.detach();
    }
  } finally {
    try {
      await browser?.close();
    } finally {
      try {
        if (child.pid && child.exitCode === null && child.signalCode === null) {
          const exited = once(child, "exit");
          const terminate = setTimeout(() => child.kill("SIGKILL"), 2000);
          child.kill("SIGTERM");
          try { await exited; } finally { clearTimeout(terminate); }
        }
      } finally {
        await rm(profile, { recursive: true, force: true });
      }
    }
  }
});

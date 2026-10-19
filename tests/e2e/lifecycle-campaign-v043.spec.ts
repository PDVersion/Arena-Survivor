import { expect, test } from "@playwright/test";
import { cpus, release, totalmem, tmpdir } from "node:os";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";

const enabled = process.env.ARENA_P5_CAMPAIGN === "1";
const preflight = process.env.ARENA_P5_PREFLIGHT === "1";

test("@p5-campaign consolidated native overlays and sustained ownership", async ({ playwright }, testInfo) => {
  test.skip(!enabled, "Owner-authorized serial campaign only");
  test.setTimeout(preflight ? 120_000 : 27 * 60_000);
  const profile = await mkdtemp(join(tmpdir(), "arena-p5-campaign-"));
  const child = spawn(playwright.chromium.executablePath(), [`--user-data-dir=${profile}`, "--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check", "--window-size=1280,800", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  let browser: Awaited<ReturnType<typeof playwright.chromium.connectOverCDP>> | undefined;
  const records: object[] = [], errors: string[] = [];
  let diagnose: (() => Promise<object>) | undefined;
  const output = testInfo.outputPath(preflight ? "campaign-preflight.json" : "campaign.json");
  const write = async (extra: object = {}) => writeFile(output, JSON.stringify({ preflight, source: "e2e8111 plus test-only campaign fixture", records, errors, ...extra }, null, 2));
  try {
    const endpoint = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Native browser startup exceeded five seconds")), 5000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      let stderr = "";
      child.stderr!.on("data", (data: Buffer) => { stderr += data.toString(); const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timer); resolve(match[1]!); } });
    });
    browser = await playwright.chromium.connectOverCDP(endpoint, { noDefaults: true, timeout: 5000 });
    const context = browser.contexts()[0]!;
    await context.addInitScript(() => {
      const Native = window.AudioContext;
      const records: object[] = [];
      Reflect.set(window, "__P5_AUDIO__", records);
      window.AudioContext = class extends Native {
        constructor(options?: AudioContextOptions) {
          super(options);
          const record = { created: performance.now(), closeCalls: 0, settled: false, before: "", after: "", nodes: 0, ended: 0 };
          records.push(record);
          const close = this.close.bind(this), oscillator = this.createOscillator.bind(this);
          this.createOscillator = () => { const node = oscillator(); record.nodes++; node.addEventListener("ended", () => record.ended++); return node; };
          this.close = () => { record.closeCalls++; record.before = this.state; const promise = close(); void promise.then(() => { record.settled = true; record.after = this.state; }); return promise; };
        }
      };
    });
    const page = context.pages()[0]!;
    page.on("pageerror", (error) => errors.push(error.message));
    // Establish the second same-window tab BEFORE constructing the game.
    const other = await context.newPage();
    await page.goto(new URL("/tests/fixtures/p5-campaign.html?noContact=1&noHazards=1", testInfo.project.use.baseURL).href);
    await page.bringToFront();
    const session = await context.newCDPSession(page), otherSession = await context.newCDPSession(other);
    const firstWindow = await session.send("Browser.getWindowForTarget"), secondWindow = await otherSession.send("Browser.getWindowForTarget");
    expect(firstWindow.windowId).toBe(secondWindow.windowId);
    const fixture = await page.evaluateHandle(async () => { const path = "/tests/fixtures/p5-campaign.ts"; return (await import(path)).createCampaign(); });
    const sample = () => fixture.evaluate((f) => f.capture());
    diagnose = sample;
    const waitStatus = (status: string, timeout = 10_000) => expect.poll(async () => (await sample()).status, { timeout }).toBe(status);
    const metadata = await page.evaluate(() => {
      const canvas = document.querySelector("canvas")!, gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      const debug = gl?.getExtension("WEBGL_debug_renderer_info");
      return { viewport: { width: innerWidth, height: innerHeight }, dpr: devicePixelRatio, renderer: gl ? "WebGL" : "Canvas", detail: gl && debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null };
    });
    records.push({ label: "environment", browser: browser.version(), host: { cpu: cpus()[0]?.model, platform: process.platform, release: release(), memoryGiB: totalmem() / 1024 ** 3 }, ...metadata, windowIds: [firstWindow.windowId, secondWindow.windowId], mode: "test/default", survivalAids: ["noContact", "noHazards"], authoredDuration: 300_000, rate: 0.5 });
    await page.locator("canvas").click({ position: { x: 25, y: 25 } });
    await fixture.evaluate((f) => f.watchAudio());
    expect(await fixture.evaluate((f) => f.tone())).toBe(true);
    await fixture.evaluate((f) => f.mute());
    await session.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    const started = Date.now();
    const nativeRound = async (label: string, status: string) => {
      await session.send("Emulation.setFocusEmulationEnabled", { enabled: false });
      await page.bringToFront();
      await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe("visible");
      const observer = await page.evaluateHandle(() => {
        const events: { kind: string; trusted: boolean; elapsed: number | undefined; status: string | undefined }[] = [];
        const listener = (event: Event) => { const snapshot = window.__ARENA_TEST__?.getSnapshot(); events.push({ kind: event.type === "visibilitychange" ? document.visibilityState : event.type, trusted: event.isTrusted, elapsed: snapshot?.run?.elapsedMs, status: snapshot?.run?.status }); };
        document.addEventListener("visibilitychange", listener); window.addEventListener("blur", listener); window.addEventListener("focus", listener);
        return { events, remove() { document.removeEventListener("visibilitychange", listener); window.removeEventListener("blur", listener); window.removeEventListener("focus", listener); } };
      });
      const before = await sample();
      await other.bringToFront();
      await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe("hidden");
      await page.waitForTimeout(350);
      const held = await sample();
      expect(held.elapsed).toBe(before.elapsed);
      expect(held.spawns).toEqual(before.spawns);
      expect(held.queues).toEqual(before.queues);
      await page.bringToFront();
      await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe("visible");
      await waitStatus(status);
      const after = await sample(), events = await observer.evaluate((o) => { o.remove(); return o.events; });
      expect(events.filter((event) => ["hidden", "visible"].includes(event.kind)).map((event) => event.kind)).toEqual(["hidden", "visible"]);
      expect(events.every((event) => event.trusted)).toBe(true);
      records.push({ label, focusEmulation: false, before, held, after, events });
      await observer.dispose(); await write();
    };
    // Pending genuine spawn work survives manual pause/native hide, then drains
    // only when the owner resumes, with one benchmark-origin arrival.
    await page.keyboard.press("Escape", { delay: 80 }); await waitStatus("paused");
    const beforePending = await sample();
    expect(await fixture.evaluate((f) => f.seedPending())).toBeGreaterThan(0);
    await nativeRound("manual-pause-with-pending-spawn", "paused");
    await session.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.keyboard.press("Escape", { delay: 80 }); await waitStatus("playing");
    await expect.poll(async () => (await sample()).spawns.spawned.benchmark).toBe(beforePending.spawns.spawned.benchmark + 1);
    await expect.poll(async () => (await sample()).queues.gameplay.backlog).toBe(0);
    await fixture.evaluate((f) => f.rewardForOverlay()); await waitStatus("level_up");
    await nativeRound("level-up-retains-choice", "level_up");
    await session.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await fixture.evaluate((f) => f.chooseUpgrade());
    while ((await sample()).status === "level_up") await fixture.evaluate((f) => f.chooseUpgrade());
    // Native checks above are complete. Explicitly isolate sustained gameplay
    // from unrelated desktop focus changes; never count this phase as native.
    await session.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    records.push({ label: "sustained-focus-policy", focusEmulation: true, nativeEvidence: false });
    if (preflight) await fixture.evaluate((f) => f.shorten());
    let nextReport = 0, nextSetting = Date.now() + 60_000, direction = "";
    const tick = async (allowSettings: boolean) => {
      let state = await sample();
      if (state.status === "level_up") { await fixture.evaluate((f) => f.chooseUpgrade()); state = await sample(); }
      if (state.status === "dead") throw new Error("Survival-aided sustained run died unexpectedly");
      if (Date.now() >= nextReport) {
        expect(state.enemies).toBeLessThanOrEqual(300); expect(state.pickups).toBeLessThanOrEqual(250);
        expect(state.bodies).toBeLessThanOrEqual(1 + state.enemies + state.pickups + state.projectiles + state.pendingBodies);
        records.push({ label: "sustained", wallElapsedMs: Date.now() - started, ...state });
        console.log(`P5 campaign ${Math.round((Date.now() - started) / 1000)}s: ${state.status}/${state.mode} sim=${Math.round(state.elapsed)} enemies=${state.enemies} pickups=${state.pickups} bodies=${state.bodies}`);
        await write(); nextReport = Date.now() + (preflight ? 2000 : 30_000);
      }
      if (allowSettings && Date.now() >= nextSetting && state.status === "playing") {
        await page.keyboard.press("Escape", { delay: 80 }); await waitStatus("paused");
        const paused = await sample(); await fixture.evaluate((f) => f.quality());
        const small = paused.quality !== "low";
        await session.send("Browser.setWindowBounds", { windowId: firstWindow.windowId, bounds: { width: small ? 1000 : 1280, height: small ? 750 : 800 } });
        expect((await sample()).elapsed).toBe(paused.elapsed);
        records.push({ label: "pause-resize-quality", before: paused, after: await sample() });
        await page.keyboard.press("Escape", { delay: 80 }); await waitStatus("playing"); nextSetting = Date.now() + 120_000;
      }
      const nextDirection = ["d", "s", "a", "w"][Math.floor((Date.now() - started) / 15_000) % 4]!;
      if (direction !== nextDirection) { if (direction) await page.keyboard.up(direction); await page.keyboard.down(nextDirection); direction = nextDirection; }
      await page.waitForTimeout(500);
    };
    const authoredDeadline = Date.now() + (preflight ? 15_000 : 14 * 60_000);
    while ((await sample()).status !== "time_up") { if (Date.now() > authoredDeadline) throw new Error("Authored clock missed its bounded deadline"); await tick(true); }
    if (direction) await page.keyboard.up(direction); direction = "";
    const authored = await sample();
    expect(authored.elapsed).toBe(preflight ? 1500 : 300_000);
    expect(authored.duration).toBe(preflight ? 1500 : 300_000);
    expect(authored.rate).toBe(0.5);
    records.push({ label: "authored-time-up", ...authored });
    await nativeRound("time-up-retains-decision", "time_up");
    await session.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.keyboard.press("1", { delay: 80 }); await expect.poll(async () => (await sample()).mode).toBe("endless");
    const endlessStart = await sample(), endlessUntil = Date.now() + (preflight ? 1500 : 5 * 60_000);
    while (Date.now() < endlessUntil) await tick(true);
    const endlessEnd = await sample();
    expect(endlessEnd.mode).toBe("endless");
    expect(endlessEnd.elapsed).toBeGreaterThan(endlessStart.elapsed + (preflight ? 300 : 120_000));
    records.push({ label: "extended-endless", before: endlessStart, after: endlessEnd });
    if (direction) await page.keyboard.up(direction); direction = "";
    await fixture.evaluate((f) => { f.watchAudio(); f.tone(); f.enableContactDeath(); });
    await waitStatus("dead", 30_000);
    records.push({ label: "endless-contact-death", ...await sample() });
    await expect.poll(() => fixture.evaluate((f) => f.audioSettled())).toBe(true);
    const cycles = preflight ? 3 : 10;
    for (let cycle = 0; cycle < cycles; cycle++) {
      const kind = cycle % 3 === 1 ? "death" : cycle % 3 === 2 ? "clearing" : "complete";
      const generation = (await sample()).generation;
      await fixture.evaluate((f, kind) => f.nextRun(kind), kind);
      await expect.poll(async () => (await sample()).generation).toBeGreaterThan(generation);
      await page.locator("canvas").click({ position: { x: 25, y: 25 } });
      await fixture.evaluate((f) => f.watchAudio());
      if (kind === "death") { await fixture.evaluate((f) => f.tone()); await waitStatus("dead", 15_000); }
      else {
        await waitStatus("time_up");
        if (kind === "clearing") {
          expect(await fixture.evaluate((f) => f.seedPending())).toBeGreaterThan(0);
        }
        await fixture.evaluate((f) => { f.tone(); f.finishEmpty(); });
        if (kind === "clearing") expect((await sample()).mode).toBe("clearing");
        await waitStatus("complete", 15_000);
      }
      const terminal = await sample();
      const sum = Object.values(terminal.damageBreakdown).reduce<number>((total, value) => total + Number(value), 0);
      expect(sum).toBeCloseTo(terminal.damage, 6);
      expect(terminal.xp).toBeCloseTo(terminal.ambientXp + terminal.shrineXp, 6);
      expect(terminal.audio.voices).toBe(0); expect(terminal.queues.gameplay.backlog).toBe(0);
      await expect.poll(() => fixture.evaluate((f) => f.audioSettled())).toBe(true);
      records.push({ label: "terminal-cycle", cycle, kind, terminal }); await write();
    }
    await fixture.evaluate((f) => f.nextRun("soak"));
    // Fill the remaining continuous 20-minute ownership window with real play,
    // not a terminal menu. The prior authored/endless time is included once.
    const soakUntil = started + (preflight ? 0 : 20 * 60_000);
    while (Date.now() < soakUntil) await tick(true);
    if (direction) await page.keyboard.up(direction);
    const final = await sample(); records.push({ label: "soak-end", wallElapsedMs: Date.now() - started, ...final });
    const lifecycle = await fixture.evaluate((f) => f.destroy());
    for (const stop of lifecycle.stops) expect(stop).toEqual({ display: 0, bodies: 0, postUpdate: 0, pickups: 0, enemies: 0, feedback: 0, hazards: 0, gameplayBacklog: 0, loadBacklog: 0, claimed: 0, blurHandler: false, focusHandler: false });
    for (const baseline of lifecycle.baselines) {
      expect(baseline.claims).toBe(0); expect(baseline.causalIds).toBe(0); expect(baseline.lethalIds).toBe(0);
      expect(baseline.bodies).toBe(1); expect(baseline.pickups).toBe(0); expect(baseline.enemies).toBe(0);
      expect(baseline.display).toBe(lifecycle.baselines[0].display);
      expect(baseline.postUpdate).toBe(lifecycle.baselines[0].postUpdate);
      expect(baseline.blurListeners).toBe(lifecycle.baselines[0].blurListeners);
    }
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__P5_AUDIO__").every((record: { settled: boolean; after: string }) => record.settled && record.after === "closed"))).toBe(true);
    const audio = await page.evaluate(() => Reflect.get(window, "__P5_AUDIO__"));
    expect(lifecycle.audio.some((record: { voicesAtClose: number }) => record.voicesAtClose > 0)).toBe(true);
    expect(audio.every((record: { closeCalls: number }) => record.closeCalls === 1)).toBe(true);
    expect(errors).toEqual([]);
    await write({ completed: true, lifecycle, audio, elapsedMs: Date.now() - started });
    await testInfo.attach("p5-campaign", { path: output, contentType: "application/json" });
    await fixture.dispose(); await otherSession.detach(); await session.detach(); await other.close();
  } catch (error) {
    if (diagnose) records.push({ label: "failure-state", ...await diagnose().catch(() => ({})) });
    await write({ completed: false, failure: error instanceof Error ? error.stack : String(error) });
    throw error;
  } finally {
    try { await browser?.close(); } finally {
      try {
        if (child.pid && child.exitCode === null && child.signalCode === null) {
          const exited = once(child, "exit"), timer = setTimeout(() => child.kill("SIGKILL"), 2000);
          child.kill("SIGTERM"); try { await exited; } finally { clearTimeout(timer); }
        }
      } finally { await rm(profile, { recursive: true, force: true }); }
    }
  }
});

import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import os from "node:os";

test("records actual renderer and audio capabilities for the compatibility gate", async ({ page, browser }, testInfo) => {
  test.skip(!testInfo.config.configFile?.endsWith("playwright.compatibility.config.ts"), "Explicit compatibility gate only");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?noContact=1&noXp=1&noHazards=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");
  const environment = await page.evaluate(async () => {
    const canvas = document.querySelector("canvas")!;
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    const debug = gl?.getExtension("WEBGL_debug_renderer_info");
    const audio = new AudioContext();
    const audioInitial = audio.state;
    await audio.close();
    return {
      userAgent: navigator.userAgent,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      renderer: gl ? "WebGL" : "Canvas",
      glVersion: gl?.getParameter(gl.VERSION),
      gpu: debug ? gl?.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      audio: { initial: audioInitial, closed: audio.state },
      snapshot: window.__ARENA_TEST__?.getSnapshot(),
    };
  });
  const path = testInfo.outputPath("environment.json");
  await writeFile(path, JSON.stringify({
    timestamp: new Date().toISOString(), project: testInfo.project.name,
    browserVersion: browser.version(), mode: "test", headless: true,
    platform: os.platform(), release: os.release(), arch: os.arch(),
    cpu: os.cpus()[0]?.model, memoryBytes: os.totalmem(), ...environment, errors,
  }, null, 2));
  await testInfo.attach("environment", { path, contentType: "application/json" });
  expect(environment.renderer).toBe("WebGL");
  expect(environment.audio.closed).toBe("closed");
  expect(environment.snapshot?.pacing?.gameplayRate).toBe(0.5);
  expect(errors).toEqual([]);
});

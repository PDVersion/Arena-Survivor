import { FrameMeasurements } from "../../src/test-support/frame-measurements";

const frame = document.querySelector<HTMLIFrameElement>("#game")!;
const status = document.querySelector<HTMLElement>("#status")!;
const load = document.querySelector<HTMLButtonElement>("#load")!;
const record = document.querySelector<HTMLButtonElement>("#record")!;
const download = document.querySelector<HTMLButtonElement>("#download")!;
const scenario = document.querySelector<HTMLSelectElement>("#scenario")!;
const device = document.querySelector<HTMLInputElement>("#device")!;
const manifest = await fetch("/manifest.json").then((response) => response.ok ? response.json() : null);
let result: Record<string, unknown> | undefined;
let runId = 0;
const state = () => frame.contentWindow?.__ARENA_TEST__?.getSnapshot();

load.onclick = () => {
  runId++;
  result = undefined;
  download.disabled = true;
  record.disabled = false;
  const query = scenario.value === "play" ? "frameMeasure=1" :
    `frameMeasure=1&representativeLoad=1&closeLoad=1&loadHarness=${scenario.value}&noContact=1&noXp=1&noWeapon=1&noHazards=1`;
  frame.src = `/index.html?${query}`;
  status.textContent = "Game loaded. Choose Default or Low in Settings. Click Record, then focus and play the game.";
};

record.onclick = () => {
  if (!state()?.run) { status.textContent = "Load a scenario and wait for the game first."; return; }
  const id = ++runId;
  record.disabled = true;
  load.disabled = true;
  download.disabled = true;
  result = undefined;
  const started = performance.now();
  const frames = new FrameMeasurements(16384);
  const checkpoints: unknown[] = [];
  const qualities = new Set<string>();
  let warmedAt: number | undefined;
  let samplingAt: number | undefined;
  let lastFrame: number | undefined;
  let lastSimulation: number | undefined;
  let lastCheckpoint = 0;
  let activeSamples = 0;
  let hiddenSamples = 0;
  let nonPlayingSamples = 0;
  let observedHidden = false;
  const visibility = () => { if (document.hidden) observedHidden = true; };
  document.addEventListener("visibilitychange", visibility);
  const finish = (reason: string) => {
    document.removeEventListener("visibilitychange", visibility);
    clearTimeout(watchdog);
    runId++;
    const end = state();
    const canvas = frame.contentDocument?.querySelector("canvas");
    const gl = (canvas?.getContext("webgl2") ?? canvas?.getContext("webgl")) as WebGLRenderingContext | null;
    const debug = gl?.getExtension("WEBGL_debug_renderer_info");
    const observed = frames.snapshot(true);
    // This wrapper observes browser rAF; never label it Phaser rawDelta or report unmeasured CPU as zero.
    const measured = {
      clock: "browser-raf-wall-ms", frameSamples: observed.frameSamples,
      averageFrameMs: observed.averageFrameMs, maxFrameMs: observed.maxFrameMs,
      excludedFrames: observed.excludedFrames,
      observedSimulationAdvanceMeanMs: observed.averageSimulationDeltaMs,
      distribution: observed.distribution ? {
        capacity: observed.distribution.capacity, windowSamples: observed.distribution.windowSamples,
        throughSample: observed.distribution.throughSample, wall: observed.distribution.wall,
        stallsOver100Ms: observed.distribution.stallsOver100Ms, stallPercent: observed.distribution.stallPercent,
      } : undefined,
    };
    const elapsed = samplingAt === undefined ? 0 : performance.now() - samplingAt;
    result = {
      schema: "arena-device-evidence-v1", source: manifest, createdAt: new Date().toISOString(),
      mode: "test", acceptance: "unreviewed device evidence; no automatic pass",
      reason, scenario: scenario.value, deviceNotes: device.value,
      userAgent: navigator.userAgent, platform: navigator.platform,
      viewport: { width: frame.contentWindow?.innerWidth, height: frame.contentWindow?.innerHeight,
        dpr: frame.contentWindow?.devicePixelRatio },
      renderer: gl ? "WebGL" : "Canvas/unknown",
      gpu: debug ? gl?.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      wallWindowMs: elapsed, measurement: measured, activeSamples, hiddenSamples,
      nonPlayingSamples, observedHidden, qualities: [...qualities], checkpoints, end,
      caveats: ["rAF wall spacing, not GPU timing", "simulation deltas are differences between read-only snapshots, not engine frame deltas", "test instrumentation included",
        "aided benchmark disables contact/XP/weapons/hazards; ordinary play does not",
        "resource telemetry is not a heap census or proof of native event handling"],
    };
    status.textContent = `Recording finished: ${reason}. ${(elapsed / 1000).toFixed(1)} seconds, ${activeSamples} active frames. Download and retain this result; acceptance needs review.`;
    download.disabled = false;
    record.disabled = false;
    load.disabled = false;
  };
  const tick = (now: number) => {
    if (id !== runId) { clearTimeout(watchdog); document.removeEventListener("visibilitychange", visibility); return; }
    const snapshot = state();
    const playing = snapshot?.run?.status === "playing";
    const hidden = document.hidden || Boolean(frame.contentDocument?.hidden);
    if (hidden) hiddenSamples++;
    if (!playing) nonPlayingSamples++;
    if (playing && !hidden) {
      warmedAt ??= now;
      if (now - warmedAt >= 10000) samplingAt ??= now;
    } else if (samplingAt === undefined) warmedAt = undefined;
    if (samplingAt !== undefined) {
      if (playing && !hidden && lastFrame !== undefined) {
        frames.observe({ wallFrameMs: now - lastFrame, simulationDeltaMs: Math.max(0, (snapshot?.run?.elapsedMs ?? 0) - (lastSimulation ?? snapshot?.run?.elapsedMs ?? 0)), active: true });
        activeSamples++;
      } else frames.interrupt();
      qualities.add(snapshot?.ui?.settings.presentationQuality ?? "unknown");
      if (now - lastCheckpoint >= 1000) { checkpoints.push({ wallMs: now - samplingAt, snapshot }); lastCheckpoint = now; }
      lastFrame = now;
      lastSimulation = snapshot?.run?.elapsedMs;
      if (now - samplingAt >= 60000) { finish("60-second window complete"); return; }
    }
    status.textContent = samplingAt === undefined ? "Waiting for active play and 10 seconds warmup…" :
      `Recording: ${Math.floor((now - samplingAt) / 1000)} / 60 seconds. Keep playing; choose upgrades as needed.`;
    if (now - started >= 180000) { finish("three-minute bound reached"); return; }
    frame.contentWindow?.requestAnimationFrame(tick);
  };
  const watchdog = setTimeout(() => finish("three-minute bound reached"), 180000);
  frame.contentWindow?.focus();
  frame.contentWindow?.requestAnimationFrame(tick);
};

download.onclick = () => {
  if (!result) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `arena-device-${scenario.value}-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

import { describe, expect, it } from "vitest";
import { FrameMeasurements } from "../../../src/test-support/frame-measurements";
import { resolveGameplayRate } from "../../../src/game/systems/time/gameplay-time";

describe("wall-frame measurements", () => {
  it("keeps unsmoothed wall intervals separate from half-rate simulation", () => {
    const frames = new FrameMeasurements();
    const rate = resolveGameplayRate({
      baseRate: 0.5, reducedMotion: false, hitStopActive: false, deathSlowActive: false,
    });
    frames.observe({ wallFrameMs: 16, simulationDeltaMs: 16 * rate, active: true });
    // Phaser can smooth a long wall interval to a smaller engine delta.
    frames.observe({ wallFrameMs: 40, simulationDeltaMs: 16 * rate, active: true });
    frames.observe({ wallFrameMs: 20, simulationDeltaMs: 20 * rate, active: true });
    expect(frames.snapshot()).toMatchObject({
      clock: "phaser-raw-wall-ms", frameSamples: 2,
      averageFrameMs: 30, maxFrameMs: 40, averageSimulationDeltaMs: 9,
    });
  });

  it("excludes hit-stop/death slowdown, pause, hidden intervals and their return frames", () => {
    const frames = new FrameMeasurements();
    const rate = resolveGameplayRate({
      baseRate: 0.5, reducedMotion: false, hitStopActive: true, deathSlowActive: false,
    });
    expect(rate).toBeCloseTo(0.04);
    frames.observe({ wallFrameMs: 16, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 16, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 200, simulationDeltaMs: 16 * rate, active: false });
    frames.observe({ wallFrameMs: 2000, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 20, simulationDeltaMs: 10, active: true });
    frames.interrupt(); // Hidden tabs may have no scene updates at all.
    frames.observe({ wallFrameMs: 10_000, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 24, simulationDeltaMs: 12, active: true });
    expect(frames.snapshot()).toMatchObject({
      frameSamples: 3, averageFrameMs: 20, maxFrameMs: 24,
      averageSimulationDeltaMs: 10, excludedFrames: 4,
    });
  });

  it("retains slow active frames and rejects invalid intervals without poisoning results", () => {
    const frames = new FrameMeasurements();
    frames.observe({ wallFrameMs: 16, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 180, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: Number.NaN, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 16, simulationDeltaMs: 8, active: true });
    frames.observe({ wallFrameMs: 20, simulationDeltaMs: 10, active: true });
    expect(frames.snapshot()).toMatchObject({ frameSamples: 2, averageFrameMs: 100, maxFrameMs: 180 });
    expect(new FrameMeasurements().snapshot()).toMatchObject({ frameSamples: 0, averageFrameMs: 0 });
  });

  it("bounds rolling percentile retention while lifetime totals retain every active stall", () => {
    const frames = new FrameMeasurements(4);
    frames.observe({ wallFrameMs: 16, simulationDeltaMs: 8, updateCpuMs: 1, active: true });
    for (const wallFrameMs of [180, 10, 20, 30, 40]) {
      frames.observe({ wallFrameMs, simulationDeltaMs: 8, updateCpuMs: wallFrameMs / 10, active: true });
    }
    expect(frames.snapshot(true)).toMatchObject({
      frameSamples: 5, averageFrameMs: 56, maxFrameMs: 180,
      updateCpuSamples: 5, averageUpdateCpuMs: 5.6, maxUpdateCpuMs: 18,
      distribution: {
        capacity: 4, windowSamples: 4, throughSample: 5,
        wall: { p50Ms: 20, p95Ms: 40, p99Ms: 40 },
        updateCpu: { p50Ms: 2, p95Ms: 4, p99Ms: 4 },
        stallsOver100Ms: 0, stallPercent: 0,
      },
    });
  });

  it("reports nearest-rank tails and stalls without treating them as a CI speed gate", () => {
    const frames = new FrameMeasurements(100);
    frames.observe({ wallFrameMs: 1, simulationDeltaMs: 1, active: true });
    for (let i = 1; i <= 100; i += 1) {
      frames.observe({ wallFrameMs: i === 100 ? 200 : i, simulationDeltaMs: 1, updateCpuMs: i, active: true });
    }
    expect(frames.snapshot(true).distribution).toMatchObject({
      windowSamples: 100, wall: { p50Ms: 50, p95Ms: 95, p99Ms: 99 },
      stallsOver100Ms: 1, stallPercent: 1,
    });
    expect(() => new FrameMeasurements(-1)).toThrow();
    expect(() => new FrameMeasurements(16_385)).toThrow();
  });
});

export interface FrameMeasurementInput {
  /** Phaser TimeStep.rawDelta: unsmoothed, unscaled browser frame spacing. */
  readonly wallFrameMs: number;
  /** The actual scaled delta passed to simulation this update. */
  readonly simulationDeltaMs: number;
  /** Synchronous RunScene.update elapsed time, including telemetry; excludes engine render/physics. */
  readonly updateCpuMs?: number;
  readonly active: boolean;
}

export interface FrameMeasurementSnapshot {
  readonly clock: "phaser-raw-wall-ms";
  readonly frameSamples: number;
  readonly averageFrameMs: number;
  readonly maxFrameMs: number;
  readonly averageSimulationDeltaMs: number;
  readonly excludedFrames: number;
  readonly updateCpuSamples: number;
  readonly averageUpdateCpuMs: number;
  readonly maxUpdateCpuMs: number;
  readonly distribution?: FrameDistributionSnapshot;
}

export interface Percentiles {
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
}

export interface FrameDistributionSnapshot {
  readonly capacity: number;
  readonly windowSamples: number;
  readonly throughSample: number;
  readonly wall: Percentiles;
  readonly updateCpu: Percentiles;
  readonly stallsOver100Ms: number;
  readonly stallPercent: number;
}

function percentiles(values: readonly number[]): Percentiles {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (fraction: number) => sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0;
  return { p50Ms: at(0.5), p95Ms: at(0.95), p99Ms: at(0.99) };
}

/** Test-only accounting; never changes the simulation clock or frame budget. */
export class FrameMeasurements {
  private samples = 0;
  private wallTotalMs = 0;
  private simulationTotalMs = 0;
  private maxWallMs = 0;
  private excluded = 0;
  private previouslyActive = false;
  private cpuSamples = 0;
  private cpuTotalMs = 0;
  private maxCpuMs = 0;
  private readonly wallWindow: number[] = [];
  private readonly cpuWindow: number[] = [];
  private windowCursor = 0;
  private distribution?: FrameDistributionSnapshot;

  /** Detailed rolling distributions are opt-in; the fixed capacity is instrumentation, not tuning. */
  constructor(private readonly capacity = 0) {
    if (!Number.isInteger(capacity) || capacity < 0 || capacity > 16_384) {
      throw new Error("Frame sample capacity must be an integer between zero and 16384");
    }
  }

  /** Discard the first interval after focus/visibility changes, even without an update. */
  interrupt(): void {
    this.previouslyActive = false;
  }

  observe(input: FrameMeasurementInput): void {
    const valid = Number.isFinite(input.wallFrameMs) && input.wallFrameMs > 0 &&
      Number.isFinite(input.simulationDeltaMs) && input.simulationDeltaMs >= 0;
    const include = input.active && this.previouslyActive && valid;
    this.previouslyActive = input.active && valid;
    if (!include) {
      this.excluded += 1;
      return;
    }
    this.samples += 1;
    this.wallTotalMs += input.wallFrameMs;
    this.simulationTotalMs += input.simulationDeltaMs;
    this.maxWallMs = Math.max(this.maxWallMs, input.wallFrameMs);
    const cpu = input.updateCpuMs;
    if (cpu !== undefined && Number.isFinite(cpu) && cpu >= 0) {
      this.cpuSamples += 1;
      this.cpuTotalMs += cpu;
      this.maxCpuMs = Math.max(this.maxCpuMs, cpu);
    }
    if (this.capacity > 0) {
      this.wallWindow[this.windowCursor] = input.wallFrameMs;
      this.cpuWindow[this.windowCursor] = cpu !== undefined && Number.isFinite(cpu) && cpu >= 0 ? cpu : 0;
      this.windowCursor = (this.windowCursor + 1) % this.capacity;
    }
  }

  snapshot(flushDistribution = false): FrameMeasurementSnapshot {
    // Sort at most once per 60 accepted samples during play, then flush at pause/terminal.
    // Never copy/sort an ever-growing history on the per-frame telemetry path.
    if (this.capacity > 0 && (!this.distribution ||
        (flushDistribution && this.samples !== this.distribution.throughSample) ||
        this.samples - this.distribution.throughSample >= 60)) {
      const stalls = this.wallWindow.filter((value) => value > 100).length;
      this.distribution = {
        capacity: this.capacity,
        windowSamples: this.wallWindow.length,
        throughSample: this.samples,
        wall: percentiles(this.wallWindow),
        updateCpu: percentiles(this.cpuWindow),
        stallsOver100Ms: stalls,
        stallPercent: this.wallWindow.length === 0 ? 0 : stalls / this.wallWindow.length * 100,
      };
    }
    return {
      clock: "phaser-raw-wall-ms",
      frameSamples: this.samples,
      averageFrameMs: this.samples === 0 ? 0 : this.wallTotalMs / this.samples,
      maxFrameMs: this.maxWallMs,
      averageSimulationDeltaMs: this.samples === 0 ? 0 : this.simulationTotalMs / this.samples,
      excludedFrames: this.excluded,
      updateCpuSamples: this.cpuSamples,
      averageUpdateCpuMs: this.cpuSamples === 0 ? 0 : this.cpuTotalMs / this.cpuSamples,
      maxUpdateCpuMs: this.maxCpuMs,
      distribution: this.distribution,
    };
  }
}

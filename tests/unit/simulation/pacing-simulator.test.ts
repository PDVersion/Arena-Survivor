import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import {
  buildModels,
  expectedCritMultiplier,
  findBuildModel,
} from "../../../src/game/systems/simulation/build-models";
import {
  levelAt,
  simulatePacing,
  timeToLevel,
} from "../../../src/game/systems/simulation/pacing-simulator";
import { formatPacingReport } from "../../../src/game/systems/simulation/format-report";

const FIVE_MINUTES_MS = 5 * 60_000;

function run(overrides: Partial<Parameters<typeof simulatePacing>[0]> = {}) {
  return simulatePacing({
    theme: knightMagicTheme,
    build: findBuildModel("damage-rush")!,
    durationMs: FIVE_MINUTES_MS,
    ...overrides,
  });
}

describe("pacing simulator", () => {
  it("is deterministic for the same inputs", () => {
    expect(run()).toEqual(run());
  });

  it("covers the whole run in contiguous buckets", () => {
    const report = run();
    expect(report.buckets.length).toBeGreaterThan(0);
    expect(report.buckets[0]?.startMs).toBe(0);
    expect(report.buckets.at(-1)?.endMs).toBe(FIVE_MINUTES_MS);

    for (let index = 1; index < report.buckets.length; index += 1) {
      expect(report.buckets[index]?.startMs).toBe(report.buckets[index - 1]?.endMs);
    }
  });

  it("never regresses level or cumulative experience", () => {
    const report = run();
    let level = 1;
    let cumulative = 0;
    for (const bucket of report.buckets) {
      expect(bucket.level).toBeGreaterThanOrEqual(level);
      expect(bucket.cumulativeXp).toBeGreaterThanOrEqual(cumulative);
      level = bucket.level;
      cumulative = bucket.cumulativeXp;
    }
    expect(report.finalLevel).toBe(level);
  });

  it("records one timestamp per level gained, in order", () => {
    const report = run();
    expect(report.levelTimestampsMs).toHaveLength(report.finalLevel - 1);
    for (let index = 1; index < report.levelTimestampsMs.length; index += 1) {
      expect(report.levelTimestampsMs[index]).toBeGreaterThanOrEqual(
        report.levelTimestampsMs[index - 1]!,
      );
    }
    expect(timeToLevel(report, 1)).toBe(0);
    expect(timeToLevel(report, report.finalLevel + 5)).toBeUndefined();
    expect(levelAt(report, FIVE_MINUTES_MS)).toBe(report.finalLevel);
  });

  it("respects the shared live-enemy cap", () => {
    const report = run({ chaos: 12 });
    expect(report.peakLiveEnemies).toBeLessThanOrEqual(300);
  });

  it("reaches a higher level with a stronger build", () => {
    const passive = run({ build: findBuildModel("passive")! });
    const rush = run({ build: findBuildModel("damage-rush")! });
    expect(rush.finalLevel).toBeGreaterThan(passive.finalLevel);
  });

  it("consumes theme tuning rather than its own constants", () => {
    const doubledInterval = {
      ...knightMagicTheme,
      tuning: {
        ...knightMagicTheme.tuning,
        director: {
          ...knightMagicTheme.tuning.director,
          spawnIntervalMs: knightMagicTheme.tuning.director.spawnIntervalMs * 2,
        },
      },
    };
    const baseline = run();
    const slower = run({ theme: doubledInterval });

    const spawned = (report: ReturnType<typeof run>): number =>
      report.buckets.reduce(
        (total, bucket) =>
          total + Object.values(bucket.spawnedByRole).reduce((sum, count) => sum + count, 0),
        0,
      );

    expect(spawned(slower)).toBeLessThan(spawned(baseline));
  });

  it("raises spawn pressure and rewards as Chaos rises", () => {
    const calm = run();
    const chaotic = run({ chaos: 4 });
    expect(chaotic.totalXp).toBeGreaterThan(calm.totalXp);
    expect(chaotic.peakLiveEnemies).toBeGreaterThan(calm.peakLiveEnemies);
  });

  it("rejects a non-positive duration or step", () => {
    expect(() => run({ durationMs: 0 })).toThrow(/duration/);
    expect(() => run({ stepMs: -1 })).toThrow(/Step/);
  });

  it("renders a report without throwing for every build model", () => {
    for (const build of buildModels) {
      const text = formatPacingReport(run({ build }));
      expect(text).toContain(build.id);
      expect(text).toContain("final level");
    }
  });
});

describe("expected crit multiplier", () => {
  it("interpolates between guaranteed tiers", () => {
    expect(expectedCritMultiplier(0, 2)).toBeCloseTo(1);
    expect(expectedCritMultiplier(0.5, 2)).toBeCloseTo(1.5);
    expect(expectedCritMultiplier(1, 2)).toBeCloseTo(2);
    expect(expectedCritMultiplier(2, 2)).toBeCloseTo(4);
  });

  it("never returns less than one", () => {
    expect(expectedCritMultiplier(-3, 2)).toBeGreaterThanOrEqual(1);
  });
});

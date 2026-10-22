import { acceptCurse, applyWorldChoice, createWorldState } from "../../../src/game/systems/chaos/world-modifiers";
import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import {
  buildModels,
  expectedCritMultiplier,
  findBuildModel,
} from "../../../src/game/systems/simulation/build-models";
import {
  applyPacingWorldChoice,
  levelAt,
  simulatePacing,
  timeToKillTable,
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

  it("reports simulated and expected wall-clock duration together", () => {
    const report = run();
    expect(report.gameplayRate).toBe(0.5);
    expect(report.expectedRealDurationMs).toBe(FIVE_MINUTES_MS * 2);
    expect(formatPacingReport(report)).toContain("5:00 simulated / 10:00 real at 0.50x");
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
          baseIntervalMs: knightMagicTheme.tuning.director.baseIntervalMs * 2,
          minIntervalMs: knightMagicTheme.tuning.director.minIntervalMs * 2,
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

    // Pressure shows up as reward per kill and as how quickly the arena fills.
    // It does NOT show up as total volume: past a certain Chaos the tougher
    // enemies saturate the shared cap and fewer of them flow through in total.
    const saturatesAt = (report: ReturnType<typeof run>): number =>
      report.buckets.find((bucket) => bucket.liveEnemies >= 200)?.endMs ?? Number.POSITIVE_INFINITY;

    expect(chaotic.totalXp).toBeGreaterThan(calm.totalXp);
    expect(saturatesAt(chaotic)).toBeLessThan(saturatesAt(calm));
    expect(chaotic.peakLiveEnemies).toBeGreaterThanOrEqual(calm.peakLiveEnemies);
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

describe("V0.3 pacing targets", () => {
  const FIVE = 5 * 60_000;

  /**
   * The curve and rewards are tuned against this band, so a drift in either
   * fails here rather than in a five-minute manual run. See REC-047.
   */
  it("lands an average build inside the declared level band", () => {
    for (const id of ["damage-rush", "crit", "explosion"]) {
      const report = simulatePacing({
        theme: ecoGuardianTheme,
        build: findBuildModel(id)!,
        durationMs: FIVE,
      });
      expect(report.finalLevel).toBeGreaterThanOrEqual(24);
      expect(report.finalLevel).toBeLessThanOrEqual(34);
    }
  });

  it("front-loads the opening minute and decelerates after it", () => {
    const report = simulatePacing({
      theme: ecoGuardianTheme,
      build: findBuildModel("damage-rush")!,
      durationMs: FIVE,
    });

    // Levels arrive quickly at first...
    expect(timeToLevel(report, 5)!).toBeLessThan(60_000);
    expect(levelAt(report, 60_000)).toBeGreaterThanOrEqual(7);

    // ...and the last stretch must cost visibly more than the first.
    const firstFive = timeToLevel(report, 6)! - timeToLevel(report, 1)!;
    const lastFive = timeToLevel(report, report.finalLevel)! -
      timeToLevel(report, report.finalLevel - 5)!;
    expect(lastFive).toBeGreaterThan(firstFive * 2);
  });

  it("keeps both production themes inside the same band", () => {
    const eco = simulatePacing({
      theme: ecoGuardianTheme,
      build: findBuildModel("damage-rush")!,
      durationMs: FIVE,
    });
    const knight = simulatePacing({
      theme: knightMagicTheme,
      build: findBuildModel("damage-rush")!,
      durationMs: FIVE,
    });
    expect(Math.abs(eco.finalLevel - knight.finalLevel)).toBeLessThanOrEqual(4);
  });
});

describe("V0.3 balance pass", () => {
  const FIVE = 5 * 60_000;

  function runBuild(id: string, chaos = 1) {
    const options = {
      theme: ecoGuardianTheme,
      build: findBuildModel(id)!,
      durationMs: FIVE,
      chaos,
    };
    return { options, report: simulatePacing(options) };
  }

  it("keeps every role killable at every point of the run", () => {
    // The failure this catches is player damage and enemy health diverging
    // quietly until the late run is a wall.
    for (const id of ["damage-rush", "crit", "explosion", "spread"]) {
      const { options, report } = runBuild(id);
      for (const row of timeToKillTable(report, options)) {
        for (const [role, seconds] of Object.entries(row.seconds)) {
          expect(Number.isFinite(seconds), `${id} ${role}`).toBe(true);
          expect(seconds, `${id} ${role} at ${row.progress}`).toBeLessThan(25);
        }
      }
    }
  });

  it("kills faster as the run progresses, never slower", () => {
    const { options, report } = runBuild("spread");
    const rows = timeToKillTable(report, options);
    const first = rows[0]!.seconds[archetypeIds.enemy.swarmBasic]!;
    const last = rows.at(-1)!.seconds[archetypeIds.enemy.swarmBasic]!;

    // Health scales, but damage must scale faster or the ramp becomes a wall.
    expect(last).toBeLessThan(first);
  });

  it("meets the DPS budget on a multiplicative build", () => {
    // Base is 10 DPS. A build that spreads across damage, attack speed, crit,
    // and projectile count must reach several hundred by the end, or Phase 6's
    // health ramp has nothing to answer it.
    const { report, options } = runBuild("spread");
    const final = timeToKillTable(report, options).at(-1)!;
    expect(final.damagePerSecond).toBeGreaterThan(400);
    // Upper bound is deliberately loose: PLAN.md wants a strong build to become
    // temporarily ridiculous rather than be suppressed.
    expect(final.damagePerSecond).toBeLessThan(1_500);
  });

  it("rewards a strong build with more levels than an average one", () => {
    expect(runBuild("spread").report.finalLevel).toBeGreaterThan(
      runBuild("damage-rush").report.finalLevel,
    );
    expect(runBuild("damage-rush").report.finalLevel).toBeGreaterThan(
      runBuild("passive").report.finalLevel,
    );
  });

  it("holds up at ten minutes, a length nobody tuned by hand", () => {
    const long = simulatePacing({
      theme: ecoGuardianTheme,
      build: findBuildModel("damage-rush")!,
      durationMs: 10 * 60_000,
    });
    const short = runBuild("damage-rush").report;

    expect(long.finalLevel).toBeGreaterThan(short.finalLevel);
    expect(long.peakLiveEnemies).toBeLessThanOrEqual(300);
    // Levels keep arriving rather than stalling out past the tuned length.
    expect(long.levelTimestampsMs.length).toBe(long.finalLevel - 1);
  });
});

describe("G1 model contract corrections", () => {
  const noDamage = { id: "fixture", description: "No attacks", damagePerSecond: () => 0 };
  const singleRole = (health: number, armour: number) => ({ ...ecoGuardianTheme,
    enemies: ecoGuardianTheme.enemies.map((enemy) => ({ ...enemy, maxHealth: health, armour })),
    tuning: { ...ecoGuardianTheme.tuning, director: { ...ecoGuardianTheme.tuning.director,
      baseIntervalMs: 900, minIntervalMs: 900, intervalDecayK: 0, batchRamp: 0,
      roles: [{ ...ecoGuardianTheme.tuning.director.roles[0]!, unlockAt: 0, baseWeight: 1, weightGrowth: 0 }] } } });

  it("spends the same work for equivalent health-plus-armour without changing rewards", () => {
    const armoured = run({ theme: singleRole(100, 100) });
    const health = run({ theme: singleRole(200, 0) });
    expect(armoured.totalKills).toBe(health.totalKills);
    expect(armoured.totalXp).toBe(health.totalXp);
    expect(armoured.capDwellMs).toBe(health.capDwellMs);
  });

  it("retains each arrival's spawn-time health instead of copying the first survivor", () => {
    const theme = singleRole(100, 0);
    const report = run({ theme: { ...theme, tuning: { ...theme.tuning, difficulty: { ...theme.tuning.difficulty,
      time: { ...theme.tuning.difficulty.time, steps: 2, enemyHealthAtEnd: 1 } } } },
      build: noDamage, durationMs: 2000, stepMs: 1000 });
    // Two same-role arrivals: 150 and 200 HP before Normal's 0.95 preset.
    expect(Object.values(report.remainingEffectiveWorkByRole)).toEqual([350 * 0.95]);
    expect(Object.values(report.remainingByRole)).toEqual([2]);
  });

  it("does not store attacks during an empty interval", () => {
    const theme = singleRole(100, 0);
    const report = run({ theme: { ...theme, tuning: { ...theme.tuning, director: {
      ...theme.tuning.director, baseIntervalMs: 20_000, minIntervalMs: 20_000 } } },
      build: { ...noDamage, damagePerSecond: () => 10 }, durationMs: 40_000, bucketMs: 1000 });
    expect(report.buckets.filter((b) => b.endMs <= 25_000).reduce((n, b) => n + b.kills, 0)).toBe(1);
  });

  it("admits at most one natural batch per step rather than a catch-up storm", () => {
    const theme = singleRole(100, 0);
    const report = run({ theme: { ...theme, tuning: { ...theme.tuning, director: {
      ...theme.tuning.director, baseIntervalMs: 1, minIntervalMs: 1 } } }, build: noDamage, durationMs: 1000, stepMs: 1000 });
    expect(Object.values(report.buckets[0]!.spawnedByRole)).toEqual([1]);
    expect(report.peakLiveEnemies).toBe(1);
  });

  it("accounts sampled cap dwell and natural blocking separately from an unmodelled causal queue", () => {
    const report = run({ build: noDamage });
    expect(report.capDwellMs).toBeGreaterThan(0);
    expect(report.naturalSpawnBlockedMs).toBeGreaterThan(0);
    expect(report.capDwellMs).toBeLessThanOrEqual(report.durationMs);
    expect(Object.values(report.remainingByRole).reduce((n, count) => n + count, 0)).toBe(300);
    expect(Object.values(report.killsByRole).reduce((n, count) => n + count, 0)).toBe(report.totalKills);
  });
});

for (const theme of [ecoGuardianTheme, knightMagicTheme]) describe(`${theme.id} explicit timed world-choice fixtures`, () => {
  const shrine = theme.shrines.find((s) => s.id === archetypeIds.shrine.greed)!;
  const options = { theme, build: findBuildModel("damage-rush")!, durationMs: 60000, bucketMs: 1000 };
  it("leaves every pre-acceptance bucket unchanged, while ignored choices remain exactly baseline", () => {
    const baseline = simulatePacing(options);
    expect(simulatePacing({ ...options, worldChoices: [] })).toEqual(baseline);
    const choice = { atMs: 30000, kind: "shrine" as const, id: shrine.id };
    const accepted = simulatePacing({ ...options, worldChoices: [choice] });
    expect(accepted.buckets.filter((b) => b.endMs < choice.atMs)).toEqual(baseline.buckets.filter((b) => b.endMs < choice.atMs));
    expect(accepted.chaos).toBeGreaterThan(baseline.chaos);
    const early = simulatePacing({ ...options, worldChoices: [{ ...choice, atMs: 0 }] });
    const initial = applyWorldChoice(createWorldState(), { ...shrine, shrineId: shrine.id });
    expect(early).toEqual(simulatePacing({ ...options, initialWorld: initial }));
    const timedTtk = timeToKillTable(accepted, { ...options, worldChoices: [choice] });
    const baseTtk = timeToKillTable(baseline, options);
    expect(timedTtk[0]).toEqual(baseTtk[0]);
  });
  it("keeps repeated curse acceptance idempotent and rejects unsupported actor-producing events", () => {
    const curse = theme.curses[0]!;
    const choice = { atMs: 1000, kind: "curse" as const, id: curse.id };
    const first = applyPacingWorldChoice(createWorldState(), choice, theme);
    expect(first).toEqual(acceptCurse(createWorldState(), curse));
    expect(applyPacingWorldChoice(first, choice, theme)).toBe(first);
    expect(simulatePacing({ ...options, worldChoices: [choice, { ...choice, atMs: 2000 }] })).toEqual(simulatePacing({ ...options, worldChoices: [choice] }));
    for (const id of [archetypeIds.shrine.spawnSurge, archetypeIds.shrine.duplication]) expect(() => simulatePacing({ ...options, worldChoices: [{ atMs: 0, kind: "shrine", id }] })).toThrow(/only model/);
    for (const atMs of [-1, NaN, Infinity, options.durationMs + 1]) expect(() => simulatePacing({ ...options, worldChoices: [{ atMs, kind: "shrine", id: shrine.id }] })).toThrow(/time/);
  });
});

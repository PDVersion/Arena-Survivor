import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import {
  baselineEliteChance,
  batchSize,
  crossedUnlocks,
  enemiesInWave,
  resolveDirectorPlan,
  resolveEliteChance,
  roleWeights,
  runProgress,
  selectRole,
  spawnIntervalMs,
} from "../../../src/game/systems/director/spawn-director";
import { createSeededRandom } from "../../../src/game/systems/upgrades";

const tuning = ecoGuardianTheme.tuning.director;

function shares(progress: number, chaosPressure = 0): Record<string, number> {
  const weights = roleWeights(tuning, progress, chaosPressure);
  const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
  return Object.fromEntries(
    weights.map((entry) => [entry.enemyId, Math.round((entry.weight / total) * 100)]),
  );
}

describe("run progress", () => {
  it("normalizes elapsed time and is free to exceed one for endless runs", () => {
    expect(runProgress(0, 300_000)).toBe(0);
    expect(runProgress(150_000, 300_000)).toBe(0.5);
    expect(runProgress(300_000, 300_000)).toBe(1);
    expect(runProgress(450_000, 300_000)).toBe(1.5);
  });

  it("never returns a negative or non-finite progress", () => {
    expect(runProgress(-10, 300_000)).toBe(0);
    expect(runProgress(1_000, 0)).toBe(0);
    expect(runProgress(1_000, Number.NaN)).toBe(0);
  });
});

describe("spawn cadence", () => {
  it("decays from the base interval toward the floor", () => {
    expect(spawnIntervalMs(tuning, 0)).toBeCloseTo(900);
    expect(Math.round(spawnIntervalMs(tuning, 0.2))).toBe(737);
    expect(Math.round(spawnIntervalMs(tuning, 0.4))).toBe(603);
    expect(Math.round(spawnIntervalMs(tuning, 0.6))).toBe(494);
    expect(Math.round(spawnIntervalMs(tuning, 0.8))).toBe(404);
    expect(Math.round(spawnIntervalMs(tuning, 1))).toBe(331);
  });

  it("clamps at the floor rather than collapsing in an endless run", () => {
    expect(spawnIntervalMs(tuning, 10)).toBe(tuning.minIntervalMs);
    expect(spawnIntervalMs(tuning, 100)).toBe(tuning.minIntervalMs);
  });

  it("grows the batch so a late swarm reads as a wave, not a trickle", () => {
    expect(batchSize(tuning, 0)).toBe(1);
    expect(batchSize(tuning, 0.4)).toBe(2);
    expect(batchSize(tuning, 0.8)).toBe(3);
    expect(batchSize(tuning, 1)).toBe(4);
    expect(batchSize(tuning, 2)).toBeGreaterThan(4);
  });
});

describe("role composition", () => {
  it("gates roles behind their unlock threshold", () => {
    expect(Object.keys(shares(0))).toEqual([archetypeIds.enemy.swarmBasic]);
    expect(Object.keys(shares(0.19))).toHaveLength(1);
    expect(Object.keys(shares(0.2))).toHaveLength(2);
    expect(Object.keys(shares(0.4))).toHaveLength(3);
    expect(Object.keys(shares(0.45))).toHaveLength(4);
  });

  it("produces the documented five-minute shape from the curves", () => {
    expect(shares(0)).toEqual({ [archetypeIds.enemy.swarmBasic]: 100 });
    expect(shares(0.2)).toMatchObject({
      [archetypeIds.enemy.swarmBasic]: 74,
      [archetypeIds.enemy.fastFragile]: 26,
    });
    expect(shares(1)).toMatchObject({
      [archetypeIds.enemy.swarmBasic]: 33,
      [archetypeIds.enemy.fastFragile]: 28,
      [archetypeIds.enemy.slowDurable]: 22,
      [archetypeIds.enemy.deathSpawner]: 17,
    });
  });

  it("thins the baseline role as heavier roles arrive", () => {
    const opening = shares(0.2)[archetypeIds.enemy.swarmBasic] ?? 0;
    const closing = shares(1)[archetypeIds.enemy.swarmBasic] ?? 0;
    expect(closing).toBeLessThan(opening);
  });

  it("shifts composition toward heavy roles as Chaos rises, not just volume", () => {
    const calm = shares(1, 0);
    const chaotic = shares(1, 5);

    expect(chaotic[archetypeIds.enemy.slowDurable]!).toBeGreaterThan(
      calm[archetypeIds.enemy.slowDurable]!,
    );
    expect(chaotic[archetypeIds.enemy.deathSpawner]!).toBeGreaterThan(
      calm[archetypeIds.enemy.deathSpawner]!,
    );
    expect(chaotic[archetypeIds.enemy.swarmBasic]!).toBeLessThan(
      calm[archetypeIds.enemy.swarmBasic]!,
    );
  });

  it("selects deterministically from an injected random source", () => {
    const weights = roleWeights(tuning, 1);
    const first = createSeededRandom(0x1234);
    const second = createSeededRandom(0x1234);
    for (let index = 0; index < 50; index += 1) {
      expect(selectRole(weights, first)).toBe(selectRole(weights, second));
    }
    expect(selectRole([], () => 0.5)).toBeUndefined();
  });

  it("only ever returns an unlocked role", () => {
    const weights = roleWeights(tuning, 0.3);
    const random = createSeededRandom(0x99);
    const allowed = new Set(weights.map((entry) => entry.enemyId));
    for (let index = 0; index < 200; index += 1) {
      expect(allowed.has(selectRole(weights, random)!)).toBe(true);
    }
    expect(allowed.has(archetypeIds.enemy.slowDurable)).toBe(false);
  });
});

describe("elite escalation", () => {
  it("introduces elites on the timer, fixing the shrine-free blind spot", () => {
    // V0.2: chance was min(0.4, 0.04 * (chaos - 1)), so a calm run saw none.
    expect(baselineEliteChance(tuning, 0.5)).toBe(0);
    expect(baselineEliteChance(tuning, 0.6)).toBe(0);
    expect(baselineEliteChance(tuning, 0.8)).toBeCloseTo(0.04);
    expect(baselineEliteChance(tuning, 1)).toBeCloseTo(0.08);
    expect(resolveEliteChance(tuning, 1, 0)).toBeCloseTo(0.08);
  });

  it("takes the stronger of the timer and Chaos sources", () => {
    // Early with high Chaos: Chaos wins. Late with none: the timer wins.
    expect(resolveEliteChance(tuning, 0.1, 0.3)).toBeCloseTo(0.3);
    expect(resolveEliteChance(tuning, 1, 0.02)).toBeCloseTo(0.08);
    expect(resolveEliteChance(tuning, 0.1, -1)).toBe(0);
  });
});

describe("milestone waves", () => {
  it("fires once when progress crosses a role unlock", () => {
    expect(crossedUnlocks(tuning, 0.19, 0.21).map((role) => role.enemyId)).toEqual([
      archetypeIds.enemy.fastFragile,
    ]);
    expect(crossedUnlocks(tuning, 0.21, 0.3)).toEqual([]);
    expect(crossedUnlocks(tuning, 0.39, 0.46).map((role) => role.enemyId)).toEqual([
      archetypeIds.enemy.slowDurable,
      archetypeIds.enemy.deathSpawner,
    ]);
  });

  it("never announces the opening role or fires backwards", () => {
    expect(crossedUnlocks(tuning, 0, 0.1)).toEqual([]);
    expect(crossedUnlocks(tuning, 0.5, 0.1)).toEqual([]);
  });

  it("grows the burst as the run progresses", () => {
    expect(enemiesInWave(tuning, 0)).toBe(15);
    expect(enemiesInWave(tuning, 1)).toBe(30);
    expect(enemiesInWave(tuning, 0.5)).toBeGreaterThan(enemiesInWave(tuning, 0.2));
  });
});

describe("resolved plan", () => {
  const world = { enemySpawnMultiplier: 2, eliteChance: 0.01, chaos: 3 };

  it("applies the world spawn multiplier to cadence", () => {
    const plan = resolveDirectorPlan(tuning, 0, world);
    expect(plan.intervalMs).toBeCloseTo(spawnIntervalMs(tuning, 0) / 2);
  });

  it("survives a zero or negative multiplier without dividing by zero", () => {
    const plan = resolveDirectorPlan(tuning, 0.5, { ...world, enemySpawnMultiplier: 0 });
    expect(Number.isFinite(plan.intervalMs)).toBe(true);
    expect(plan.intervalMs).toBeGreaterThan(0);
  });

  it("is run-length independent — the same progress gives the same plan", () => {
    const atHalf = resolveDirectorPlan(tuning, runProgress(150_000, 300_000), world);
    const atHalfOfTen = resolveDirectorPlan(tuning, runProgress(300_000, 600_000), world);
    expect(atHalf).toEqual(atHalfOfTen);
  });
});

describe("both production themes", () => {
  it("declare a role at progress zero so a run opens with something to fight", () => {
    for (const theme of [ecoGuardianTheme, knightMagicTheme]) {
      expect(roleWeights(theme.tuning.director, 0).length).toBeGreaterThan(0);
    }
  });

  it("unlock every declared role before the run ends", () => {
    for (const theme of [ecoGuardianTheme, knightMagicTheme]) {
      expect(roleWeights(theme.tuning.director, 1)).toHaveLength(
        theme.tuning.director.roles.length,
      );
    }
  });
});

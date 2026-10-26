import type { EnemyDefinition, EliteDefinition } from "../../../src/game/core/archetypes/contracts";
import { expect, it } from "vitest";
import { ecoGuardianTheme as theme } from "../../../src/game/content/themes/eco-guardian";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { roleWeights } from "../../../src/game/systems/director/spawn-director";
import { resolveDifficultyTheme } from "../../../src/game/systems/difficulty/resolve-difficulty";
import { simulatePacing } from "../../../src/game/systems/simulation/pacing-simulator";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";
import { createDeathSpawns } from "../../../src/game/systems/spawning";
import { eliteSplitCount } from "../../../src/game/systems/elites/elites";

// Historical Q6 fixture, kept separate from the final tuning: isolate G1's
// Glass change from the simulator corrections or an unrelated weapon/XP buff.
const before = { ...theme, enemies: theme.enemies.map((e) => e.id === ids.enemy.slowDurable ? { ...e, armour: 40 } : e),
  tuning: { ...theme.tuning, director: { ...theme.tuning.director,
    roles: theme.tuning.director.roles.map((r) => r.enemyId === ids.enemy.slowDurable ? { ...r, baseWeight: 12 } : r) } } };

it("reduces Glass's compounded cost and share while preserving a distinct durable role in every preset", () => {
  for (const difficulty of ["beginner", "normal", "experienced"] as const) {
    const current = resolveDifficultyTheme(theme, difficulty), old = resolveDifficultyTheme(before, difficulty);
    const glass = current.enemies.find((e) => e.id === ids.enemy.slowDurable)!;
    const bottle = current.enemies.find((e) => e.id === ids.enemy.swarmBasic)!;
    const oldGlass = old.enemies.find((e) => e.id === ids.enemy.slowDurable)!;
    const work = (e: typeof glass) => e.maxHealth * (1 + e.armour / 100);
    expect(work(glass)).toBeGreaterThan(work(bottle) * 4);
    expect(work(glass)).toBeLessThan(work(oldGlass));
    expect(glass.maxHealth).toBe(oldGlass.maxHealth);
    expect(glass.moveSpeed).toBe(oldGlass.moveSpeed);
    expect(glass.contactDamage).toBe(oldGlass.contactDamage);
    expect(glass.xpReward).toBe(oldGlass.xpReward);
    for (const progress of [current.tuning.director.roles.find((role) => role.enemyId === ids.enemy.slowDurable)!.unlockAt, .6, 1]) {
      const share = (weights: ReturnType<typeof roleWeights>) => weights.find((r) => r.enemyId === ids.enemy.slowDurable)!.weight / weights.reduce((n, r) => n + r.weight, 0);
      expect(share(roleWeights(current.tuning.director, progress))).toBeLessThan(share(roleWeights(old.tuning.director, progress)));
    }
    const options = { build: findBuildModel("two-tools-packed")!, durationMs: 300_000, difficulty };
    const improved = simulatePacing({ ...options, theme }), baseline = simulatePacing({ ...options, theme: before });
    expect(improved.remainingEffectiveWorkByRole[ids.enemy.slowDurable]!).toBeLessThan(baseline.remainingEffectiveWorkByRole[ids.enemy.slowDurable]!);
    expect(improved.finalLevel).toBeGreaterThanOrEqual(baseline.finalLevel);
  }
});

it("keeps ordinary and splitting Bagged Waste reward/work finite including the inherited primary family", () => {
  const budget = (elite = false) => {
    const variant: EliteDefinition | undefined = elite ? theme.elites.find((e) => "split" in e)! : undefined;
    const queue: { definition: EnemyDefinition; depth: number; source: number }[] = [{ definition: theme.enemies.find((e) => e.id === ids.enemy.deathSpawner)!, depth: 0, source: 1 }];
    let deaths = 0, xp = 0, work = 0;
    while (queue.length) {
      const { definition, depth, source } = queue.shift()!;
      if (++deaths > 100) throw new Error("Unbounded authored family");
      xp += definition.xpReward * source * (variant?.rewardMultiplier ?? 1);
      work += definition.maxHealth * (1 + definition.armour / 100) * (variant?.healthMultiplier ?? 1);
      for (let i = 0; i < eliteSplitCount(variant, depth); i++) queue.push({ definition, depth: depth + 1, source: source * variant!.split!.rewardMultiplier });
      for (const spawn of createDeathSpawns(definition, String(deaths), `death-${deaths}`)) {
        const child = theme.enemies.find((e) => e.id === spawn.enemyId)!;
        expect(child.id).not.toBe(ids.enemy.deathSpawner);
        for (let i = 0; i < spawn.count; i++) queue.push({ definition: child, depth, source: spawn.rewardMultiplier });
      }
    }
    return { deaths, xp, work };
  };
  const ordinary = budget(), split = budget(true);
  expect(ordinary.deaths).toBe(6); expect(ordinary.xp).toBe(10.5);
  expect(split.deaths).toBe(28); expect(split.xp).toBe(80);
  // The family is a larger commitment, without paying more XP per unit work.
  expect(split.xp / split.work).toBeLessThan(ordinary.xp / ordinary.work);
  const shards = theme.enemies.find((e) => e.id === ids.enemy.stationaryFragment)!;
  expect(shards.moveSpeed).toBe(0); expect(shards.maxHealth).toBeGreaterThan(0);
  expect(shards.xpReward).toBe(1); expect(createDeathSpawns(shards, "shard", "death")).toEqual([]);
});

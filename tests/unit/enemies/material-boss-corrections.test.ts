import { expect, it } from "vitest";
import { ecoGuardianTheme as source } from "../../../src/game/content/themes/eco-guardian";
import type { EnemyDefinition, ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { enemyFragmentChance, dropChance } from "../../../src/game/systems/economy/economy";
import { advanceBossAttack, createBossAttack } from "../../../src/game/systems/bosses/bosses";
import { arrivalClusterCount } from "../../../src/game/systems/director/arrival-cluster";
import { validateTheme } from "../../../src/game/content/define-theme";
const theme: ThemeManifest = source;
const enemy = (id: string): EnemyDefinition => theme.enemies.find((e) => e.id === id)!;
it("respects material breakage and transfers natural groups from butts to microplastics", () => {
  for (const id of [ids.enemy.clusterFodder, ids.enemy.committedCharger]) {
    expect(enemyFragmentChance(enemy(id), source.economy, 0, 10, .1, false, 0)).toBe(0);
    expect(enemy(id).fragmentInto).toBeUndefined();
  }
  expect(enemy(ids.enemy.slowDurable).fragmentInto).toBe(ids.enemy.stationaryFragment);
  expect(enemy(ids.enemy.swarmBasic).fragmentInto).toBe(ids.enemy.fastFragile);
  expect(arrivalClusterCount(enemy(ids.enemy.clusterFodder), 100)).toBe(1);
  expect(arrivalClusterCount(enemy(ids.enemy.fastFragile), 100)).toBe(3);
  expect(arrivalClusterCount(enemy(ids.enemy.fastFragile), 2)).toBe(2);
  expect(enemy(ids.enemy.gustDrifter).airborne).toBe(true);
  expect(enemy(ids.enemy.gustDrifter).committedMotion).toBeUndefined();
});
it("bosses shed more mixed fragments but never recursively summon bosses", () => {
  const normal = enemyFragmentChance(enemy(ids.enemy.swarmBasic), source.economy, 0, 4, .2, false, 0);
  for (const id of [ids.enemy.miniBoss, ids.enemy.finalBoss]) {
    const boss = enemy(id);
    expect(enemyFragmentChance(boss, source.economy, 0, 4, .2, false, 0)).toBeGreaterThan(normal);
    expect(enemyFragmentChance(boss, source.economy, 10000, 1, 1, true, 6)).toBe(boss.fragmentation!.minimumChance);
    expect(boss.fragmentation!.pool.every((id) => !enemy(id).boss)).toBe(true);
  }
  const mini = enemy(ids.enemy.miniBoss);
  const miniTypes = new Set(mini.boss!.summons!.patterns.flatMap((p) => p.entries.map((e) => e.enemyId)));
  expect(miniTypes.has(ids.enemy.deathSpawner)).toBe(false);
  expect(miniTypes.has(ids.enemy.slowDurable)).toBe(false);
  const final = enemy(ids.enemy.finalBoss);
  expect(new Set(final.boss!.summons!.nearDeath!.entries.map((e) => e.enemyId))).toEqual(new Set(theme.enemies.filter((e) => !e.boss).map((e) => e.id)));
});
it("cycles distinct telegraphed releases and uses the near-death mixed attack only once", () => {
  const boss = enemy(ids.enemy.finalBoss).boss!;
  let state = createBossAttack(0, boss);
  const released: string[] = [];
  for (const healthFraction of [1, .8, .5, .19, .1, .05]) {
    const warning = advanceBossAttack(state, boss, state.nextAtMs, { x: 20, y: 30, healthFraction }, { x: 900, y: 900, radius: 10 });
    expect(warning.released).toBe(false);
    expect(warning.summons).toBeUndefined();
    const at = warning.state.warning!.releaseAtMs;
    const held = advanceBossAttack(warning.state, boss, at - 1, { x: 200, y: 300, healthFraction }, { x: 900, y: 900, radius: 10 });
    expect(held.state).toBe(warning.state);
    const pulse = advanceBossAttack(held.state, boss, at, { x: 200, y: 300, healthFraction }, { x: 900, y: 900, radius: 10 });
    expect(pulse.released).toBe(true); expect(pulse.damage).toBe(0);
    released.push(pulse.summons!.name);
    expect(pulse.summons!.entries.every((e) => e.rewardMultiplier === 1)).toBe(true);
    expect(advanceBossAttack(pulse.state, boss, at, { x: 0, y: 0 }, { x: 0, y: 0, radius: 10 }).released).toBe(false);
    state = pulse.state;
  }
  expect(new Set(released.slice(0, 3)).size).toBe(3);
  expect(released.filter((name) => name === boss.summons!.nearDeath!.name)).toHaveLength(1);
  expect(released[3]).toBe(boss.summons!.nearDeath!.name);
});
it("reduces baseline rare-item frequency by over two thirds while preserving Fortune and rat bonuses", () => {
  const chance = Object.values(source.economy.dropChances).reduce((sum, n) => sum + n, 0);
  expect(chance).toBeLessThan(.012 / 3);
  expect(source.economy.dropChances.food).toBeGreaterThan(source.economy.dropChances.magnet);
  expect(dropChance(source.economy.dropChances.food, 100, source.economy)).toBeGreaterThan(source.economy.dropChances.food);
  expect(enemy(ids.enemy.scavenger).scavenger!.itemMultiplier).toBeGreaterThan(1);
  expect(source.economy.maxDropChance).toBeLessThan(.08);
});
it("rejects recursive, unbounded or empty summon/fragment definitions", () => {
  const final = enemy(ids.enemy.finalBoss);
  const invalid = (changed: EnemyDefinition) => validateTheme({ ...theme, enemies: theme.enemies.map((e) => e.id === final.id ? changed : e) }).join();
  expect(invalid({ ...final, fragmentation: { ...final.fragmentation!, pool: [ids.enemy.finalBoss] } })).toContain("invalid bounded material fragments");
  expect(invalid({ ...final, boss: { ...final.boss!, summons: { patterns: [] } } })).toContain("summon cycle needs patterns");
  expect(invalid({ ...final, boss: { ...final.boss!, summons: { patterns: [{ name: "bad", spreadRadius: 80, entries: [{ enemyId: ids.enemy.miniBoss, count: 99, rewardMultiplier: 1 }] }] } } })).toContain("invalid bounded boss summons");
});

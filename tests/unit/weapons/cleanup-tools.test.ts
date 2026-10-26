import { describe, expect, it } from "vitest";
import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { resolveCleanupTool, orbitHead } from "../../../src/game/systems/weapons/cleanup-tools";
import { createRunState } from "../../../src/game/state/run-state";
import { applyUpgrade, isUpgradeAvailable } from "../../../src/game/systems/upgrades";
import { describeUpgrade } from "../../../src/game/systems/upgrades/describe-upgrade";
import { isTiered } from "../../../src/game/systems/upgrades/upgrade-tiers";
import { fragmentationChance } from "../../../src/game/systems/economy/economy";
import { rollDamage } from "../../../src/game/systems/combat";
const theme: ThemeManifest = ecoGuardianTheme;
for (const weapon of theme.weapons.filter((w) => w.cleanup && w.id !== ids.weapon.secondaryEvolved)) describe(weapon.id, () => {
  for (const track of weapon.cleanup!.tracks) it(`resolves five fixed levels for ${track.stat}, ignores rarity, and caps picks`, () => {
    const upgrade = theme.upgrades.find((u) => u.id === track.id)!;
    const initial = createRunState({ themeId: theme.id, characterId: ids.character.starter, baseStats: theme.characters[0]!.baseStats, weaponSlotCount: theme.weaponSlotCount });
    let state = { ...initial, weaponSlots: [{ weaponId: weapon.id, nextAttackAtMs: 123 }] };
    expect(isTiered(upgrade)).toBe(false);
    for (let level = 1; level <= 5; level++) {
      const tool = resolveCleanupTool(weapon.cleanup!, state.selectedUpgradeIds);
      expect(tool[track.stat]).toBeCloseTo(weapon.cleanup![track.stat] + (level - 1) * track.step);
      if (level === 5) break;
      const preview = describeUpgrade(state, upgrade, theme, "unique");
      const after = applyUpgrade(state, upgrade, undefined, 4, theme.weapons);
      expect(preview.qualityRelevant).toBe(false);
      expect(preview.lines.length).toBeGreaterThan(0);
      expect(after.weaponSlots).toEqual(state.weaponSlots);
      expect(after.player).toEqual(state.player);
      state = after;
    }
    expect(isUpgradeAvailable(upgrade, state.selectedUpgradeIds, state)).toBe(false);
    expect(applyUpgrade(state, upgrade, undefined, 4, theme.weapons)).toBe(state);
  });
});
it("makes critical and clean hits, Fortune and careful cleanup reduce fragmentation", () => {
  const e = ecoGuardianTheme.economy;
  const weak = fragmentationChance(e, 0, 4, .2, false, 0);
  for (const reduced of [fragmentationChance(e, 0, 1, 1, false, 0), fragmentationChance(e, 0, 4, .2, true, 0), fragmentationChance(e, 40, 4, .2, false, 0), fragmentationChance(e, 0, 4, .2, false, 3)]) expect(reduced).toBeLessThan(weak);
  expect(fragmentationChance(e, 1000, 4, .1, false, 6)).toBe(0);
  expect(e.fragmentation.parentShare).toBeLessThan(1);
  expect(e.fragmentation.totalShare).toBeGreaterThan(1);
  expect(e.fragmentation.totalShare).toBeLessThan(1.2);
  expect(theme.enemies.find((e) => e.id === ids.enemy.fastFragile)?.fragmentInto).toBeUndefined();
  expect(theme.enemies.find((e) => e.id === ids.enemy.stationaryFragment)?.fragmentInto).toBeUndefined();
});
it("caps eco critical damage at red4x while preserving generic exponential policy", () => {
  const options = { baseDamage: 10, damageBonus: 0, critChance: 3, critDamage: 2, random: () => .99 };
  expect(rollDamage({ ...options, cappedLinear: true }).damage).toBe(40);
  expect(rollDamage({ ...options, critChance: 9, cappedLinear: true }).damage).toBe(40);
  expect(rollDamage(options).damage).toBe(80);
  expect(ecoGuardianTheme.economy.criticalPresentation.map((s) => s.size)).toEqual([20, 26, 30]);
});
it("keeps orbit head and tangent independent of bitmap dimensions", () => {
  expect(orbitHead(0, 80)).toEqual({ x: 80, y: 0, rotation: Math.PI / 2 });
  expect(orbitHead(Math.PI / 2, 80).y).toBeCloseTo(80);
});
it("opens with cigarette butts, delays natural microplastics and keeps rare rat rewards finite", () => {
  const roles = theme.tuning.director.roles;
  expect(roles.filter((r) => r.unlockAt === 0).map((r) => r.enemyId)).toEqual([ids.enemy.clusterFodder]);
  expect(roles.find((r) => r.enemyId === ids.enemy.fastFragile)?.unlockAt).toBeGreaterThan(.2);
  const rat = theme.enemies.find((e) => e.scavenger)!;
  expect(rat.maxHealth).toBeGreaterThan(100);
  expect(rat.scavenger!.leakBudget).toBe(12);
  expect(rat.scavenger!.itemMultiplier).toBeGreaterThan(1);
});

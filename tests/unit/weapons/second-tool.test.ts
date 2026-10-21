import { describe, expect, it } from "vitest";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { applyRunUpgrade, createRunState, resetRunState } from "../../../src/game/state/run-state";
import { createSeededRandom, isUpgradeAvailable, selectUpgradeChoices } from "../../../src/game/systems/upgrades";
import { describeUpgrade, selectEquippedWeaponStats } from "../../../src/game/systems/upgrades/describe-upgrade";
import { isTiered } from "../../../src/game/systems/upgrades/upgrade-tiers";
import { selectMeleeHits, type MeleeTarget } from "../../../src/game/systems/weapons/melee-stab";
import { selectSplashHits } from "../../../src/game/systems/weapons/on-hit-splash";
import { resolveWeaponDefinition } from "../../../src/game/systems/weapons/resolve-weapon";
import { createRunStatistics, recordCommittedDamage, sumDamageBreakdown } from "../../../src/game/systems/statistics/run-statistics";
import { shouldExplodeOnKill } from "../../../src/game/systems/effects/on-kill-effects";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";

const point = (targetId: string, x: number, y: number, radius = 0): MeleeTarget => ({ targetId, x, y, radius, active: true });

describe.each([ecoGuardianTheme, knightMagicTheme])("second tool in $id", (theme) => {
  const secondary = theme.weapons.find((weapon) => weapon.id === ids.weapon.secondary)!;
  const acquisition = theme.upgrades.find((upgrade) => upgrade.id === ids.upgrade.equipSecondary)!;
  const own = secondary.upgrades![0]!;
  const base = () => ({ ...createRunState({ themeId: theme.id, characterId: ids.character.starter,
    baseStats: theme.characters[0]!.baseStats, weaponSlotCount: theme.weaponSlotCount }), status: "level_up" as const,
    progression: { level: 2, xp: 0, xpToNextLevel: 4, pendingChoices: 3 } });

  it("offers acquisition first and only offers owner cards after equipping", () => {
    const run = base();
    expect(isUpgradeAvailable(own, [], run)).toBe(false);
    expect(isUpgradeAvailable(acquisition, [], run)).toBe(true);
    const choices = selectUpgradeChoices(theme.upgrades, theme.upgrades.filter((upgrade) => isUpgradeAvailable(upgrade, [], run)).length,
      createSeededRandom(9), run);
    expect(choices).toContain(acquisition);
    expect(choices).not.toContain(own);
    const equipped = applyRunUpgrade(run, acquisition, undefined, 3, theme.weapons);
    expect(equipped.weaponSlots.map((slot) => slot.weaponId)).toEqual([ids.weapon.starter, ids.weapon.secondary]);
    expect(equipped.progression.pendingChoices).toBe(2);
    expect(isUpgradeAvailable(acquisition, equipped.selectedUpgradeIds, equipped)).toBe(false);
    expect(isUpgradeAvailable(own, equipped.selectedUpgradeIds, equipped)).toBe(true);
    expect(applyRunUpgrade(equipped, acquisition, undefined, 1, theme.weapons)).toBe(equipped);
    expect(isTiered(acquisition)).toBe(false);
    expect(describeUpgrade(run, acquisition, theme, "unique")).toMatchObject({ level: 0, nextLevel: 1, maxLevel: 1, isNew: true, tier: "common" });
    const afterChoices = selectUpgradeChoices(theme.upgrades, theme.upgrades.filter((upgrade) => isUpgradeAvailable(upgrade, equipped.selectedUpgradeIds, equipped)).length,
      createSeededRandom(9), equipped);
    expect(afterChoices).toContain(own);
    expect(afterChoices).not.toContain(acquisition);
  });

  it("scales owner gains by the rolled tier without changing another slot or global gains", () => {
    const run = applyRunUpgrade(base(), acquisition, undefined, 1, theme.weapons);
    const upgraded = applyRunUpgrade(run, own, undefined, 1.7, theme.weapons);
    expect(upgraded.weaponModifiers.range).toBe(0);
    expect(upgraded.ownedWeaponModifiers[secondary.id]?.range).toBeCloseTo(20.4);
    const resolved = resolveWeaponDefinition(secondary, { ...upgraded.weaponModifiers, range: 10 }, upgraded.ownedWeaponModifiers[secondary.id]);
    expect(resolved.range).toBeCloseTo(120.4);
    expect(resolveWeaponDefinition(theme.weapons[0]!, upgraded.weaponModifiers, upgraded.ownedWeaponModifiers[ids.weapon.starter]).range)
      .toBe(theme.weapons[0]!.range);
    expect(describeUpgrade(run, own, theme, "rare").lines.some((line) => line.label === theme.copy.stats.range)).toBe(true);
    const reset = resetRunState(upgraded);
    expect(reset.weaponSlots).toHaveLength(1);
    expect(reset.ownedWeaponModifiers).toEqual({});
    expect(reset.weaponSlotCount).toBe(2);
    expect(JSON.parse(JSON.stringify(upgraded))).toEqual(upgraded);
  });

  it("keeps integer owner gains rounded/floored and exposes only equipped tool rows", () => {
    const initial = base();
    expect(selectEquippedWeaponStats(initial, theme)).toEqual([]);
    const equipped = applyRunUpgrade(initial, acquisition, undefined, 1, theme.weapons);
    const integerUpgrade = { ...own, effects: [{ kind: "stat.add" as const, target: "weapon.pierce" as const, value: 1 }] };
    expect(applyRunUpgrade(equipped, integerUpgrade, undefined, 1.4, theme.weapons).ownedWeaponModifiers[secondary.id]?.pierce).toBe(1);
    expect(applyRunUpgrade(equipped, integerUpgrade, undefined, 2.2, theme.weapons).ownedWeaponModifiers[secondary.id]?.pierce).toBe(2);
    const rows = selectEquippedWeaponStats(equipped, theme);
    expect(rows.map((row) => row.key)).toEqual(["damage", "attackRate", "primaryTargets", "range"]);
    expect(rows.every((row) => row.label.startsWith(theme.copy.content[secondary.id].name))).toBe(true);
    expect(rows.find((row) => row.key === "range")?.value).toBe(secondary.range);
  });

  it("removes acquisition from a full loadout and owner cards at their caps", () => {
    const run = { ...base(), weaponSlotCount: 1 };
    expect(isUpgradeAvailable(acquisition, [], run)).toBe(false);
    expect(applyRunUpgrade(run, acquisition, undefined, 1, theme.weapons)).toBe(run);
    const equipped = applyRunUpgrade(base(), acquisition, undefined, 1, theme.weapons);
    expect(isUpgradeAvailable(own, Array(own.maxLevel!).fill(own.id), equipped)).toBe(false);
    expect(applyRunUpgrade(base(), own, undefined, 1, theme.weapons)).toEqual(base());
  });

  it("models both one-target and packed contact bands using authored cadence and caps", () => {
    const context = { weaponDamage: 10, weaponCooldownMs: 1000, baseCritChance: 0, critDamage: 2, liveEnemies: 20, secondaryWeapon: secondary };
    const single = findBuildModel("two-tools-single")!;
    const packed = findBuildModel("two-tools-packed")!;
    expect(single.damagePerSecond(1, context)).toBe(10);
    expect(single.damagePerSecond(2, context)).toBeCloseTo(10 + secondary.damage * 1000 / secondary.cooldownMs);
    expect(packed.damagePerSecond(2, context)).toBeGreaterThan(single.damagePerSecond(2, context));
    expect(single.damagePerSecond(2, { ...context, liveEnemies: 1 })).toBe(packed.damagePerSecond(2, { ...context, liveEnemies: 1 }));
  });
});

describe("bounded cone and on-hit splash", () => {
  const weapon = ecoGuardianTheme.weapons[1]!;
  it("clips disks against the authored sector, preserves the rear boundary, and sorts capped ties", () => {
    if (weapon.deliveryKind !== "melee") throw new Error("Expected cone");
    const targets = [point("b", 40, 0), point("a", 40, 0), point("c", 80, 30), point("far", 100, 0),
      point("side", 40, 40), point("rear", -10, 0), point("tip", 92, 0, 3)];
    expect(selectMeleeHits({ x: 0, y: 0 }, 0, weapon, targets).map((target) => target.targetId)).toEqual(["a", "b", "c"]);
    expect(selectMeleeHits({ x: 0, y: 0 }, 0, { ...weapon, targetCap: null }, targets).map((target) => target.targetId)).toEqual(["a", "b", "c", "tip"]);
    expect(selectMeleeHits({ x: 0, y: 0 }, Math.PI, weapon, targets).map((target) => target.targetId)).toEqual(["rear"]);
    const edge = point("edge", Math.cos(weapon.arcRadians! / 2) * 60, Math.sin(weapon.arcRadians! / 2) * 60 + 1, 2);
    expect(selectMeleeHits({ x: 0, y: 0 }, 0, weapon, [edge])).toEqual([edge]);
  });

  it("excludes the primary/inactive/defeated, includes disk edges, and deterministically caps splash", () => {
    const targets = [point("primary", 0, 0), point("b", 2, 0), point("a", -2, 0), point("edge", 26, 0, 2),
      { ...point("dead", 1, 0), defeated: true }, { ...point("inactive", 1, 0), active: false }, point("out", 27, 0)];
    const selected = selectSplashHits({ x: 0, y: 0 }, "primary", weapon.splash!, targets).map((target) => target.targetId);
    expect(selected).toEqual(["a", "b", "edge"]);
    expect(selectSplashHits({ x: 0, y: 0 }, "primary", weapon.splash!, [...targets].reverse()).map((target) => target.targetId)).toEqual(selected);
  });

  it("keeps splash damage distinct from direct/critical and kill explosions with an exact sum", () => {
    let stats = createRunStatistics();
    stats = recordCommittedDamage(stats, { amount: 10, source: "direct", directBase: 6, criticalBonus: 4 });
    stats = recordCommittedDamage(stats, { amount: 1.25, source: "splash", directBase: 100, criticalBonus: 100 });
    stats = recordCommittedDamage(stats, { amount: 3, source: "explosion" });
    expect(stats.damageBreakdown).toMatchObject({ direct: 6, criticalBonus: 4, splash: 1.25, explosion: 3, chainedExplosion: 0, remainder: 0 });
    expect(sumDamageBreakdown(stats.damageBreakdown)).toBe(14.25);
    expect(stats.totalDamage).toBe(14.25);
    expect(shouldExplodeOnKill("splash", true, false)).toBe(true);
    expect(shouldExplodeOnKill("explosion", true, false)).toBe(false);
  });

  it("rejects non-finite/uncapped mechanics and invalid ownership/acquisition references", () => {
    if (weapon.deliveryKind !== "melee") throw new Error("Expected cone");
    expect(validateTheme({ ...ecoGuardianTheme, weapons: [ecoGuardianTheme.weapons[0]!, { ...weapon, arcRadians: NaN }] }))
      .toContain(`${weapon.id} arcRadians must be in (0, pi]`);
    expect(validateTheme({ ...ecoGuardianTheme, weapons: [ecoGuardianTheme.weapons[0]!, { ...weapon, splash: { ...weapon.splash!, targetCap: Infinity } }] }))
      .toContain(`${weapon.id} has invalid bounded on-hit splash`);
    expect(validateTheme({ ...ecoGuardianTheme, upgrades: ecoGuardianTheme.upgrades.map((entry) => entry.id === ids.upgrade.equipSecondary
      ? { ...entry, maxLevel: null } : entry) })).toContain(`${ids.upgrade.equipSecondary} acquisition must be a standalone one-time choice`);
  });
});

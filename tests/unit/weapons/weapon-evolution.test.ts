import { describe, expect, it } from "vitest";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { applyRunUpgrade, createRunState, resetRunState } from "../../../src/game/state/run-state";
import { applyUpgrade, createSeededRandom, isUpgradeAvailable, selectUpgradeChoices } from "../../../src/game/systems/upgrades";
import { describeUpgrade, selectEquippedWeaponStats } from "../../../src/game/systems/upgrades/describe-upgrade";
import { isTiered } from "../../../src/game/systems/upgrades/upgrade-tiers";
import { recordWeaponAttack, replaceWeapon } from "../../../src/game/systems/weapons/weapon-loadout";
import { resolveWeaponDefinition } from "../../../src/game/systems/weapons/resolve-weapon";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";
import { selectMeleeHits } from "../../../src/game/systems/weapons/melee-stab";
import { selectSplashHits } from "../../../src/game/systems/weapons/on-hit-splash";

describe.each([ecoGuardianTheme, knightMagicTheme])("evolution in $id", (theme) => {
  const acquire = theme.upgrades.find((u) => u.id === ids.upgrade.equipSecondary)!;
  const reach = theme.upgrades.find((u) => u.id === ids.upgrade.secondaryRange)!;
  const evolve = theme.upgrades.find((u) => u.id === ids.upgrade.evolveSecondary)!;
  const oldWeapon = theme.weapons.find((w) => w.id === ids.weapon.secondary)!;
  const newWeapon = theme.weapons.find((w) => w.id === ids.weapon.secondaryEvolved)!;
  const base = () => createRunState({ themeId: theme.id, characterId: ids.character.starter,
    baseStats: theme.characters[0]!.baseStats, weaponSlotCount: theme.weaponSlotCount });
  const equipped = () => applyUpgrade(base(), acquire, undefined, 1, theme.weapons);
  const ready = () => {
    let state = equipped();
    for (const multiplier of [1, 1.2, 1.6, 2]) state = applyUpgrade(state, reach, undefined, multiplier, theme.weapons);
    return state;
  };

  it("unlocks by actual pick count, never inferred reach or tier strength", () => {
    let state = equipped();
    for (let picks = 0; picks < 4; picks++) {
      expect(isUpgradeAvailable(evolve, state.selectedUpgradeIds, state)).toBe(false);
      expect(applyUpgrade(state, evolve, undefined, 1, theme.weapons)).toBe(state);
      state = applyUpgrade(state, reach, undefined, 2, theme.weapons);
    }
    expect(isUpgradeAvailable(evolve, state.selectedUpgradeIds, state)).toBe(true);
    const fake = { ...equipped(), ownedWeaponModifiers: { [ids.weapon.secondary]: { range: 9999, pierce: 0, projectileCount: 0 } } };
    expect(isUpgradeAvailable(evolve, fake.selectedUpgradeIds, fake)).toBe(false);
    expect(isUpgradeAvailable(evolve, ready().selectedUpgradeIds, base())).toBe(false);
  });

  it("preserves full capacity, position, another clock, exact gains and history immutably", () => {
    const before = { ...ready(), weaponSlots: recordWeaponAttack(recordWeaponAttack(ready().weaponSlots,
      ids.weapon.starter, 100, 1000), ids.weapon.secondary, 100, 1400),
      weaponModifiers: { range: 7, pierce: 3, projectileCount: 2 } };
    const frozen = JSON.stringify(before);
    const after = applyUpgrade(before, evolve, undefined, 2, theme.weapons);
    expect(after.weaponSlots).toEqual([{ weaponId: ids.weapon.starter, nextAttackAtMs: 1100 },
      { weaponId: ids.weapon.secondaryEvolved, nextAttackAtMs: 1500 }]);
    expect(after.weaponSlotCount).toBe(2);
    expect(after.ownedWeaponModifiers[ids.weapon.secondary]).toBeUndefined();
    expect(after.ownedWeaponModifiers[newWeapon.id]).toEqual(before.ownedWeaponModifiers[oldWeapon.id]);
    expect(after.weaponModifiers).toEqual(before.weaponModifiers);
    expect(after.selectedUpgradeIds).toEqual([...before.selectedUpgradeIds, evolve.id]);
    expect(after.player).toEqual(before.player);
    expect(JSON.stringify(before)).toBe(frozen);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
    expect(resolveWeaponDefinition(newWeapon, after.weaponModifiers, after.ownedWeaponModifiers[newWeapon.id]).range)
      .toBeCloseTo(newWeapon.range + 7 + 12 * (1 + 1.2 + 1.6 + 2));
  });

  it("does not grant immediate/catch-up attacks and rejects duplicate/missing replacements", () => {
    const slots = [{ weaponId: ids.weapon.secondary, nextAttackAtMs: 5000 }, { weaponId: ids.weapon.starter, nextAttackAtMs: 8000 }];
    const replaced = replaceWeapon(slots, oldWeapon.id, newWeapon.id, theme.weapons);
    expect(replaced.map((s) => s.weaponId)).toEqual([newWeapon.id, ids.weapon.starter]);
    expect(recordWeaponAttack(replaced, newWeapon.id, 4999, newWeapon.cooldownMs)).toBe(replaced);
    expect(recordWeaponAttack(replaced, newWeapon.id, 10000, newWeapon.cooldownMs)[0]?.nextAttackAtMs).toBe(11200);
    expect(replaceWeapon(replaced, oldWeapon.id, newWeapon.id, theme.weapons)).toBe(replaced);
    expect(replaceWeapon([{ weaponId: oldWeapon.id, nextAttackAtMs: 0 }, { weaponId: newWeapon.id, nextAttackAtMs: 0 }], oldWeapon.id, newWeapon.id, theme.weapons)).toHaveLength(2);
    expect(() => replaceWeapon(slots, oldWeapon.id, newWeapon.id, [oldWeapon])).toThrow("Unknown weapon");
  });

  it("draws one evolution then removes obsolete owner/acquisition/evolution choices", () => {
    const state = ready();
    const available = theme.upgrades.filter((u) => isUpgradeAvailable(u, state.selectedUpgradeIds, state));
    expect(selectUpgradeChoices(theme.upgrades, available.length, createSeededRandom(9), state)).toContain(evolve);
    const after = applyUpgrade(state, evolve, undefined, 1, theme.weapons);
    for (const u of [acquire, reach, evolve]) expect(isUpgradeAvailable(u, after.selectedUpgradeIds, after)).toBe(false);
    expect(applyUpgrade(after, evolve, undefined, 1, theme.weapons)).toBe(after);
    expect(isUpgradeAvailable(theme.upgrades.find((u) => u.id === ids.upgrade.damage)!, after.selectedUpgradeIds, after)).toBe(true);
  });

  it("commits one pending choice/tally and refuses stale choices without consuming XP", () => {
    const state = { ...ready(), status: "level_up" as const, progression: { ...ready().progression, pendingChoices: 2 } };
    const after = applyRunUpgrade(state, evolve, undefined, 2, theme.weapons);
    expect(after.progression.pendingChoices).toBe(1);
    expect(after.statistics.upgradeCounts[evolve.id]).toBe(1);
    expect(after.progression.xp).toBe(state.progression.xp);
    expect(applyRunUpgrade(after, evolve, undefined, 1, theme.weapons)).toBe(after);
    expect(applyRunUpgrade(after, reach, undefined, 1, theme.weapons)).toBe(after);
  });

  it("previews actual old-to-new stats unscaled and exposes evolved pause rows", () => {
    const before = ready();
    const description = describeUpgrade(before, evolve, theme, "unique");
    expect(isTiered(evolve)).toBe(false);
    expect(description).toMatchObject({ level: 0, nextLevel: 1, maxLevel: 1, tier: "common", isNew: true });
    expect(description.lines.find((l) => l.label === theme.copy.stats.damage)).toMatchObject({ from: "6", to: "9" });
    expect(description.lines.find((l) => l.label === theme.copy.stats.range)).toMatchObject({ from: "159.6", to: "174.6" });
    const after = applyUpgrade(before, evolve, undefined, 1, theme.weapons);
    expect(selectEquippedWeaponStats(after, theme).every((l) => l.label.startsWith(theme.copy.content[newWeapon.id].name))).toBe(true);
    const reset = resetRunState(after);
    expect(reset.weaponSlots).toEqual([{ weaponId: ids.weapon.starter, nextAttackAtMs: 0 }]);
    expect(reset.ownedWeaponModifiers).toEqual({});
    expect(reset.selectedUpgradeIds).toEqual([]);
    expect(isUpgradeAvailable(evolve, [], reset)).toBe(false);
  });

  it("validates attainable, standalone, cross-referenced evolution contracts", () => {
    const effect = evolve.effects[0]!;
    if (effect.kind !== "weapon.evolve") throw new Error("Missing evolution");
    for (const requiredPicks of [0, NaN, Infinity, 5, 1.5]) {
      expect(validateTheme({ ...theme, upgrades: theme.upgrades.map((u) => u.id === evolve.id
        ? { ...u, effects: [{ ...effect, requiredPicks }] } : u) }).join("\n")).toContain("attainable source-owned pick condition");
    }
    expect(validateTheme({ ...theme, upgrades: theme.upgrades.map((u) => u.id === evolve.id
      ? { ...u, effects: [{ ...effect, weaponId: effect.fromWeaponId }] } : u) }).join("\n")).toContain("distinct known weapons");
    expect(validateTheme({ ...theme, upgrades: theme.upgrades.map((u) => u.id === evolve.id
      ? { ...u, maxLevel: null } : u) }).join("\n")).toContain("standalone one-time choice");
    expect(validateTheme(theme)).toEqual([]);
  });

  it("uses authored caps and stable target ties for the wider cone and splash", () => {
    if (newWeapon.deliveryKind !== "melee") throw new Error("Expected melee");
    const targets = ["e", "d", "c", "b", "a"].map((targetId) => ({ targetId, x: 60, y: 0, active: true, radius: 0 }));
    expect(selectMeleeHits({ x: 0, y: 0 }, 0, newWeapon, targets).map((t) => t.targetId)).toEqual(["a", "b", "c", "d"]);
    expect(selectSplashHits({ x: 60, y: 0 }, "a", newWeapon.splash!, targets).map((t) => t.targetId)).toEqual(["b", "c", "d"]);
    expect(oldWeapon.damage).toBe(6);
    expect(oldWeapon.range).toBe(90);
  });

  it("changes contact bands only at the authored prerequisite-plus-choice level", () => {
    const model = findBuildModel("evolved-single")!;
    const context = { weaponDamage: 10, weaponCooldownMs: 1000, baseCritChance: 0, critDamage: 2,
      liveEnemies: 20, secondaryWeapon: oldWeapon, evolvedWeapon: newWeapon, evolutionLevel: 7 };
    expect(model.damagePerSecond(6, context)).toBeCloseTo(10 + 6 / 1.4);
    expect(model.damagePerSecond(7, context)).toBeCloseTo(17.5);
    expect(findBuildModel("evolved-packed")!.damagePerSecond(7, context)).toBeCloseTo(76);
  });
});

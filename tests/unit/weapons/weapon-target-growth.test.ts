import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { describe, expect, it } from "vitest";
import { archetypeIds as ids, type WeaponId } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { applyUpgrade } from "../../../src/game/systems/upgrades";
import { createRunState, resetRunState } from "../../../src/game/state/run-state";
import { resolveWeaponDefinition } from "../../../src/game/systems/weapons/resolve-weapon";
import { selectMeleeHits } from "../../../src/game/systems/weapons/melee-stab";
import { describeUpgrade } from "../../../src/game/systems/upgrades/describe-upgrade";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";

for (const theme of ([ecoGuardianTheme, knightMagicTheme] as readonly ThemeManifest[]).filter((theme) => !theme.economy)) describe(`owned capacity / ${theme.id}`, () => {
  const base = () => createRunState({ themeId: theme.id, characterId: ids.character.starter, baseStats: theme.characters[0]!.baseStats, weaponSlotCount: 2 });
  const acquire = theme.upgrades.find((u) => u.id === ids.upgrade.equipSecondary)!;
  const track = theme.upgrades.find((u) => u.id === ids.upgrade.secondaryRange)!;
  const evolve = theme.upgrades.find((u) => u.id === ids.upgrade.evolveSecondary)!;
  const resolve = (state: ReturnType<typeof base>, id: WeaponId = ids.weapon.secondary) => resolveWeaponDefinition(theme.weapons.find((w) => w.id === id)!, state.weaponModifiers, state.ownedWeaponModifiers[id], state.selectedUpgradeIds);

  it("grows only on actual owner picks, preserves clocks/splash and retains growth at evolution/reset", () => {
    let state = applyUpgrade(base(), acquire, undefined, 1, theme.weapons);
    const targets = Array.from({ length: 12 }, (_, i) => ({ targetId: String(i).padStart(2, "0"), x: 60, y: 0, active: true, radius: 0 })).reverse();
    for (let pick = 0; pick <= 4; pick++) {
      const weapon = resolve(state);
      if (weapon.deliveryKind !== "melee") throw new Error("Expected cone");
      expect(weapon.targetCap).toBe(3 + pick);
      expect(selectMeleeHits({ x: 0, y: 0 }, 0, weapon, targets).map((t) => t.targetId)).toEqual(targets.map((t) => t.targetId).sort().slice(0, 3 + pick));
      expect(weapon.splash).toEqual(theme.weapons[1]!.splash);
      const unrelated = applyUpgrade(state, theme.upgrades.find((u) => u.id === ids.upgrade.damage)!, undefined, 2, theme.weapons);
      expect(resolve(unrelated)).toEqual(weapon);
      if (pick === 4) break;
      const preview = describeUpgrade(state, track, theme, "unique");
      expect(preview.lines.find((line) => line.label === theme.copy.stats.primaryTargets)).toMatchObject({ from: String(3 + pick), to: String(4 + pick) });
      const beforeClock = state.weaponSlots;
      state = applyUpgrade(state, track, undefined, 4, theme.weapons);
      expect(state.weaponSlots).toEqual(beforeClock);
    }
    const evolved = applyUpgrade(state, evolve, undefined, 1, theme.weapons);
    const next = resolve(evolved, ids.weapon.secondaryEvolved);
    expect(next.deliveryKind === "melee" && next.targetCap).toBe(8);
    expect(evolved.weaponSlots.map((s) => s.nextAttackAtMs)).toEqual(state.weaponSlots.map((s) => s.nextAttackAtMs));
    const reset = resetRunState(evolved);
    expect(resolve(reset).deliveryKind === "melee" && (resolve(reset) as { targetCap: number }).targetCap).toBe(3);
    expect(applyUpgrade(state, track, undefined, 4, theme.weapons)).toBe(state);
  });

  it("rejects unbounded/fractional/unowned growth definitions", () => {
    for (const perPick of [0, 0.5, Infinity, NaN]) expect(validateTheme({ ...theme, weapons: theme.weapons.map((w) => w.id === ids.weapon.secondary && w.deliveryKind === "melee" ? { ...w, targetGrowth: { ...w.targetGrowth!, perPick } } : w) }).join()).toContain("finite attainable owned track");
  });

  it("models the same capacity steps without growing isolated contact or splash caps", () => {
    const context = { weaponDamage: 10, weaponCooldownMs: 1000, baseCritChance: 0, critDamage: 2, liveEnemies: 50,
      secondaryWeapon: theme.weapons[1], evolvedWeapon: theme.weapons[2], evolutionLevel: 7 };
    const packed = findBuildModel("evolved-packed")!;
    const single = findBuildModel("evolved-single")!;
    expect(packed.damagePerSecond(6, context)).toBeGreaterThan(packed.damagePerSecond(2, context));
    expect(packed.damagePerSecond(7, context)).toBeGreaterThan(packed.damagePerSecond(6, context));
    expect(packed.damagePerSecond(30, context)).toBe(packed.damagePerSecond(7, context));
    expect(single.damagePerSecond(6, context)).toBe(single.damagePerSecond(2, context));
  });
});

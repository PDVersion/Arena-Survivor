import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { difficultyIds } from "../../../src/game/core/archetypes/difficulty";
import { resolveDifficultyTheme } from "../../../src/game/systems/difficulty/resolve-difficulty";
import { applyDamage, reduceByArmour, rollDamage } from "../../../src/game/systems/combat";
import { createWorldState, selectWorldModifiers } from "../../../src/game/systems/chaos/world-modifiers";
import { contentStatRows } from "../../../src/tools/content-stats";

describe("opening Cigarette Butts", () => {
  it.each(difficultyIds)("dies to one unupgraded non-critical hit throughout the opening step in %s", (difficulty) => {
    const theme = resolveDifficultyTheme(ecoGuardianTheme, difficulty);
    const enemy = theme.enemies.find((entry) => entry.id === archetypeIds.enemy.clusterFodder)!;
    const weapon = theme.weapons[0]!;
    const player = theme.characters[0]!.baseStats;
    const roll = rollDamage({ baseDamage: weapon.damage, damageBonus: player.damageBonus,
      critChance: player.critChance, critDamage: player.critDamage, random: () => 0.99 });
    expect(roll.critical).toBe(false);
    const hit = reduceByArmour(roll.damage, enemy.armour, weapon.armourPierce);
    for (const progress of [0, 0.099]) {
      const modifiers = selectWorldModifiers(createWorldState(), theme.tuning.difficulty, progress);
      expect(applyDamage(enemy.maxHealth * modifiers.enemyHealthMultiplier, hit).killed).toBe(true);
    }
    const latePressure = selectWorldModifiers({ ...createWorldState(), chaos: 3 }, theme.tuning.difficulty, 1);
    expect(applyDamage(enemy.maxHealth * latePressure.enemyHealthMultiplier, hit).killed).toBe(false);
    expect(contentStatRows(theme, enemy.id).find((row) => row.label === "Starter hits (non-critical)")?.value).toBe(1);
    expect(contentStatRows(theme, enemy.id).find((row) => row.label === theme.copy.stats.health)?.value).toBe(enemy.maxHealth);
  });

  it("retains time-only escalation past one-hit in Experienced", () => {
    const theme = resolveDifficultyTheme(ecoGuardianTheme, "experienced");
    const enemy = theme.enemies.find((entry) => entry.id === archetypeIds.enemy.clusterFodder)!;
    const modifiers = selectWorldModifiers(createWorldState(), theme.tuning.difficulty, 0.1);
    expect(applyDamage(enemy.maxHealth * modifiers.enemyHealthMultiplier, theme.weapons[0]!.damage).killed).toBe(false);
  });
});

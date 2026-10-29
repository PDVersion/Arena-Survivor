import { expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { validateTheme } from "../../../src/game/content/define-theme";
import { resolveDifficultyTheme } from "../../../src/game/systems/difficulty/resolve-difficulty";
import { createDeathSpawns } from "../../../src/game/systems/spawning";
import { selectMeleeHits } from "../../../src/game/systems/weapons/melee-stab";
import { createWorldState, selectWorldModifiers } from "../../../src/game/systems/chaos/world-modifiers";
for (const theme of [ecoGuardianTheme, knightMagicTheme]) it(`${theme.id} weak clusters are readable finite independent targets, not recursive bag offspring`, () => {
  const definition = theme.enemies.find((e) => e.id === ids.enemy.clusterFodder)!;
  expect(validateTheme(theme)).toEqual([]);
  expect(definition.displayDiameter).toBeGreaterThan(definition.radius * 2);
  expect(definition.moveSpeed).toBeLessThan(theme.enemies.find((e) => e.id === ids.enemy.fastFragile)!.moveSpeed);
  expect("fragmentInto" in definition).toBe(false);
  expect(createDeathSpawns(definition, "parent", "death")).toEqual([]);
  for (const difficulty of ["beginner", "normal", "experienced"] as const) {
    const resolved = resolveDifficultyTheme(theme, difficulty);
    const enemy = resolved.enemies.find((e) => e.id === definition.id)!;
    const mods = selectWorldModifiers(createWorldState(), resolved.tuning.difficulty, 0);
    expect(enemy.maxHealth * mods.enemyHealthMultiplier).toBeLessThanOrEqual(resolved.weapons[0]!.damage);
  }
  const cone = theme.weapons.find((w) => w.id === ids.weapon.secondary)!;
  if (cone.deliveryKind !== "melee") throw new Error("Expected cone");
  const targets = [-1, 0, 1].map((i) => ({ targetId: String(i), x: 60, y: i * 20, radius: definition.radius, active: true }));
  expect(selectMeleeHits({ x: 0, y: 0 }, 0, cone, targets)).toHaveLength(3);
  const formation = theme.enemies.find((e) => "arrivalCluster" in e)!;
  const spacing = "arrivalCluster" in formation ? formation.arrivalCluster.spacing : 0;
  const starter = theme.weapons[0]!;
  if (starter.deliveryKind === "melee") {
    const spaced = [-1, 0, 1].map((i) => ({ targetId: String(i), x: 70, y: i * spacing, radius: definition.radius, active: true }));
    expect(selectMeleeHits({ x: 0, y: 0 }, 0, starter, spaced)).toHaveLength(1);
    expect(selectMeleeHits({ x: 0, y: 0 }, 0, cone, spaced)).toHaveLength(3);
  }
});
it("rejects unbounded/invalid group counts, spacing, introduction and presentation", () => {
  const theme = ecoGuardianTheme;
  for (const count of [0, 1.5, NaN, Infinity]) {
    expect(validateTheme({ ...theme, enemies: theme.enemies.map((e) => e.id === ids.enemy.clusterFodder
      ? { ...e, arrivalCluster: { count, spacing: 34 } } : e) }).join()).toContain("finite count and body-separated spacing");
  }
  expect(validateTheme({ ...theme, enemies: theme.enemies.map((e) => e.id === ids.enemy.clusterFodder
    ? { ...e, primitiveParts: [{ x: 0, y: 0, width: 2, height: 1, token: "text", rotation: 0 }] } : e) }).join()).toContain("bounded valid presentation");
});

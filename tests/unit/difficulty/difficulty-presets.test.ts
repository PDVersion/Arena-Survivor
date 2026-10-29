import { describe, expect, it } from "vitest";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { validateTheme } from "../../../src/game/content/define-theme";
import { difficultyIds } from "../../../src/game/core/archetypes/difficulty";
import { resolveDifficultyTheme } from "../../../src/game/systems/difficulty/resolve-difficulty";
import { createSettings, cycleDifficulty } from "../../../src/game/state/settings-state";
import { createRunState } from "../../../src/game/state/run-state";
import { simulatePacing } from "../../../src/game/systems/simulation/pacing-simulator";
import { resolveWeaponDefinition } from "../../../src/game/systems/weapons/resolve-weapon";
import { createWeaponStatModifiers } from "../../../src/game/systems/upgrades";
import { resolveCleanupTool } from "../../../src/game/systems/weapons/cleanup-tools";
import { findBuildModel } from "../../../src/game/systems/simulation/build-models";

describe("difficulty presets", () => {
  it("orders pressure without changing the original theme, geometry or gameplay clock", () => {
    for (const { theme } of themeRegistry) {
      const original = structuredClone(theme);
      const [beginner, normal, experienced] = difficultyIds.map((id) => resolveDifficultyTheme(theme, id));
      expect(normal!.tuning.director.baseIntervalMs).toBeGreaterThan(theme.tuning.director.baseIntervalMs);
      expect(beginner!.tuning.director.baseIntervalMs).toBeGreaterThan(normal!.tuning.director.baseIntervalMs);
      expect(experienced!.tuning.director.baseIntervalMs).toBeLessThan(normal!.tuning.director.baseIntervalMs);
      for (const resolved of [beginner!, normal!, experienced!]) {
        expect(resolved.tuning.pace).toEqual(theme.tuning.pace);
        expect(resolved.tuning.view).toEqual(theme.tuning.view);
        for (const [index, enemy] of resolved.enemies.entries()) {
          expect(enemy.radius).toBe(theme.enemies[index]!.radius);
          expect(enemy.id).toBe(theme.enemies[index]!.id);
          expect(enemy.moveSpeed).toBeLessThan(resolved.characters[0]!.baseStats.moveSpeed);
        }
      }
      expect(beginner!.characters[0]!.baseStats.maxHealth).toBeGreaterThan(normal!.characters[0]!.baseStats.maxHealth);
      expect(beginner!.weapons[0]!.damage).toBeGreaterThan(normal!.weapons[0]!.damage);
      expect(beginner!.enemies[0]!.maxHealth).toBeLessThan(normal!.enemies[0]!.maxHealth);
      expect(normal!.enemies[0]!.maxHealth).toBeLessThan(experienced!.enemies[0]!.maxHealth);
      expect(theme).toEqual(original);
    }
  });

  it("keeps the run snapshot independent of subsequent session selection", () => {
    const { theme } = themeRegistry[0]!;
    const selection = createSettings({ difficulty: "beginner" });
    const resolved = resolveDifficultyTheme(theme, selection.difficulty);
    const character = resolved.characters[0]!;
    const run = createRunState({ themeId: theme.id, characterId: character.id,
      baseStats: character.baseStats, difficulty: selection.difficulty });
    expect(cycleDifficulty(selection).difficulty).toBe("normal");
    expect(run.difficulty).toBe("beginner");
    expect(run.player.health).toBe(character.baseStats.maxHealth);
    expect(createSettings().difficulty).toBe("normal");
    expect(cycleDifficulty(createSettings({ difficulty: "experienced" })).difficulty).toBe("beginner");
  });

  it("simulates every preset deterministically inside the technical cap", () => {
    for (const { theme } of themeRegistry) for (const difficulty of difficultyIds) {
      const options = { theme, difficulty, build: findBuildModel("damage-rush")!, durationMs: 300_000 };
      const result = simulatePacing(options);
      expect(result).toEqual(simulatePacing(options));
      expect(result.difficulty).toBe(difficulty);
      expect(result.peakLiveEnemies).toBeLessThanOrEqual(300);
    }
  });

  it("rejects unsafe preset multipliers", () => {
    const { theme } = themeRegistry[0]!;
    const invalid = { ...theme, tuning: { ...theme.tuning, difficultyPresets: {
      ...theme.tuning.difficultyPresets,
      normal: { ...theme.tuning.difficultyPresets.normal, spawnRate: 0 },
    } } };
    expect(validateTheme(invalid)).toContain("difficulty.normal.spawnRate must be positive");
    const incomplete = structuredClone(theme);
    Reflect.deleteProperty(incomplete.tuning.difficultyPresets.normal, "enemyDamage");
    expect(validateTheme(incomplete)).toContain("difficulty.normal.enemyDamage must be positive");
  });
});

it("retains difficulty damage and cadence through every authored Eco weapon level", () => {
  const theme = themeRegistry.find((entry) => entry.key === "eco-guardian")!.theme;
  const original = structuredClone(theme);
  for (const difficulty of difficultyIds) {
    const preset = theme.tuning.difficultyPresets[difficulty];
    const resolved = resolveDifficultyTheme(theme, difficulty);
    for (const weapon of theme.weapons) for (let picks = 0; picks < 7; picks++) {
      const id = weapon.progression?.id ?? weapon.cleanup!.progression!.id;
      const selected = Array(picks).fill(id);
      const authored = resolveWeaponDefinition(weapon, createWeaponStatModifiers(), undefined, selected);
      const actual = resolveWeaponDefinition(resolved.weapons.find((w) => w.id === weapon.id)!, createWeaponStatModifiers(), undefined, selected);
      expect(actual.damage).toBeCloseTo(authored.damage * preset.weaponDamage);
      expect(actual.cooldownMs).toBeCloseTo(authored.cooldownMs * preset.weaponCooldown);
      expect(actual.range).toBe(authored.range);
      if (weapon.cleanup) {
        const base = resolveCleanupTool(weapon.cleanup, selected);
        const tool = resolveCleanupTool(resolved.weapons.find((w) => w.id === weapon.id)!.cleanup!, selected);
        expect(tool.damage).toBeCloseTo(base.damage * preset.weaponDamage);
        expect(tool.dotDamage).toBeCloseTo(base.dotDamage * preset.weaponDamage);
        expect(tool.tickMs).toBeCloseTo(base.tickMs * preset.weaponCooldown);
        expect(tool.radius).toBe(base.radius); expect(tool.count).toBe(base.count);
      }
    }
  }
  expect(theme).toEqual(original);
});

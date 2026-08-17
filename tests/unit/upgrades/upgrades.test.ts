import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import type { UpgradeDefinition } from "../../../src/game/core/archetypes/contracts";
import {
  applyUpgrade,
  createSeededRandom,
  createWeaponStatModifiers,
  isUpgradeAvailable,
  rarityWeight,
  selectUpgradeChoices,
  upgradeLevel,
  type UpgradeableState,
} from "../../../src/game/systems/upgrades";
import { createWorldState } from "../../../src/game/systems/chaos/world-modifiers";
import { skillLevel, skillMaxLevel } from "../../../src/game/systems/skills/resolve-skill";

const character = ecoGuardianTheme.characters[0]!;
const pool = ecoGuardianTheme.upgrades;

function upgrade(id: string): UpgradeDefinition {
  const found = pool.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing upgrade ${id}`);
  return found;
}

function baseState(): UpgradeableState {
  return {
    player: { health: character.baseStats.maxHealth, stats: { ...character.baseStats } },
    weaponModifiers: createWeaponStatModifiers(),
    selectedUpgradeIds: [],
    skillLevels: {},
    world: createWorldState(),
  };
}

const maxLevelFor = (skillId: Parameters<typeof skillMaxLevel>[1]): number =>
  skillMaxLevel(ecoGuardianTheme.skills, skillId);

describe("upgrade application", () => {
  it("adds stat effects and heals when maximum health rises", () => {
    const state = applyUpgrade(baseState(), upgrade(archetypeIds.upgrade.health));
    expect(state.player.stats.maxHealth).toBe(character.baseStats.maxHealth + 25);
    expect(state.player.health).toBe(character.baseStats.maxHealth + 25);
  });

  it("raises a skill level rather than toggling it on", () => {
    let state = baseState();
    for (let take = 0; take < 3; take += 1) {
      state = applyUpgrade(state, upgrade(archetypeIds.upgrade.onKillExplosion), maxLevelFor);
    }
    expect(skillLevel(state.skillLevels, archetypeIds.skill.onKillExplosion)).toBe(3);
  });

  it("never raises a skill past its declared cap", () => {
    const cap = maxLevelFor(archetypeIds.skill.fracture);
    let state = baseState();
    for (let take = 0; take < cap + 5; take += 1) {
      state = applyUpgrade(state, upgrade(archetypeIds.upgrade.fracture), maxLevelFor);
    }
    expect(skillLevel(state.skillLevels, archetypeIds.skill.fracture)).toBe(cap);
  });

  it("applies dangerous world upgrades to world pressure", () => {
    const surged = applyUpgrade(baseState(), upgrade(archetypeIds.upgrade.worldSurge), maxLevelFor);
    expect(surged.world.enemySpawnMultiplier).toBeGreaterThan(1);
    expect(surged.world.xpMultiplier).toBeGreaterThan(1);
    expect(surged.player.stats.luck).toBeGreaterThan(0);

    const brittle = applyUpgrade(baseState(), upgrade(archetypeIds.upgrade.worldBrittle), maxLevelFor);
    expect(brittle.world.chaos).toBeGreaterThan(1);
    expect(brittle.player.stats.damageBonus).toBeGreaterThan(0);
  });

  it("records every selection in order", () => {
    let state = baseState();
    state = applyUpgrade(state, upgrade(archetypeIds.upgrade.damage), maxLevelFor);
    state = applyUpgrade(state, upgrade(archetypeIds.upgrade.pierce), maxLevelFor);
    expect(state.selectedUpgradeIds).toEqual([
      archetypeIds.upgrade.damage,
      archetypeIds.upgrade.pierce,
    ]);
  });
});

describe("upgrade availability", () => {
  it("counts how many times an upgrade was taken", () => {
    const taken = [archetypeIds.upgrade.damage, archetypeIds.upgrade.pierce, archetypeIds.upgrade.damage];
    expect(upgradeLevel(taken, archetypeIds.upgrade.damage)).toBe(2);
    expect(upgradeLevel(taken, archetypeIds.upgrade.health)).toBe(0);
  });

  it("removes a maxed upgrade from the pool", () => {
    const entry = upgrade(archetypeIds.upgrade.projectileCount);
    const taken = Array.from({ length: entry.maxLevel }, () => entry.id);

    expect(isUpgradeAvailable(entry, [])).toBe(true);
    expect(isUpgradeAvailable(entry, taken.slice(0, -1))).toBe(true);
    // The V0.2 defect: an offer that can do nothing.
    expect(isUpgradeAvailable(entry, taken)).toBe(false);
  });
});

describe("upgrade selection", () => {
  it("never offers a maxed upgrade", () => {
    const maxed = upgrade(archetypeIds.upgrade.chainReaction);
    const selected = Array.from({ length: maxed.maxLevel }, () => maxed.id);
    const random = createSeededRandom(0x31);

    for (let draw = 0; draw < 60; draw += 1) {
      const choices = selectUpgradeChoices(pool, 3, random, { selectedUpgradeIds: selected });
      expect(choices.map((choice) => choice.id)).not.toContain(maxed.id);
    }
  });

  it("returns distinct choices", () => {
    const random = createSeededRandom(0x41);
    for (let draw = 0; draw < 60; draw += 1) {
      const choices = selectUpgradeChoices(pool, 3, random);
      expect(new Set(choices.map((choice) => choice.id)).size).toBe(3);
    }
  });

  it("never offers three of the same category", () => {
    const random = createSeededRandom(0x51);
    for (let draw = 0; draw < 200; draw += 1) {
      const choices = selectUpgradeChoices(pool, 3, random);
      const categories = choices.map((choice) => choice.category);
      for (const category of new Set(categories)) {
        expect(categories.filter((entry) => entry === category).length).toBeLessThanOrEqual(2);
      }
    }
  });

  it("is deterministic for a given seed", () => {
    const first = selectUpgradeChoices(pool, 3, createSeededRandom(0x61));
    const second = selectUpgradeChoices(pool, 3, createSeededRandom(0x61));
    expect(first.map((choice) => choice.id)).toEqual(second.map((choice) => choice.id));
  });

  it("weights common above rare above epic, and luck narrows the gap", () => {
    expect(rarityWeight("common")).toBeGreaterThan(rarityWeight("rare"));
    expect(rarityWeight("rare")).toBeGreaterThan(rarityWeight("epic"));

    // Luck raises the rarer tiers only, so commons are never excluded.
    expect(rarityWeight("epic", 50)).toBeGreaterThan(rarityWeight("epic", 0));
    expect(rarityWeight("common", 50)).toBe(rarityWeight("common", 0));
  });

  it("offers rarer upgrades more often at high luck", () => {
    const countRare = (luck: number): number => {
      const random = createSeededRandom(0x71);
      let rare = 0;
      for (let draw = 0; draw < 300; draw += 1) {
        for (const choice of selectUpgradeChoices(pool, 3, random, { selectedUpgradeIds: [], luck })) {
          if (choice.rarity !== "common") rare += 1;
        }
      }
      return rare;
    };

    expect(countRare(200)).toBeGreaterThan(countRare(0));
  });

  it("throws when the pool cannot supply enough distinct choices", () => {
    expect(() => selectUpgradeChoices(pool.slice(0, 2), 3, createSeededRandom(1))).toThrow(
      /enough distinct choices/,
    );
    expect(() => selectUpgradeChoices(pool, 0, createSeededRandom(1))).toThrow(/must be positive/);
  });

  it("rejects a random source outside [0, 1)", () => {
    expect(() => selectUpgradeChoices(pool, 3, () => 1)).toThrow(/\[0, 1\)/);
  });
});

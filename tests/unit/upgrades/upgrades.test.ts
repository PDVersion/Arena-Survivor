import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import {
  applyUpgrade,
  createSeededRandom,
  createWeaponStatModifiers,
  selectUpgradeChoices,
} from "../../../src/game/systems/upgrades";

const baseStats = knightMagicTheme.characters[0]?.baseStats;
if (!baseStats) throw new Error("Missing starter stats");

describe("upgrade offers", () => {
  it("selects three distinct repeatable choices with injected randomness", () => {
    const first = selectUpgradeChoices(knightMagicTheme.upgrades, 3, createSeededRandom(42));
    const second = selectUpgradeChoices(knightMagicTheme.upgrades, 3, createSeededRandom(42));

    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id));
    expect(new Set(first.map(({ id }) => id)).size).toBe(3);
  });

  it("rejects a pool too small to make a valid distinct offer", () => {
    expect(() => selectUpgradeChoices(knightMagicTheme.upgrades.slice(0, 2), 3, Math.random)).toThrow(
      "enough distinct choices",
    );
  });
});

describe("upgrade application", () => {
  it("records selections and stacks reusable player and weapon modifiers", () => {
    let state = {
      player: { health: 60, stats: { ...baseStats } },
      weaponModifiers: createWeaponStatModifiers(),
      selectedUpgradeIds: [],
    };
    for (const upgrade of knightMagicTheme.upgrades) state = applyUpgrade(state, upgrade);

    expect(state.player).toMatchObject({
      health: 85,
      stats: {
        maxHealth: 125,
        moveSpeed: 230,
        pickupRadius: 120,
        damageBonus: 0.25,
        attackSpeedBonus: 0.2,
      },
    });
    expect(state.player.stats.critChance).toBeCloseTo(0.15);
    expect(state.weaponModifiers).toEqual({ pierce: 1, projectileCount: 1 });
    expect(state.selectedUpgradeIds).toHaveLength(8);
  });
});

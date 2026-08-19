import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { upgradeTiers } from "../../../src/game/core/archetypes/tiers";
import {
  isTiered,
  rollOfferTiers,
  rollUpgradeTier,
  scaleSkillLevels,
  scaleStatValue,
  tierMultiplier,
  tierWeight,
} from "../../../src/game/systems/upgrades/upgrade-tiers";
import { applyUpgrade, createSeededRandom, createWeaponStatModifiers } from "../../../src/game/systems/upgrades";
import { createWorldState } from "../../../src/game/systems/chaos/world-modifiers";
import type { SkillLevels } from "../../../src/game/systems/skills/resolve-skill";

const tuning = ecoGuardianTheme.tuning.upgradeTiers;

function findUpgrade(id: string) {
  return ecoGuardianTheme.upgrades.find((upgrade) => upgrade.id === id)!;
}

function state() {
  return {
    player: {
      health: 100,
      stats: { ...ecoGuardianTheme.characters[0]!.baseStats },
    },
    weaponModifiers: createWeaponStatModifiers(),
    selectedUpgradeIds: [],
    skillLevels: {} as SkillLevels,
    world: createWorldState(),
  };
}

/** Roll many tiers from one seed, as a run's worth of offers would. */
function rollMany(count: number, luck = 0, seed = 0x7e1a_0001): Map<string, number> {
  const random = createSeededRandom(seed);
  const counts = new Map<string, number>();
  for (let index = 0; index < count; index += 1) {
    const tier = rollUpgradeTier(tuning, random, luck);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  }
  return counts;
}

describe("upgrade tier ladder", () => {
  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("declares every %s rung in order, rising and starting at the authored value", (_name, theme) => {
    const declared = theme.tuning.upgradeTiers.tiers;

    expect(declared.map((entry) => entry.tier)).toEqual([...upgradeTiers]);
    // Common must be exactly what the definition says, so higher tiers are a
    // bonus rather than the baseline having been quietly nerfed.
    expect(declared[0]!.multiplier).toBe(1);
    for (let index = 1; index < declared.length; index += 1) {
      expect(declared[index]!.multiplier).toBeGreaterThanOrEqual(declared[index - 1]!.multiplier);
      expect(declared[index]!.weight).toBeLessThan(declared[index - 1]!.weight);
    }
  });

  it("ships the requested ladder", () => {
    expect(tuning.tiers.map((entry) => entry.multiplier)).toEqual([1, 1.2, 1.4, 1.6, 2, 2.5]);
  });
});

describe("rolling a tier", () => {
  it("produces the declared distribution over a run's worth of offers", () => {
    // A five-minute run is roughly thirty level-ups at three cards each.
    const counts = rollMany(9_000);
    const total = tuning.tiers.reduce((sum, entry) => sum + entry.weight, 0);

    for (const entry of tuning.tiers) {
      const share = (counts.get(entry.tier) ?? 0) / 9_000;
      expect(share).toBeCloseTo(entry.weight / total, 1);
    }
  });

  it("keeps the top of the ladder rare enough to matter in a five-minute run", () => {
    const counts = rollMany(90);
    const standout = (counts.get("legendary") ?? 0) + (counts.get("unique") ?? 0);

    // Often enough to hope for, rare enough that it is an event when it lands.
    expect(standout).toBeGreaterThan(0);
    expect(standout).toBeLessThan(12);
  });

  it("is deterministic for a seed", () => {
    expect(rollMany(200, 0, 0x1234)).toEqual(rollMany(200, 0, 0x1234));
  });

  it("shifts the roll upward with luck without ever excluding commons", () => {
    const plain = rollMany(6_000, 0);
    const lucky = rollMany(6_000, 200);

    const better = (counts: Map<string, number>): number =>
      (counts.get("epic") ?? 0) + (counts.get("legendary") ?? 0) + (counts.get("unique") ?? 0);

    expect(better(lucky)).toBeGreaterThan(better(plain));
    // Luck is a nudge, not a replacement: ordinary cards still turn up.
    expect(lucky.get("common") ?? 0).toBeGreaterThan(0);
  });

  it("never biases common, so luck can only push the ladder up", () => {
    expect(tierWeight(tuning, "common", 500)).toBe(tierWeight(tuning, "common", 0));
    expect(tierWeight(tuning, "legendary", 500)).toBeGreaterThan(tierWeight(tuning, "legendary", 0));
  });

  it("rejects a random source outside [0, 1)", () => {
    expect(() => rollUpgradeTier(tuning, () => 1)).toThrow(/\[0, 1\)/);
  });
});

describe("what a tier is worth", () => {
  it("scales a continuous stat by the multiplier", () => {
    const damage = findUpgrade(archetypeIds.upgrade.damage);
    const common = applyUpgrade(state(), damage, () => 1, 1);
    const legendary = applyUpgrade(state(), damage, () => 1, tierMultiplier(tuning, "legendary"));

    expect(legendary.player.stats.damageBonus).toBeCloseTo(common.player.stats.damageBonus * 2);
  });

  it("keeps integer stats whole and never below the authored value", () => {
    // A projectile count of 1.4 is not a thing the weapon can fire.
    expect(scaleStatValue("weapon.projectileCount", 1, 1.2)).toBe(1);
    expect(scaleStatValue("weapon.projectileCount", 1, 1.4)).toBe(1);
    expect(scaleStatValue("weapon.pierce", 1, 1.6)).toBe(2);
    expect(scaleStatValue("weapon.pierce", 1, 2)).toBe(2);
    // Rounding must never make a better roll worse than a common one.
    expect(scaleStatValue("weapon.pierce", 3, 1.05)).toBeGreaterThanOrEqual(3);
  });

  it("gives a top-tier skill card two levels rather than a fraction of one", () => {
    expect(scaleSkillLevels(1)).toBe(1);
    expect(scaleSkillLevels(1.4)).toBe(1);
    expect(scaleSkillLevels(1.6)).toBe(2);
    expect(scaleSkillLevels(2)).toBe(2);

    const explosion = findUpgrade(archetypeIds.upgrade.onKillExplosion);
    const legendary = applyUpgrade(state(), explosion, () => 8, 2);
    expect(legendary.skillLevels[archetypeIds.skill.onKillExplosion]).toBe(2);
  });

  it("never raises a skill past its own cap, however good the roll", () => {
    const explosion = findUpgrade(archetypeIds.upgrade.onKillExplosion);
    const capped = applyUpgrade(state(), explosion, () => 1, 2);

    expect(capped.skillLevels[archetypeIds.skill.onKillExplosion]).toBe(1);
  });

  it("is never worse than a common roll for any upgrade at any tier", () => {
    for (const upgrade of ecoGuardianTheme.upgrades) {
      const common = applyUpgrade(state(), upgrade, () => 8, 1);
      for (const entry of tuning.tiers) {
        const rolled = applyUpgrade(state(), upgrade, () => 8, entry.multiplier);
        for (const key of Object.keys(common.player.stats) as (keyof typeof common.player.stats)[]) {
          expect(rolled.player.stats[key]).toBeGreaterThanOrEqual(common.player.stats[key]);
        }
        expect(rolled.weaponModifiers.pierce).toBeGreaterThanOrEqual(common.weaponModifiers.pierce);
        expect(rolled.weaponModifiers.projectileCount).toBeGreaterThanOrEqual(
          common.weaponModifiers.projectileCount,
        );
      }
    }
  });
});

describe("upgrades that do not roll", () => {
  it("leaves world bargains at their authored terms", () => {
    // Scaling one half of "more pressure for more reward" changes the deal;
    // scaling both changes nothing. So these always roll common.
    for (const upgrade of ecoGuardianTheme.upgrades) {
      const hasWorldEffect = upgrade.effects.some((effect) => effect.kind === "world.modify");
      expect(isTiered(upgrade)).toBe(!hasWorldEffect);
    }
  });

  it("reports common for an untiered offer regardless of the roll", () => {
    const world = ecoGuardianTheme.upgrades.filter((upgrade) => !isTiered(upgrade));
    const offers = rollOfferTiers(world, tuning, createSeededRandom(0x99), 400);

    expect(offers.every((offer) => offer.tier === "common")).toBe(true);
  });

  it("keeps the world multiplier itself unscaled at every tier", () => {
    const surge = findUpgrade(archetypeIds.upgrade.worldSurge);
    const common = applyUpgrade(state(), surge, () => 1, 1);
    const asLegendary = applyUpgrade(state(), surge, () => 1, 2);

    expect(asLegendary.world.enemySpawnMultiplier).toBe(common.world.enemySpawnMultiplier);
    expect(asLegendary.world.xpMultiplier).toBe(common.world.xpMultiplier);
  });
});

describe("offers", () => {
  it("rolls one tier per drawn card, in draw order", () => {
    const drawn = ecoGuardianTheme.upgrades.slice(0, 3);
    const offers = rollOfferTiers(drawn, tuning, createSeededRandom(0x4242));

    expect(offers).toHaveLength(3);
    expect(offers.map((offer) => offer.definition.id)).toEqual(drawn.map((upgrade) => upgrade.id));
    for (const offer of offers) expect(upgradeTiers).toContain(offer.tier);
  });
});

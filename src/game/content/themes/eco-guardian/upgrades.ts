import { archetypeIds } from "../../../core/archetypes/ids";
import type { UpgradeDefinition } from "../../../core/archetypes/contracts";
import type { UpgradeTiersTuning } from "../../../core/archetypes/tuning";

/**
 * The level-up pool.
 *
 * Every entry declares a cap, so a maxed upgrade leaves the pool and can never
 * be offered as a no-op — under V0.2 re-picking an already-enabled skill was a
 * completely wasted level. `rarity` drives how often the upgrade *appears* and
 * `luck` shifts it; category keeps one draw from being three of the same thing.
 *
 * How good a card is once it appears is a separate per-offer roll — see
 * `upgradeTierTuning` below. The two were one field until REC-065, which is why
 * the build-defining projectile picks used to arrive so late.
 */
export const upgrades = [
  {
    id: archetypeIds.upgrade.damage,
    effects: [{ kind: "stat.add", target: "player.damageBonus", value: 0.25 }],
    maxLevel: 12, rarity: "common", category: "offense", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.attackSpeed,
    effects: [{ kind: "stat.add", target: "player.attackSpeedBonus", value: 0.2 }],
    maxLevel: 10, rarity: "common", category: "offense", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.critChance,
    effects: [{ kind: "stat.add", target: "player.critChance", value: 0.1 }],
    maxLevel: 15, rarity: "common", category: "critical", presentationToken: "critical",
  },
  {
    id: archetypeIds.upgrade.pierce,
    // Common appearance, not because it is weak but because it defines a build
    // and arriving late made the build unreachable. See REC-065.
    effects: [{ kind: "stat.add", target: "weapon.pierce", value: 1 }],
    maxLevel: 8, rarity: "common", category: "projectile", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.projectileCount,
    effects: [{ kind: "stat.add", target: "weapon.projectileCount", value: 1 }],
    maxLevel: 6, rarity: "rare", category: "projectile", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.moveSpeed,
    effects: [{ kind: "stat.add", target: "player.moveSpeed", value: 30 }],
    maxLevel: 6, rarity: "common", category: "utility", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.health,
    effects: [{ kind: "stat.add", target: "player.maxHealth", value: 25 }],
    maxLevel: 10, rarity: "common", category: "survival", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.pickupRadius,
    effects: [{ kind: "stat.add", target: "player.pickupRadius", value: 40 }],
    maxLevel: 5, rarity: "common", category: "utility", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.piercingMomentum,
    effects: [{ kind: "skill.level", skillId: archetypeIds.skill.piercingMomentum }],
    maxLevel: 6, rarity: "rare", category: "skill", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.onKillExplosion,
    effects: [{ kind: "skill.level", skillId: archetypeIds.skill.onKillExplosion }],
    maxLevel: 8, rarity: "rare", category: "skill", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.fracture,
    effects: [{ kind: "skill.level", skillId: archetypeIds.skill.fracture }],
    maxLevel: 5, rarity: "rare", category: "skill", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.bloodlust,
    effects: [{ kind: "skill.level", skillId: archetypeIds.skill.bloodlust }],
    maxLevel: 6, rarity: "rare", category: "skill", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.chainReaction,
    effects: [{ kind: "skill.level", skillId: archetypeIds.skill.chainReaction }],
    maxLevel: 5, rarity: "epic", category: "skill", presentationToken: "overcritical",
  },
  // Survivability, so the answer to every problem is not simply more damage.
  {
    id: archetypeIds.upgrade.armour,
    effects: [{ kind: "stat.add", target: "player.armour", value: 12 }],
    maxLevel: 8, rarity: "common", category: "survival", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.regeneration,
    effects: [{ kind: "stat.add", target: "player.regeneration", value: 0.8 }],
    maxLevel: 6, rarity: "rare", category: "survival", presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.luck,
    effects: [{ kind: "stat.add", target: "player.luck", value: 25 }],
    maxLevel: 6, rarity: "rare", category: "utility", presentationToken: "accent",
  },
  // The deliberately dangerous choices: more pressure bought with more reward.
  {
    id: archetypeIds.upgrade.worldSurge,
    effects: [
      { kind: "world.modify", enemySpawnMultiplier: 1.5, xpMultiplier: 1.25 },
      { kind: "stat.add", target: "player.luck", value: 20 },
    ],
    maxLevel: 4, rarity: "rare", category: "world", presentationToken: "shrine",
  },
  {
    id: archetypeIds.upgrade.worldBrittle,
    effects: [
      { kind: "stat.add", target: "player.damageBonus", value: 1 },
      { kind: "world.modify", chaosIncrease: 1 },
    ],
    maxLevel: 3, rarity: "epic", category: "world", presentationToken: "shrine",
  },
] as const satisfies readonly UpgradeDefinition[];

/**
 * The roll ladder.
 *
 * Expected sightings across a five-minute run — about thirty level-ups at three
 * cards each, so ninety cards seen — computed from these weights:
 *
 *   tier        weight   share    seen/run   gain
 *   common         100   47.3%      42.6     1.00x
 *   uncommon        58   27.4%      24.7     1.20x
 *   rare            30   14.2%      12.8     1.40x
 *   epic            14    6.6%       6.0     1.60x
 *   legendary        8    3.8%       3.4     2.00x
 *   unique         1.5    0.7%       0.6     2.50x
 *
 * That puts three or four legendaries in a five-minute run and a unique in
 * roughly every second one, which is often enough to be worth hoping for and
 * rare enough to matter. A ten-minute run doubles both, which is the intended
 * shape rather than a miss: a longer run should hand out more standout moments.
 *
 * Unique sits above legendary rather than beside it, so the rarest colour is
 * also the strongest roll and there is no rung that is purely cosmetic.
 */
export const upgradeTierTuning = {
  luckWeightBias: 0.0025,
  tiers: [
    { tier: "common", weight: 100, multiplier: 1 },
    { tier: "uncommon", weight: 58, multiplier: 1.2 },
    { tier: "rare", weight: 30, multiplier: 1.4 },
    { tier: "epic", weight: 14, multiplier: 1.6 },
    { tier: "legendary", weight: 8, multiplier: 2 },
    { tier: "unique", weight: 1.5, multiplier: 2.5 },
  ],
} as const satisfies UpgradeTiersTuning;

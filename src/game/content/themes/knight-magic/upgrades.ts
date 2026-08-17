import { archetypeIds } from "../../../core/archetypes/ids";
import type { UpgradeDefinition } from "../../../core/archetypes/contracts";

/**
 * The level-up pool.
 *
 * Every entry declares a cap, so a maxed upgrade leaves the pool and can never
 * be offered as a no-op — under V0.2 re-picking an already-enabled skill was a
 * completely wasted level. Rarity drives selection weight and `luck` shifts it;
 * category keeps one draw from being three of the same thing.
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
    effects: [{ kind: "stat.add", target: "weapon.pierce", value: 1 }],
    maxLevel: 8, rarity: "rare", category: "projectile", presentationToken: "accent",
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

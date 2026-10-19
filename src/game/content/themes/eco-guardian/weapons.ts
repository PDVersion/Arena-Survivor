import { archetypeIds } from "../../../core/archetypes/ids";
import type { WeaponDefinition, UpgradeDefinition } from "../../../core/archetypes/contracts";

const starterUpgrades = [
  { id: archetypeIds.upgrade.weaponRange, ownerWeaponId: archetypeIds.weapon.starter,
    effects: [{ kind: "stat.add", target: "weapon.range", value: 18 }],
    maxLevel: 4, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" },
  { id: archetypeIds.upgrade.weaponCollectionSweep, ownerWeaponId: archetypeIds.weapon.starter,
    effects: [{ kind: "skill.level", skillId: archetypeIds.skill.collectionSweep }],
    maxLevel: 5, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" },
] as const satisfies readonly UpgradeDefinition[];

const secondaryUpgrades = [
  { id: archetypeIds.upgrade.secondaryRange, ownerWeaponId: archetypeIds.weapon.secondary,
    effects: [{ kind: "stat.add", target: "weapon.range", value: 12 }],
    maxLevel: 4, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" },
] as const satisfies readonly UpgradeDefinition[];

export const weaponAcquisition = {
  id: archetypeIds.upgrade.equipSecondary,
  effects: [{ kind: "weapon.equip", weaponId: archetypeIds.weapon.secondary }],
  maxLevel: 1, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent",
} as const satisfies UpgradeDefinition;

export const weapons = [
  {
    id: archetypeIds.weapon.starter,
    upgrades: starterUpgrades,
    deliveryKind: "melee",
    damage: 10,
    cooldownMs: 1000,
    range: 78,
    knockback: 10,
    armourPierce: 0,
    reach: 78,
    width: 18,
    targetCap: null,
    extendMs: 130,
    retractMs: 180,
    presentationToken: "projectile",
  },
  {
    id: archetypeIds.weapon.secondary,
    deliveryKind: "melee",
    upgrades: secondaryUpgrades,
    damage: 6,
    cooldownMs: 1400,
    range: 90,
    reach: 90,
    width: 18,
    arcRadians: 1.1,
    targetCap: 3,
    knockback: 0,
    armourPierce: 0,
    extendMs: 80,
    retractMs: 200,
    splash: { radius: 24, damageMultiplier: 0.35, targetCap: 3 },
    presentationToken: "critical",
  },
] as const satisfies readonly WeaponDefinition[];

/** Two automatic tool slots; only the starter is equipped at run creation. */
export const weaponSlotCount = 2;

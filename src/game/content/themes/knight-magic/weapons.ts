import { archetypeIds } from "../../../core/archetypes/ids";
import type { WeaponDefinition, UpgradeDefinition } from "../../../core/archetypes/contracts";

const starterUpgrades = [
] as const satisfies readonly UpgradeDefinition[];

const secondaryUpgrades = [
  { id: archetypeIds.upgrade.secondaryRange, ownerWeaponId: archetypeIds.weapon.secondary,
    effects: [{ kind: "stat.add", target: "weapon.range", value: 12 }],
    maxLevel: 4, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent" },
] as const satisfies readonly UpgradeDefinition[];

export const weaponEvolution = {
  id: archetypeIds.upgrade.evolveSecondary,
  effects: [{ kind: "weapon.evolve", fromWeaponId: archetypeIds.weapon.secondary,
    weaponId: archetypeIds.weapon.secondaryEvolved,
    requiredUpgradeId: archetypeIds.upgrade.secondaryRange, requiredPicks: 4 }],
  maxLevel: 1, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent",
} as const satisfies UpgradeDefinition;

export const weaponAcquisition = {
  id: archetypeIds.upgrade.equipSecondary,
  effects: [{ kind: "weapon.equip", weaponId: archetypeIds.weapon.secondary }],
  maxLevel: 1, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent",
} as const satisfies UpgradeDefinition;

export const weapons = [
  {
    id: archetypeIds.weapon.starter,
    upgrades: starterUpgrades,
    deliveryKind: "projectile",
    damage: 10,
    cooldownMs: 1000,
    // Comfortably beyond the ~958-unit off-screen spawn ring, so the player can
    // engage what appears. Projectile flight covers 1,280, validated against this.
    range: 1000,
    knockback: 0,
    armourPierce: 0,
    projectileSpeed: 400,
    projectileLifetimeMs: 3200,
    projectileRadius: 6,
    projectileCount: 1,
    pierce: 0,
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
  {
    id: archetypeIds.weapon.secondaryEvolved,
    deliveryKind: "melee",
    upgrades: [],
    damage: 9,
    cooldownMs: 1200,
    range: 105,
    reach: 105,
    width: 18,
    arcRadians: 1.5,
    targetCap: 4,
    knockback: 0,
    armourPierce: 0,
    extendMs: 80,
    retractMs: 200,
    splash: { radius: 32, damageMultiplier: 0.4, targetCap: 3 },
    presentationToken: "critical",
  },
] as const satisfies readonly WeaponDefinition[];

/** Two automatic tool slots; only the starter is equipped at run creation. */
export const weaponSlotCount = 2;

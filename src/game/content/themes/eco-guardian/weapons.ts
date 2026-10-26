import { aura, bin, rake, toolUpgrades } from "./cleanup-tools";
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

const secondaryUpgrades = toolUpgrades(archetypeIds.weapon.secondary, aura);

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
    cleanup: aura,
    deliveryKind: "melee",
    upgrades: secondaryUpgrades,
    damage: 6,
    cooldownMs: 1400,
    range: 90,
    reach: 90,
    width: 18,
    arcRadians: 1.1,
    targetCap: null,
    knockback: 0,
    armourPierce: 0,
    extendMs: 80,
    retractMs: 200,
    presentationToken: "critical",
  },
  {
    id: archetypeIds.weapon.secondaryEvolved,
    cleanup: { ...aura, radius: 110, damage: 6 },
    deliveryKind: "melee",
    upgrades: [],
    damage: 9,
    cooldownMs: 1200,
    range: 105,
    reach: 105,
    width: 18,
    arcRadians: 1.5,
    targetCap: null,
    knockback: 0,
    armourPierce: 0,
    extendMs: 80,
    retractMs: 200,
    presentationToken: "critical",
  },
  { id: archetypeIds.weapon.cleaningBin, cleanup: bin, upgrades: toolUpgrades(archetypeIds.weapon.cleaningBin, bin),
    deliveryKind: "melee", damage: bin.damage, cooldownMs: 3400, range: 210, reach: 210, width: 18, targetCap: null,
    extendMs: 100, retractMs: 100, knockback: 0, armourPierce: 0, presentationToken: "projectile" },
  { id: archetypeIds.weapon.orbitingRake, cleanup: rake, upgrades: toolUpgrades(archetypeIds.weapon.orbitingRake, rake),
    deliveryKind: "melee", damage: rake.damage, cooldownMs: 650, range: 140, reach: 140, width: 18, targetCap: null,
    extendMs: 100, retractMs: 100, knockback: 0, armourPierce: 0, presentationToken: "projectile" },
] as const satisfies readonly WeaponDefinition[];

/** Two automatic tool slots; only the starter is equipped at run creation. */
export const weaponSlotCount = 4;

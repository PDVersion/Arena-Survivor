import { aura, bin, rake, beam, fixedUpgrade, toolUpgrades } from "./cleanup-tools";
import { archetypeIds } from "../../../core/archetypes/ids";
import type { WeaponDefinition, UpgradeDefinition } from "../../../core/archetypes/contracts";

const starterUpgrades = [fixedUpgrade(archetypeIds.upgrade.grabberLevel, archetypeIds.weapon.starter)];
const secondaryUpgrades = toolUpgrades(archetypeIds.weapon.secondary, aura);

export const weaponAcquisition = {
  id: archetypeIds.upgrade.equipSecondary,
  effects: [{ kind: "weapon.equip", weaponId: archetypeIds.weapon.secondary }],
  maxLevel: 1, track: "weapon", rarity: "common", category: "offense", presentationToken: "accent",
} as const satisfies UpgradeDefinition;

export const weapons = [
  {
    id: archetypeIds.weapon.starter,
    upgrades: starterUpgrades,
    progression: { id: archetypeIds.upgrade.grabberLevel, skillId: archetypeIds.skill.collectionSweep, levels: [
      { damage: 10, range: 78, cooldownMs: 1000, sweepLevel: 0, description: "A reaching cleanup grabber." },
      { damage: 14, range: 96, cooldownMs: 1000, sweepLevel: 0, description: "Stronger jaws and longer reach: damage 14, reach 96." },
      { damage: 14, range: 96, cooldownMs: 900, sweepLevel: 1, description: "Unlock Collection Sweep and cycle 10% faster." },
      { damage: 20, range: 114, cooldownMs: 900, sweepLevel: 2, description: "Damage 20, reach 114 and a stronger Collection Sweep." },
      { damage: 20, range: 132, cooldownMs: 750, sweepLevel: 3, description: "Reach 132, faster cycling and a wider sweep." },
      { damage: 28, range: 132, cooldownMs: 750, sweepLevel: 4, description: "Damage 28 and stronger travelling cleanup sweeps." },
      { damage: 38, range: 150, cooldownMs: 650, sweepLevel: 5, description: "Maximum grabber: damage 38, reach 150,650 ms cycle and full sweep." },
    ] },
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
    damage: aura.damage,
    cooldownMs: aura.tickMs,
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
  { id: archetypeIds.weapon.cleaningBin, cleanup: bin, upgrades: toolUpgrades(archetypeIds.weapon.cleaningBin, bin),
    deliveryKind: "melee", damage: bin.damage, cooldownMs: 3400, range: 210, reach: 210, width: 18, targetCap: null,
    extendMs: 100, retractMs: 100, knockback: 0, armourPierce: 0, presentationToken: "projectile" },
  { id: archetypeIds.weapon.orbitingRake, cleanup: rake, upgrades: toolUpgrades(archetypeIds.weapon.orbitingRake, rake),
    deliveryKind: "melee", damage: rake.damage, cooldownMs: 650, range: 140, reach: 140, width: 18, targetCap: null,
    extendMs: 100, retractMs: 100, knockback: 0, armourPierce: 0, presentationToken: "projectile" },
  { id: archetypeIds.weapon.rakeBeam, cleanup: beam, upgrades: toolUpgrades(archetypeIds.weapon.rakeBeam, beam),
    deliveryKind: "melee", damage: beam.damage, cooldownMs: beam.tickMs, range: 140, reach: 140, width: 18, targetCap: null,
    extendMs: 100, retractMs: 100, knockback: 0, armourPierce: 0, presentationToken: "projectile" },
] as const satisfies readonly WeaponDefinition[];

/** Four automatic tool slots; only the starter is equipped at run creation. */
export const weaponSlotCount = 4;

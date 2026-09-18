import { archetypeIds } from "../../../core/archetypes/ids";
import type { WeaponDefinition } from "../../../core/archetypes/contracts";

export const weapons = [
  {
    id: archetypeIds.weapon.starter,
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
] as const satisfies readonly WeaponDefinition[];

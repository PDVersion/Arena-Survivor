import { archetypeIds } from "../../../core/archetypes/ids";
import type { WeaponDefinition } from "../../../core/archetypes/contracts";

export const weapons = [
  {
    id: archetypeIds.weapon.starterProjectile,
    damage: 10,
    cooldownMs: 1000,
    projectileSpeed: 400,
    projectileLifetimeMs: 2400,
    projectileRadius: 6,
    projectileCount: 1,
    pierce: 0,
    presentationToken: "projectile",
  },
] as const satisfies readonly WeaponDefinition[];

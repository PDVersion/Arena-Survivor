import { archetypeIds } from "../../../core/archetypes/ids";
import type { WeaponDefinition } from "../../../core/archetypes/contracts";

export const weapons = [
  {
    id: archetypeIds.weapon.starterProjectile,
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
] as const satisfies readonly WeaponDefinition[];

export const archetypeIds = {
  character: {
    starter: "character.starter",
  },
  weapon: {
    starterProjectile: "weapon.starter_projectile",
  },
  enemy: {
    swarmBasic: "enemy.swarm_basic",
  },
  pickup: {
    experience: "pickup.experience",
  },
  shrine: {
    spawnSurge: "shrine.spawn_surge",
  },
  upgrade: {
    damage: "upgrade.damage",
    attackSpeed: "upgrade.attack_speed",
    critChance: "upgrade.crit_chance",
    pierce: "upgrade.pierce",
    projectileCount: "upgrade.projectile_count",
    moveSpeed: "upgrade.move_speed",
    health: "upgrade.health",
    pickupRadius: "upgrade.pickup_radius",
  },
} as const;

type Values<T> = T[keyof T];

export type CharacterId = Values<typeof archetypeIds.character>;
export type WeaponId = Values<typeof archetypeIds.weapon>;
export type EnemyId = Values<typeof archetypeIds.enemy>;
export type PickupId = Values<typeof archetypeIds.pickup>;
export type UpgradeId = Values<typeof archetypeIds.upgrade>;
export type ShrineId = Values<typeof archetypeIds.shrine>;
export type ContentId =
  | Values<typeof archetypeIds.character>
  | Values<typeof archetypeIds.weapon>
  | Values<typeof archetypeIds.enemy>
  | Values<typeof archetypeIds.pickup>
  | Values<typeof archetypeIds.shrine>
  | Values<typeof archetypeIds.upgrade>;

export const v01ContentIds = Object.values(archetypeIds).flatMap((category) =>
  Object.values(category),
) as ContentId[];

export const archetypeIds = {
  character: {
    starter: "character.starter",
  },
  weapon: {
    starterProjectile: "weapon.starter_projectile",
  },
  enemy: {
    swarmBasic: "enemy.swarm_basic",
    fastFragile: "enemy.fast_fragile",
    slowDurable: "enemy.slow_durable",
    deathSpawner: "enemy.death_spawner",
  },
  pickup: {
    experience: "pickup.experience",
  },
  shrine: {
    spawnSurge: "shrine.spawn_surge",
    greed: "shrine.greed",
    multiplicity: "shrine.multiplicity",
    duplication: "shrine.duplication",
  },
  skill: {
    piercingMomentum: "skill.piercing_momentum",
    onKillExplosion: "skill.on_kill_explosion",
    fracture: "skill.fracture",
    bloodlust: "skill.bloodlust",
    chainReaction: "skill.chain_reaction",
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
    piercingMomentum: "upgrade.piercing_momentum",
    onKillExplosion: "upgrade.on_kill_explosion",
    fracture: "upgrade.fracture",
    bloodlust: "upgrade.bloodlust",
    chainReaction: "upgrade.chain_reaction",
  },
} as const;

type Values<T> = T[keyof T];

export type CharacterId = Values<typeof archetypeIds.character>;
export type WeaponId = Values<typeof archetypeIds.weapon>;
export type EnemyId = Values<typeof archetypeIds.enemy>;
export type PickupId = Values<typeof archetypeIds.pickup>;
export type UpgradeId = Values<typeof archetypeIds.upgrade>;
export type ShrineId = Values<typeof archetypeIds.shrine>;
export type SkillId = Values<typeof archetypeIds.skill>;
export type ContentId =
  | Values<typeof archetypeIds.character>
  | Values<typeof archetypeIds.weapon>
  | Values<typeof archetypeIds.enemy>
  | Values<typeof archetypeIds.pickup>
  | Values<typeof archetypeIds.shrine>
  | Values<typeof archetypeIds.skill>
  | Values<typeof archetypeIds.upgrade>;

export const v01ContentIds = [
  ...Object.values(archetypeIds.character),
  ...Object.values(archetypeIds.weapon),
  archetypeIds.enemy.swarmBasic,
  ...Object.values(archetypeIds.pickup),
  archetypeIds.shrine.spawnSurge,
  ...Object.values(archetypeIds.upgrade),
] as ContentId[];

export const v02ContentIds = Object.values(archetypeIds).flatMap((category) =>
  Object.values(category),
) as ContentId[];

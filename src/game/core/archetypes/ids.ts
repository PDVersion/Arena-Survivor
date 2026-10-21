export const archetypeIds = {
  character: {
    starter: "character.starter",
  },
  weapon: {
    starter: "weapon.starter",
    secondary: "weapon.secondary",
    secondaryEvolved: "weapon.secondary_evolved",
  },
  enemy: {
    swarmBasic: "enemy.swarm_basic",
    fastFragile: "enemy.fast_fragile",
    slowDurable: "enemy.slow_durable",
    deathSpawner: "enemy.death_spawner",
    stationaryFragment: "enemy.stationary_fragment",
    clusterFodder: "enemy.cluster_fodder",
    gustDrifter: "enemy.gust_drifter",
    miniBoss: "enemy.mini_boss",
    finalBoss: "enemy.final_boss",
  },
  pickup: {
    experience: "pickup.experience",
  },
  shrine: {
    spawnSurge: "shrine.spawn_surge",
    greed: "shrine.greed",
    multiplicity: "shrine.multiplicity",
    duplication: "shrine.duplication",
    escalation: "shrine.escalation",
  },
  curse: {
    frenzy: "curse.frenzy",
    escalation: "curse.escalation",
  },
  skill: {
    piercingMomentum: "skill.piercing_momentum",
    onKillExplosion: "skill.on_kill_explosion",
    fracture: "skill.fracture",
    bloodlust: "skill.bloodlust",
    chainReaction: "skill.chain_reaction",
    collectionSweep: "skill.collection_sweep",
  },
  hazard: {
    damageZone: "hazard.damage_zone",
    obstacle: "hazard.obstacle",
    periodicBurst: "hazard.periodic_burst",
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
    worldSurge: "upgrade.world_surge",
    worldBrittle: "upgrade.world_brittle",
    acceptFrenzy: "upgrade.accept_frenzy",
    acceptEscalation: "upgrade.accept_escalation",
    armour: "upgrade.armour",
    regeneration: "upgrade.regeneration",
    luck: "upgrade.luck",
    equipSecondary: "upgrade.equip_secondary",
    secondaryRange: "upgrade.secondary_range",
    evolveSecondary: "upgrade.evolve_secondary",
    weaponRange: "upgrade.weapon_range",
    weaponCollectionSweep: "upgrade.weapon_collection_sweep",
  },
} as const;

type Values<T> = T[keyof T];

export type CharacterId = Values<typeof archetypeIds.character>;
export type WeaponId = Values<typeof archetypeIds.weapon>;
export type EnemyId = Values<typeof archetypeIds.enemy>;
export type PickupId = Values<typeof archetypeIds.pickup>;
export type UpgradeId = Values<typeof archetypeIds.upgrade>;
export type CurseId = Values<typeof archetypeIds.curse>;
export type ShrineId = Values<typeof archetypeIds.shrine>;
export type SkillId = Values<typeof archetypeIds.skill>;
export type HazardId = Values<typeof archetypeIds.hazard>;
export type ContentId =
  | Values<typeof archetypeIds.character>
  | Values<typeof archetypeIds.weapon>
  | Values<typeof archetypeIds.enemy>
  | Values<typeof archetypeIds.pickup>
  | Values<typeof archetypeIds.curse>
  | Values<typeof archetypeIds.shrine>
  | Values<typeof archetypeIds.skill>
  | Values<typeof archetypeIds.hazard>
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

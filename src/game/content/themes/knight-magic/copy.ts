import { archetypeIds } from "../../../core/archetypes/ids";
import type { ThemeCopy } from "../../../core/archetypes/contracts";

export const copy = {
  gameTitle: "Arena Survivor",
  arenaName: "The Ember Court",
  bootStatus: "The arena awaits",
  bootFailure: "The arena could not be summoned.",
  movementHint: "Move with WASD or arrow keys · Pause with Escape",
  levelUpTitle: "Choose a new blessing",
  vocabulary: {
    health: "Vitality",
    experience: "Arcane Power",
    level: "Rank",
    time: "Time",
    kills: "Foes Vanquished",
    enemies: "Foes Remaining",
    paused: "The arena is paused",
    deathTitle: "The Knight Has Fallen",
    deathMessage: "The Ember Court claims another challenger.",
    completeTitle: "The Trial Is Complete",
    completeMessage: "You endured the arena's full assault.",
    restartAction: "Begin Again",
  },
  content: {
    [archetypeIds.character.starter]: {
      name: "Wandering Knight",
      description: "A lone champion entering the Ember Court.",
    },
    [archetypeIds.weapon.starterProjectile]: {
      name: "Magic Needle",
      description: "A precise enchanted projectile that seeks the nearest foe.",
    },
    [archetypeIds.enemy.swarmBasic]: {
      name: "Grunt",
      description: "A frail creature dangerous in great numbers.",
    },
    [archetypeIds.pickup.experience]: {
      name: "Arcane Spark",
      description: "A trace of power left by a fallen enemy.",
    },
    [archetypeIds.shrine.spawnSurge]: {
      name: "Shrine of the Horde",
      description: "Invite a dangerous swarm in exchange for greater rewards.",
    },
    [archetypeIds.upgrade.damage]: {
      name: "Tempered Power",
      description: "Increase damage dealt.",
    },
    [archetypeIds.upgrade.attackSpeed]: {
      name: "Quickened Weave",
      description: "Attack more frequently.",
    },
    [archetypeIds.upgrade.critChance]: {
      name: "Critical Mass",
      description: "Increase critical strike chance.",
    },
    [archetypeIds.upgrade.pierce]: {
      name: "Sharpened Tip",
      description: "Projectiles pass through another enemy.",
    },
    [archetypeIds.upgrade.projectileCount]: {
      name: "Twin Casting",
      description: "Launch one additional projectile with every attack.",
    },
    [archetypeIds.upgrade.moveSpeed]: {
      name: "Fleet-Footed",
      description: "Move more quickly through the arena.",
    },
    [archetypeIds.upgrade.health]: {
      name: "Knight's Vigor",
      description: "Increase maximum health and heal by the same amount.",
    },
    [archetypeIds.upgrade.pickupRadius]: {
      name: "Arcane Reach",
      description: "Draw experience sparks from farther away.",
    },
  },
} as const satisfies ThemeCopy;

import type { DifficultyPresets } from "../../../core/archetypes/difficulty";

/** Relative to the pre-preset baseline. Gameplay rate and geometry never change. */
export const difficultyPresets = {
  beginner: {
    enemyHealth: 0.75, enemyDamage: 0.6, enemySpeed: 0.85, spawnRate: 0.7,
    playerHealth: 1.25, playerSpeed: 1.1, pickupRadius: 1.25,
    weaponDamage: 1.2, weaponCooldown: 0.9, hazardDamage: 0.6, hazardRate: 0.7,
  },
  normal: {
    enemyHealth: 0.95, enemyDamage: 0.85, enemySpeed: 1, spawnRate: 0.9,
    playerHealth: 1, playerSpeed: 1, pickupRadius: 1,
    weaponDamage: 1, weaponCooldown: 1, hazardDamage: 0.85, hazardRate: 0.9,
  },
  experienced: {
    enemyHealth: 1.1, enemyDamage: 1.1, enemySpeed: 1, spawnRate: 1.15,
    playerHealth: 1, playerSpeed: 1, pickupRadius: 1,
    weaponDamage: 1, weaponCooldown: 1, hazardDamage: 1.1, hazardRate: 1.15,
  },
} as const satisfies DifficultyPresets;

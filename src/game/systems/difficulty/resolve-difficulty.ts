import type { ThemeManifest } from "../../core/archetypes/contracts";
import type { DifficultyId } from "../../core/archetypes/difficulty";

/** Resolve once at run creation. Never mutate the authored theme or inspect sprite art. */
export function resolveDifficultyTheme(theme: ThemeManifest, id: DifficultyId): ThemeManifest {
  const preset = theme.tuning.difficultyPresets[id];
  return {
    ...theme,
    characters: theme.characters.map((character) => ({
      ...character,
      baseStats: {
        ...character.baseStats,
        maxHealth: character.baseStats.maxHealth * preset.playerHealth,
        moveSpeed: character.baseStats.moveSpeed * preset.playerSpeed,
        pickupRadius: character.baseStats.pickupRadius * preset.pickupRadius,
      },
    })),
    weapons: theme.weapons.map((weapon) => ({
      ...weapon,
      damage: weapon.damage * preset.weaponDamage,
      cooldownMs: weapon.cooldownMs * preset.weaponCooldown,
      ...(weapon.progression ? { progression: { ...weapon.progression, levels: weapon.progression.levels.map((level) => ({
        ...level, damage: level.damage * preset.weaponDamage, cooldownMs: level.cooldownMs * preset.weaponCooldown,
      })) } } : {}),
      ...(weapon.cleanup ? { cleanup: { ...weapon.cleanup,
        damage: weapon.cleanup.damage * preset.weaponDamage,
        dotDamage: weapon.cleanup.dotDamage * preset.weaponDamage,
        tickMs: weapon.cleanup.tickMs * preset.weaponCooldown,
        ...(weapon.cleanup.progression ? { progression: { ...weapon.cleanup.progression,
          levels: weapon.cleanup.progression.levels.map((level) => ({ ...level,
            ...(level.damage !== undefined ? { damage: level.damage * preset.weaponDamage } : {}),
            ...(level.dotDamage !== undefined ? { dotDamage: level.dotDamage * preset.weaponDamage } : {}),
            ...(level.tickMs !== undefined ? { tickMs: level.tickMs * preset.weaponCooldown } : {}),
          })),
        } } : {}),
      } } : {}),
    })),
    enemies: theme.enemies.map((enemy) => ({
      ...enemy,
      maxHealth: enemy.maxHealth * preset.enemyHealth,
      contactDamage: enemy.contactDamage * preset.enemyDamage,
      moveSpeed: enemy.moveSpeed * preset.enemySpeed,
    })),
    hazards: theme.hazards.map((hazard) => hazard.kind === "obstacle" ? hazard : {
      ...hazard, damage: hazard.damage * preset.hazardDamage,
    }),
    tuning: {
      ...theme.tuning,
      director: {
        ...theme.tuning.director,
        baseIntervalMs: theme.tuning.director.baseIntervalMs / preset.spawnRate,
        minIntervalMs: theme.tuning.director.minIntervalMs / preset.spawnRate,
        waveBurstBase: theme.tuning.director.waveBurstBase * preset.spawnRate,
        waveBurstGrowth: theme.tuning.director.waveBurstGrowth * preset.spawnRate,
      },
      hazards: {
        ...theme.tuning.hazards,
        baseIntervalMs: theme.tuning.hazards.baseIntervalMs / preset.hazardRate,
        minIntervalMs: theme.tuning.hazards.minIntervalMs / preset.hazardRate,
      },
    },
  };
}

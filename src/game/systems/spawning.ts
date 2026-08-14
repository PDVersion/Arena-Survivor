import type { ArenaBounds, Vector2 } from "./player-movement";
import type { EnemyDefinition } from "../core/archetypes/contracts";

export interface SpawnLimits {
  readonly maxAlive: number;
  readonly maxProjectiles: number;
}

export const V01_SPAWN_LIMITS: SpawnLimits = Object.freeze({
  maxAlive: 80,
  maxProjectiles: 64,
});

export function canSpawn(current: number, maximum: number): boolean {
  return current >= 0 && current < maximum;
}

export function pointOnSpawnRing(
  centre: Vector2,
  radius: number,
  angleRadians: number,
  arena: ArenaBounds,
  margin: number,
): Vector2 {
  return {
    x: Math.min(arena.width - margin, Math.max(margin, centre.x + Math.cos(angleRadians) * radius)),
    y: Math.min(arena.height - margin, Math.max(margin, centre.y + Math.sin(angleRadians) * radius)),
  };
}

export function selectEnemyDefinition(
  definitions: readonly EnemyDefinition[],
  elapsedMs: number,
  random: () => number,
): EnemyDefinition | undefined {
  const available = definitions.filter(
    (definition) => definition.unlockAtMs <= elapsedMs && definition.spawnWeight > 0,
  );
  const totalWeight = available.reduce((total, definition) => total + definition.spawnWeight, 0);
  if (totalWeight <= 0) return undefined;
  let roll = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * totalWeight;
  for (const definition of available) {
    roll -= definition.spawnWeight;
    if (roll < 0) return definition;
  }
  return available.at(-1);
}

export interface PendingSpawn {
  readonly enemyId: EnemyDefinition["id"];
  readonly count: number;
  readonly parentEntityId: string;
  readonly parentEventId: string;
  readonly spawnSource: string;
  readonly rewardMultiplier: number;
}

export function createDeathSpawns(
  definition: EnemyDefinition,
  parentEntityId: string,
  parentEventId: string,
): PendingSpawn | null {
  if (!definition.deathSpawn) return null;
  return Object.freeze({
    enemyId: definition.deathSpawn.enemyId,
    count: definition.deathSpawn.count,
    parentEntityId,
    parentEventId,
    spawnSource: definition.id,
    rewardMultiplier: definition.deathSpawn.rewardMultiplier,
  });
}

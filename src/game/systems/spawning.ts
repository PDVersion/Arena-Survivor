import type { ArenaBounds, Vector2 } from "./player-movement";

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

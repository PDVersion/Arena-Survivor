import type { ArenaBounds, Vector2 } from "./player-movement";
import type { EnemyDefinition } from "../core/archetypes/contracts";

export interface SpawnLimits {
  readonly maxAlive: number;
  readonly maxProjectiles: number;
}

export const V02_SPAWN_LIMITS: SpawnLimits = Object.freeze({
  maxAlive: 300,
  maxProjectiles: 192,
});

export function canSpawn(current: number, maximum: number): boolean {
  return current >= 0 && current < maximum;
}

/** The world-space rectangle the player can currently see. */
export interface ViewRect {
  readonly centreX: number;
  readonly centreY: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Radius at which an enemy is guaranteed to be off screen.
 *
 * Derived from the visible view's half-diagonal, so it cannot drift out of step
 * with the camera the way V0.2's fixed 360 did against a 1920x1080 window.
 */
export function offScreenSpawnRadius(view: ViewRect, margin: number): number {
  return Math.hypot(view.width, view.height) / 2 + Math.max(0, margin);
}

function insideView(point: Vector2, view: ViewRect): boolean {
  return (
    Math.abs(point.x - view.centreX) <= view.width / 2 &&
    Math.abs(point.y - view.centreY) <= view.height / 2
  );
}

function insideArena(point: Vector2, arena: ArenaBounds, margin: number): boolean {
  return (
    point.x >= margin &&
    point.y >= margin &&
    point.x <= arena.width - margin &&
    point.y <= arena.height - margin
  );
}

export interface SpawnPointOptions {
  readonly origin: Vector2;
  readonly radius: number;
  readonly angleRadians: number;
  readonly arena: ArenaBounds;
  readonly view: ViewRect;
  readonly margin: number;
  /** Candidate angles to try before falling back. */
  readonly attempts?: number;
}

/**
 * A spawn point that is inside the arena and outside the visible view.
 *
 * V0.2 clamped the candidate into the arena, which dragged edge spawns *onto*
 * the screen — the exact reported bug when the player stood near a wall. This
 * rejects instead: rotate through candidate angles, take the first that is both
 * in the arena and out of view, and only if every candidate fails fall back to
 * the in-arena point farthest from the view centre.
 */
export function findOffScreenSpawnPoint(options: SpawnPointOptions): Vector2 {
  const attempts = Math.max(1, options.attempts ?? 12);
  const step = (Math.PI * 2) / attempts;
  let fallback: Vector2 | undefined;
  let fallbackDistance = -1;

  for (let index = 0; index < attempts; index += 1) {
    const angle = options.angleRadians + index * step;
    const candidate: Vector2 = {
      x: options.origin.x + Math.cos(angle) * options.radius,
      y: options.origin.y + Math.sin(angle) * options.radius,
    };
    const inArena = insideArena(candidate, options.arena, options.margin);
    if (inArena && !insideView(candidate, options.view)) return candidate;

    if (inArena) {
      const distance = Math.hypot(
        candidate.x - options.view.centreX,
        candidate.y - options.view.centreY,
      );
      if (distance > fallbackDistance) {
        fallbackDistance = distance;
        fallback = candidate;
      }
    }
  }

  if (fallback) return fallback;

  // Every ring candidate left the arena: clamp the farthest arena corner from
  // the view instead, which is the best available off-screen position.
  const corners: readonly Vector2[] = [
    { x: options.margin, y: options.margin },
    { x: options.arena.width - options.margin, y: options.margin },
    { x: options.margin, y: options.arena.height - options.margin },
    { x: options.arena.width - options.margin, y: options.arena.height - options.margin },
  ];
  return corners.reduce((best, corner) => {
    const bestDistance = Math.hypot(best.x - options.view.centreX, best.y - options.view.centreY);
    const distance = Math.hypot(corner.x - options.view.centreX, corner.y - options.view.centreY);
    return distance > bestDistance ? corner : best;
  });
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

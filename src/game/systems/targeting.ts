export interface TargetPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly active: boolean;
  /** Set once a lethal hit is committed but before the actor is destroyed. */
  readonly defeated?: boolean;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * Nearest eligible target.
 *
 * Takes an iterable so callers can pass a live collection directly rather than
 * allocating a snapshot on every shot. Ties break on stable id so selection
 * stays deterministic.
 */
export function findNearestTarget<T extends TargetPoint>(
  origin: Point,
  targets: Iterable<T>,
): T | null {
  let nearest: T | null = null;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (!target.active || target.defeated) continue;
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distanceSquared = dx * dx + dy * dy;
    if (
      distanceSquared < nearestDistanceSquared ||
      (distanceSquared === nearestDistanceSquared && nearest && target.id < nearest.id)
    ) {
      nearest = target;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest;
}

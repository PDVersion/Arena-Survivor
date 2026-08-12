export interface TargetPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly active: boolean;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export function findNearestTarget<T extends TargetPoint>(origin: Point, targets: readonly T[]): T | null {
  let nearest: T | null = null;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (!target.active) continue;
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

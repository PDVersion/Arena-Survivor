import type { SpatialHash } from "../spatial/spatial-hash";

/**
 * Soft crowd separation.
 *
 * Full Arcade collider resolution between 300 enemies is the obvious approach
 * and the wrong one: it fights the chase step, which overwrites velocity every
 * frame, and its cost is unbounded in a dense pile. This nudges positions
 * instead and never touches velocity, so chasing is unaffected.
 *
 * Separation radius is deliberately smaller than the drawn radius, so small
 * enemies still bunch and overlap a little while large ones hold their ground.
 */

export interface SeparationBody {
  readonly id: string;
  x: number;
  y: number;
  /** Personal space, smaller than the drawn radius. */
  readonly separationRadius: number;
  readonly mass: number;
}

export interface SeparationOptions {
  /** Neighbour resolutions allowed per body, so worst-case cost stays linear. */
  readonly maxNeighbours: number;
  /** Ceiling on how far one body may be nudged in a single frame. */
  readonly maxDisplacement: number;
}

export interface SeparationStats {
  readonly pairChecks: number;
  readonly adjustments: number;
}

/**
 * A stable unit vector for bodies sitting on exactly the same pixel.
 *
 * Derived from identity rather than randomness so a coincident pair always
 * separates the same way, and always separates: without this they would share a
 * position forever because the contact normal is undefined.
 */
function coincidentNormal(id: string): Readonly<{ x: number; y: number }> {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  const angle = ((hash >>> 0) % 3600) / 3600 * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/**
 * Push overlapping bodies apart in place.
 *
 * The hash must already contain every body. Positions mutate during the pass,
 * so the index goes slightly stale within a frame; that is acceptable for a
 * soft constraint and avoids a second rebuild.
 */
export function separateCrowd<T extends SeparationBody>(
  bodies: Iterable<T>,
  hash: SpatialHash<T>,
  options: SeparationOptions,
): SeparationStats {
  let pairChecks = 0;
  let adjustments = 0;

  for (const body of bodies) {
    let resolved = 0;
    let pushX = 0;
    let pushY = 0;

    pairChecks += hash.forEachWithin(body.x, body.y, body.separationRadius * 2, (other) => {
      if (other === body || resolved >= options.maxNeighbours) return;

      const minDistance = body.separationRadius + other.separationRadius;
      const dx = other.x - body.x;
      const dy = other.y - body.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= minDistance * minDistance) return;

      resolved += 1;
      const distance = Math.sqrt(distanceSquared);
      let normalX: number;
      let normalY: number;
      if (distance > 0) {
        normalX = dx / distance;
        normalY = dy / distance;
      } else {
        const fallback = coincidentNormal(body.id);
        normalX = fallback.x;
        normalY = fallback.y;
      }

      // Heavier neighbours move a body more than lighter ones do.
      const share = other.mass / Math.max(Number.EPSILON, body.mass + other.mass);
      const overlap = minDistance - distance;
      const push = overlap * 0.5 * share;
      pushX -= normalX * push;
      pushY -= normalY * push;
      adjustments += 1;
    });

    if (pushX === 0 && pushY === 0) continue;

    // Clamp the frame's total displacement, not each neighbour's contribution.
    // Clamping per neighbour let a body in a dense pile move `maxDisplacement`
    // times its neighbour count in one frame, which flung crowds apart faster
    // than any enemy can move and pulled targets out from under fired shots.
    const magnitude = Math.hypot(pushX, pushY);
    if (magnitude > options.maxDisplacement) {
      const scale = options.maxDisplacement / magnitude;
      pushX *= scale;
      pushY *= scale;
    }
    body.x += pushX;
    body.y += pushY;
  }

  return Object.freeze({ pairChecks, adjustments });
}

export interface SolidBody extends SeparationBody {
  readonly solid: boolean;
}

export interface PlayerBody {
  x: number;
  y: number;
  readonly radius: number;
}

export interface ArenaSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Push the player out of solid enemies.
 *
 * Contact damage still flows through the existing overlap handler, so damage
 * semantics are unchanged; this only resolves position. When displacing the
 * player would push them out of the arena, the enemy is displaced instead, so
 * a crowd cannot wedge the player through a wall.
 *
 * Returns how many solids were resolved.
 */
export function resolvePlayerAgainstSolids<T extends SolidBody>(
  player: PlayerBody,
  hash: SpatialHash<T>,
  arena: ArenaSize,
  maxSolidRadius: number,
): number {
  let resolvedCount = 0;

  hash.forEachWithin(player.x, player.y, player.radius + maxSolidRadius, (solid) => {
    if (!solid.solid) return;

    const minDistance = player.radius + solid.separationRadius;
    const dx = player.x - solid.x;
    const dy = player.y - solid.y;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared >= minDistance * minDistance) return;

    const distance = Math.sqrt(distanceSquared);
    let normalX: number;
    let normalY: number;
    if (distance > 0) {
      normalX = dx / distance;
      normalY = dy / distance;
    } else {
      const fallback = coincidentNormal(solid.id);
      normalX = fallback.x;
      normalY = fallback.y;
    }

    resolvedCount += 1;
    const overlap = minDistance - distance;
    const nextX = player.x + normalX * overlap;
    const nextY = player.y + normalY * overlap;
    const insideArena =
      nextX >= player.radius &&
      nextY >= player.radius &&
      nextX <= arena.width - player.radius &&
      nextY <= arena.height - player.radius;

    if (insideArena) {
      player.x = nextX;
      player.y = nextY;
    } else {
      solid.x -= normalX * overlap;
      solid.y -= normalY * overlap;
    }
  });

  return resolvedCount;
}

/** Displacement applied to a body knocked away from a point. */
export function knockbackDisplacement(
  from: Readonly<{ x: number; y: number }>,
  to: Readonly<{ x: number; y: number }>,
  strength: number,
  mass: number,
): Readonly<{ x: number; y: number }> {
  if (strength <= 0) return { x: 0, y: 0 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const scaled = strength / Math.max(0.1, mass);
  if (distance === 0) return { x: scaled, y: 0 };
  return { x: (dx / distance) * scaled, y: (dy / distance) * scaled };
}

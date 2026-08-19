import type { ShrineId } from "../../core/archetypes/ids";
import type { ShrinesTuning } from "../../core/archetypes/tuning";

/**
 * When shrines arrive, and where.
 *
 * V0.3 laid all five instances out at fixed offsets around the arena centre, so
 * every shrine in the run was visible, reachable, and decided within the first
 * few seconds. That made the whole risk/reward system one opening decision
 * rather than five spaced ones. Arrivals are now scheduled across the run and
 * placed against the player's live position at the moment they appear.
 *
 * Everything here is pure and deterministic given a seeded random source; the
 * scene owns actors, reveal feedback, and rendering.
 */

export interface ScheduledShrine {
  readonly shrineId: ShrineId;
  /** Simulation time at which this instance appears. */
  readonly appearAtMs: number;
}

export interface ShrinePoint {
  readonly x: number;
  readonly y: number;
}

export interface ArenaSize {
  readonly width: number;
  readonly height: number;
}

/**
 * The run's shrine arrivals in ascending time order.
 *
 * `appearAt` is normalized progress, so a longer run spreads the same arrivals
 * over more wall time rather than needing a second schedule.
 */
export function scheduleShrineArrivals(
  tuning: ShrinesTuning,
  durationMs: number,
): readonly ScheduledShrine[] {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("Run duration must be greater than zero");
  }
  return Object.freeze(
    tuning.arrivals
      .map((arrival) =>
        Object.freeze({
          shrineId: arrival.shrineId,
          appearAtMs: Math.max(0, Math.min(1, arrival.appearAt)) * durationMs,
        }),
      )
      .sort((left, right) => left.appearAtMs - right.appearAtMs),
  );
}

function distanceSquared(from: ShrinePoint, to: ShrinePoint): number {
  return (from.x - to.x) ** 2 + (from.y - to.y) ** 2;
}

/**
 * Where one arriving shrine goes.
 *
 * Rejection sampling in a ring around the player: far enough that reaching it
 * costs traversal, near enough that it is findable, inside the arena, and clear
 * of the shrines already placed. When no candidate satisfies every constraint —
 * a crowded arena, or a player pinned in a corner — the candidate that is
 * furthest from its nearest neighbour is used, so placement always succeeds
 * rather than silently dropping a shrine.
 */
export function placeShrine(
  tuning: ShrinesTuning,
  arena: ArenaSize,
  player: ShrinePoint,
  placed: readonly ShrinePoint[],
  random: () => number,
): ShrinePoint {
  const minX = Math.min(tuning.edgeMargin, arena.width / 2);
  const maxX = Math.max(minX, arena.width - tuning.edgeMargin);
  const minY = Math.min(tuning.edgeMargin, arena.height / 2);
  const maxY = Math.max(minY, arena.height - tuning.edgeMargin);
  const near = Math.max(0, tuning.minDistanceFromPlayer);
  const far = Math.max(near, tuning.maxDistanceFromPlayer);
  const attempts = Math.max(1, Math.floor(tuning.placementAttempts));

  let best: ShrinePoint | undefined;
  let bestClearance = -1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const angle = random() * Math.PI * 2;
    // Uniform over the annulus rather than over the radius, so candidates do
    // not bunch against the inner edge.
    const distance = Math.sqrt(near * near + random() * (far * far - near * near));
    const candidate: ShrinePoint = Object.freeze({
      x: Math.min(maxX, Math.max(minX, player.x + Math.cos(angle) * distance)),
      y: Math.min(maxY, Math.max(minY, player.y + Math.sin(angle) * distance)),
    });

    // Clamping to the arena can drag a candidate back toward the player, so the
    // real distance is measured after clamping, never assumed from the sample.
    const playerClearance = Math.sqrt(distanceSquared(candidate, player));
    const neighbourClearance = placed.reduce(
      (nearest, shrine) => Math.min(nearest, Math.sqrt(distanceSquared(candidate, shrine))),
      Number.POSITIVE_INFINITY,
    );
    if (playerClearance >= near && neighbourClearance >= tuning.minSeparation) return candidate;

    const clearance = Math.min(playerClearance, neighbourClearance);
    if (clearance > bestClearance) {
      bestClearance = clearance;
      best = candidate;
    }
  }

  return best ?? Object.freeze({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
}

export interface ShrineMarker {
  readonly x: number;
  readonly y: number;
  /** Heading from the view centre to the shrine, in radians. */
  readonly angle: number;
}

/**
 * Where an off-screen shrine's pointer sits on the edge of the view.
 *
 * The arena is more than twice the view in both axes, so a shrine placed
 * anywhere in it is invisible from most of the map. Without a pointer, moving
 * shrines off the arena centre would only make them unfindable.
 *
 * The heading is projected onto the view *rectangle* rather than onto a circle,
 * so the marker sits directly between the player and the shrine at every aspect
 * instead of drifting toward the corners.
 */
export function shrineMarker(
  offset: ShrinePoint,
  halfWidth: number,
  halfHeight: number,
): ShrineMarker {
  const angle = Math.atan2(offset.y, offset.x);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // A heading exactly along an axis has a zero component; the infinity it
  // produces loses to the other axis in the min, which is the intended edge.
  const scale = Math.min(Math.abs(halfWidth / cos), Math.abs(halfHeight / sin));
  return Object.freeze({ x: cos * scale, y: sin * scale, angle });
}

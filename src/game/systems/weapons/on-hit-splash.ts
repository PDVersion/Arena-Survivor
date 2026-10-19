import type { OnHitSplashDefinition } from "../../core/archetypes/contracts";
import type { MeleePoint, MeleeTarget } from "./melee-stab";

/** One non-recursive hit response, capped and ordered independently of iteration. */
export function selectSplashHits<T extends MeleeTarget>(
  origin: MeleePoint,
  primaryTargetId: string,
  splash: OnHitSplashDefinition,
  targets: Iterable<T>,
): readonly T[] {
  const candidates: Array<{ target: T; distance: number }> = [];
  for (const target of targets) {
    if (!target.active || target.defeated || target.targetId === primaryTargetId) continue;
    const distance = Math.hypot(target.x - origin.x, target.y - origin.y);
    if (distance <= splash.radius + target.radius) candidates.push({ target, distance });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.target.targetId.localeCompare(b.target.targetId));
  return candidates.slice(0, splash.targetCap).map(({ target }) => target);
}

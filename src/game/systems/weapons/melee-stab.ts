import type { MeleeWeaponDefinition } from "../../core/archetypes/contracts";

export interface MeleePoint {
  readonly x: number;
  readonly y: number;
}

export interface MeleeTarget extends MeleePoint {
  readonly targetId: string;
  readonly radius: number;
  readonly active: boolean;
  readonly defeated?: boolean;
}

/** Finds the closest live target the grabber can physically reach. */
export function selectMeleeAim<T extends MeleeTarget>(
  origin: MeleePoint,
  targets: Iterable<T>,
  reach: number,
): T | null {
  let selected: T | null = null;
  let nearest = Number.POSITIVE_INFINITY;
  for (const target of targets) {
    if (!target.active || target.defeated) continue;
    const distance = Math.hypot(target.x - origin.x, target.y - origin.y);
    if (distance > reach + target.radius) continue;
    if (distance < nearest || (distance === nearest && selected && target.targetId < selected.targetId)) {
      selected = target;
      nearest = distance;
    }
  }
  return selected;
}

/** Resolves the narrow forward corridor independently from scene presentation. */
export function selectMeleeHits<T extends MeleeTarget>(
  origin: MeleePoint,
  angle: number,
  weapon: MeleeWeaponDefinition,
  targets: Iterable<T>,
): readonly T[] {
  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);
  const candidates: Array<{ target: T; distance: number }> = [];

  for (const target of targets) {
    if (!target.active || target.defeated) continue;
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distance = dx * forwardX + dy * forwardY;
    const sideways = Math.abs(dx * -forwardY + dy * forwardX);
    if (distance < -target.radius || distance > weapon.reach + target.radius) continue;
    if (sideways > weapon.width / 2 + target.radius) continue;
    candidates.push({ target, distance });
  }

  candidates.sort((left, right) => left.distance - right.distance || left.target.targetId.localeCompare(right.target.targetId));
  return candidates.slice(0, weapon.targetCap).map(({ target }) => target);
}

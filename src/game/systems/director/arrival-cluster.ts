import type { EnemyDefinition } from "../../core/archetypes/contracts";
import type { DirectorRoleTuning, DirectorTuning } from "../../core/archetypes/tuning";
import { enemiesInWave } from "./spawn-director";

/** Admission of natural companions is bounded by free actor slots, never queued debt. */
export function arrivalClusterCount(definition: Pick<EnemyDefinition, "arrivalCluster">, available: number): number {
  if (!Number.isSafeInteger(available) || available < 0) throw new Error("Invalid available actor capacity");
  const count = definition.arrivalCluster?.count ?? 1;
  if (!Number.isSafeInteger(count) || count < 1) throw new Error("Invalid arrival cluster count");
  return Math.min(count, available);
}

/** World-unit spacing on the existing off-screen ring, symmetrical about its arc. */
export function arrivalClusterAngles(definition: Pick<EnemyDefinition, "arrivalCluster">, available: number, angle: number, radius: number): readonly number[] {
  if (!Number.isFinite(angle) || !Number.isFinite(radius) || radius <= 0) throw new Error("Invalid arrival ring");
  const count = arrivalClusterCount(definition, available);
  const spacing = definition.arrivalCluster?.spacing ?? 0;
  if (!Number.isFinite(spacing) || spacing < 0) throw new Error("Invalid arrival spacing");
  return Array.from({ length: count }, (_, index) => angle + (index - (count - 1) / 2) * spacing / radius);
}

/** Introduction count is already a count of actors; never multiply it by group size. */
export function introductionCount(role: DirectorRoleTuning, tuning: DirectorTuning, progress: number): number {
  return role.introductionCount ?? enemiesInWave(tuning, progress);
}

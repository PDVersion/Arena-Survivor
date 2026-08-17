import type { DirectorTuning } from "../../../core/archetypes/tuning";

/**
 * V0.3 Phase 1 holds the V0.2 constants that used to live in `run-scene.ts`.
 * Phase 4 replaces both with progress-driven curves so run length stops
 * requiring hand-authored milestones.
 */
export const director = {
  spawnIntervalMs: 400,
  spawnRadius: 360,
} as const satisfies DirectorTuning;

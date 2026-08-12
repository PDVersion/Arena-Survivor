import type { ShrineDefinition } from "../core/archetypes/contracts";

export interface ShrineSurgeState {
  readonly active: boolean;
  readonly activatedAtMs: number | null;
  readonly scheduled: number;
  readonly spawned: number;
}

export function createShrineSurgeState(): ShrineSurgeState {
  return { active: false, activatedAtMs: null, scheduled: 0, spawned: 0 };
}

export function activateShrineSurge(
  state: ShrineSurgeState,
  nowMs: number,
): ShrineSurgeState {
  if (state.active || state.activatedAtMs !== null) return state;
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new Error("Activation time cannot be negative");
  return { ...state, active: true, activatedAtMs: nowMs };
}

export function updateShrineSurge(
  state: ShrineSurgeState,
  definition: ShrineDefinition,
  nowMs: number,
  availableCapacity: number,
): Readonly<{ state: ShrineSurgeState; spawnNow: number }> {
  if (!state.active || state.activatedAtMs === null) return { state, spawnNow: 0 };
  const elapsedMs = Math.max(0, nowMs - state.activatedAtMs);
  const intervalMs = definition.spawnDurationMs / definition.spawnCount;
  const scheduled = Math.min(
    definition.spawnCount,
    Math.floor(elapsedMs / intervalMs),
  );
  const due = Math.max(0, scheduled - state.spawned);
  const spawnNow = Math.min(due, Math.max(0, Math.floor(availableCapacity)));
  const spawned = state.spawned + spawnNow;
  return {
    spawnNow,
    state: {
      ...state,
      active: spawned < definition.spawnCount,
      scheduled,
      spawned,
    },
  };
}

import type { RunState } from "./run-state";

export interface HudValues {
  readonly health: string;
  readonly experience: string;
  readonly level: string;
  readonly time: string;
  readonly kills: string;
  readonly enemies: string;
}

export function formatRunTime(remainingMs: number): string {
  if (!Number.isFinite(remainingMs)) throw new Error("Remaining time must be finite");
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function selectHudValues(state: RunState): HudValues {
  return {
    health: `${Math.ceil(state.player.health)} / ${Math.ceil(state.player.stats.maxHealth)}`,
    experience: `${state.progression.xp} / ${state.progression.xpToNextLevel}`,
    level: String(state.progression.level),
    time: formatRunTime(state.durationMs - state.elapsedMs),
    kills: String(state.statistics.kills),
    enemies: String(state.statistics.liveEnemies),
  };
}

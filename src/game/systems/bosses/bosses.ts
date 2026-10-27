import type { BossDefinition, BossSummonPattern, EnemyDefinition } from "../../core/archetypes/contracts";

/** Pending encounters stay due until an actual capped actor creation succeeds. */
export function dueBosses(definitions: readonly EnemyDefinition[], progress: number, spawned: ReadonlySet<string>): readonly EnemyDefinition[] {
  return definitions.filter((enemy) => enemy.boss && enemy.boss.appearAt <= progress && !spawned.has(enemy.id));
}

export interface BossAttackState {
  readonly nextAtMs: number;
  readonly cycle?: number;
  readonly nearDeathUsed?: boolean;
  readonly warning?: Readonly<{ x: number; y: number; releaseAtMs: number; summon?: BossSummonPattern }>;
}
export function createBossAttack(nowMs: number, definition: BossDefinition): BossAttackState {
  return { nextAtMs: nowMs + definition.attack.recoveryMs };
}

/** One fixed warning and one pulse, never a catch-up loop or wall timer. */
export function advanceBossAttack(state: BossAttackState, definition: BossDefinition, nowMs: number,
  origin: Readonly<{ x: number; y: number; healthFraction?: number }>, target: Readonly<{ x: number; y: number; radius: number }>,
): Readonly<{ state: BossAttackState; damage: number; released: boolean; summons?: BossSummonPattern }> {
  if (state.warning) {
    if (nowMs < state.warning.releaseAtMs) return { state, damage: 0, released: false };
    const reach = definition.attack.radius + target.radius;
    const inside = (target.x - state.warning.x) ** 2 + (target.y - state.warning.y) ** 2 <= reach ** 2;
    return { state: { nextAtMs: nowMs + definition.attack.recoveryMs,
      ...(definition.summons ? { cycle: (state.cycle ?? 0) + 1, nearDeathUsed: state.nearDeathUsed } : {}) },
      damage: inside ? definition.attack.damage : 0, released: true, ...(state.warning.summon ? { summons: state.warning.summon } : {}) };
  }
  if (nowMs < state.nextAtMs) return { state, damage: 0, released: false };
  const nearDeath = definition.summons?.nearDeath;
  const emergency = nearDeath && !state.nearDeathUsed && (origin.healthFraction ?? 1) <= nearDeath.healthFraction;
  const patterns = definition.summons?.patterns;
  const summon = emergency ? nearDeath : patterns?.[(state.cycle ?? 0) % patterns.length];
  return { state: { ...state, ...(emergency ? { nearDeathUsed: true } : {}), warning: { x: origin.x, y: origin.y, releaseAtMs: nowMs + definition.attack.telegraphMs, ...(summon ? { summon } : {}) } }, damage: 0, released: false };
}

/** Movement policy reads the same warning that owns the fixed damage circle. */
export function bossHoldsPosition(state: BossAttackState | undefined, definition: BossDefinition): boolean {
  return definition.attack.holdDuringTelegraph === true && state?.warning !== undefined;
}

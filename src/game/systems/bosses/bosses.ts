import type { BossDefinition, EnemyDefinition } from "../../core/archetypes/contracts";

/** Pending encounters stay due until an actual capped actor creation succeeds. */
export function dueBosses(definitions: readonly EnemyDefinition[], progress: number, spawned: ReadonlySet<string>): readonly EnemyDefinition[] {
  return definitions.filter((enemy) => enemy.boss && enemy.boss.appearAt <= progress && !spawned.has(enemy.id));
}

export interface BossAttackState {
  readonly nextAtMs: number;
  readonly warning?: Readonly<{ x: number; y: number; releaseAtMs: number }>;
}
export function createBossAttack(nowMs: number, definition: BossDefinition): BossAttackState {
  return { nextAtMs: nowMs + definition.attack.recoveryMs };
}

/** One fixed warning and one pulse, never a catch-up loop or wall timer. */
export function advanceBossAttack(state: BossAttackState, definition: BossDefinition, nowMs: number,
  origin: Readonly<{ x: number; y: number }>, target: Readonly<{ x: number; y: number; radius: number }>,
): Readonly<{ state: BossAttackState; damage: number; released: boolean }> {
  if (state.warning) {
    if (nowMs < state.warning.releaseAtMs) return { state, damage: 0, released: false };
    const reach = definition.attack.radius + target.radius;
    const inside = (target.x - state.warning.x) ** 2 + (target.y - state.warning.y) ** 2 <= reach ** 2;
    return { state: { nextAtMs: nowMs + definition.attack.recoveryMs }, damage: inside ? definition.attack.damage : 0, released: true };
  }
  if (nowMs < state.nextAtMs) return { state, damage: 0, released: false };
  return { state: { nextAtMs: state.nextAtMs, warning: { x: origin.x, y: origin.y, releaseAtMs: nowMs + definition.attack.telegraphMs } }, damage: 0, released: false };
}

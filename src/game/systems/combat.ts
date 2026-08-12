export interface DamageRollOptions {
  readonly baseDamage: number;
  readonly damageBonus: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly random: () => number;
}

export interface DamageRoll {
  readonly damage: number;
  readonly critical: boolean;
}

export interface HitResult {
  readonly health: number;
  readonly killed: boolean;
  readonly applied: boolean;
}

export interface PierceState {
  readonly remainingHits: number;
  readonly hitTargetIds: ReadonlySet<string>;
}

export function rollDamage(options: DamageRollOptions): DamageRoll {
  const critical = options.random() < Math.min(1, Math.max(0, options.critChance));
  const modifiedDamage = options.baseDamage * (1 + options.damageBonus);
  return {
    damage: modifiedDamage * (critical ? options.critDamage : 1),
    critical,
  };
}

export function applyDamage(health: number, damage: number): HitResult {
  if (health <= 0 || damage <= 0) return { health: Math.max(0, health), killed: false, applied: false };
  const nextHealth = Math.max(0, health - damage);
  return { health: nextHealth, killed: nextHealth === 0, applied: true };
}

export function createPierceState(pierce: number): PierceState {
  return { remainingHits: Math.max(1, Math.floor(pierce) + 1), hitTargetIds: new Set() };
}

export function consumePierce(state: PierceState, targetId: string): PierceState {
  if (state.remainingHits <= 0 || state.hitTargetIds.has(targetId)) return state;
  const hitTargetIds = new Set(state.hitTargetIds);
  hitTargetIds.add(targetId);
  return { remainingHits: state.remainingHits - 1, hitTargetIds };
}

export function canApplyContactDamage(nowMs: number, lastHitMs: number, cooldownMs: number): boolean {
  return nowMs >= lastHitMs + cooldownMs;
}

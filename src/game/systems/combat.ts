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
  readonly tier: number;
  readonly multiplier: number;
  readonly baseDamage: number;
  readonly bonusDamage: number;
}
import { resolveCritTier } from "../core/combat/crit";

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
  const modifiedDamage = options.baseDamage * (1 + options.damageBonus);
  const crit = resolveCritTier(options.critChance, options.random);
  const multiplier = crit.tier === 0 ? 1 : options.critDamage ** crit.tier;
  const damage = modifiedDamage * multiplier;
  return {
    damage,
    critical: crit.tier > 0,
    tier: crit.tier,
    multiplier,
    baseDamage: modifiedDamage,
    bonusDamage: damage - modifiedDamage,
  };
}

export function piercingMomentumDamage(baseDamage: number, chainIndex: number, damagePerUniqueHit: number): number {
  return baseDamage * (1 + Math.max(0, Math.floor(chainIndex)) * Math.max(0, damagePerUniqueHit));
}

/**
 * Multiplicative damage reduction.
 *
 * `damage * 100 / (100 + armour)` never reaches immunity however high armour
 * goes, and never trivialises late contact damage the way flat subtraction
 * would. `armourPierce` ignores that share of the target's armour.
 */
export function reduceByArmour(damage: number, armour: number, armourPierce = 0): number {
  const effective = Math.max(0, armour) * (1 - Math.min(1, Math.max(0, armourPierce)));
  return Math.max(0, damage) * (100 / (100 + effective));
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

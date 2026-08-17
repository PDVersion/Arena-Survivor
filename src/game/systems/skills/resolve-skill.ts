import type { SkillDefinition, SkillEffectDefinition } from "../../core/archetypes/contracts";
import type { SkillId } from "../../core/archetypes/ids";

/**
 * Skill effects resolved at a level.
 *
 * Every resolver is pure and clamps its own level, so a caller can pass a raw
 * stored level without checking it first. Level 1 always returns the base
 * values, which keeps the theme data readable as "what this does when taken".
 */

export type SkillLevels = Readonly<Partial<Record<SkillId, number>>>;

export function skillLevel(levels: SkillLevels, skillId: SkillId): number {
  return Math.max(0, Math.floor(levels[skillId] ?? 0));
}

export function isSkillActive(levels: SkillLevels, skillId: SkillId): boolean {
  return skillLevel(levels, skillId) > 0;
}

/** Raise a skill by one, never past its declared cap. */
export function raiseSkillLevel(
  levels: SkillLevels,
  skillId: SkillId,
  maxLevel: number,
): SkillLevels {
  const cap = Math.max(1, Math.floor(maxLevel));
  const next = Math.min(cap, skillLevel(levels, skillId) + 1);
  return Object.freeze({ ...levels, [skillId]: next });
}

function steps(level: number): number {
  return Math.max(0, Math.floor(level) - 1);
}

export interface ResolvedExplosion {
  readonly radius: number;
  readonly flatDamage: number;
  readonly victimHealthShare: number;
}

export function resolveExplosion(
  effect: Extract<SkillEffectDefinition, { kind: "on_kill_explosion" }>,
  level: number,
): ResolvedExplosion {
  const advanced = steps(level);
  return Object.freeze({
    radius: effect.baseRadius + effect.radiusPerLevel * advanced,
    flatDamage: effect.flatDamage + effect.flatPerLevel * advanced,
    victimHealthShare: Math.min(
      effect.maxShare,
      effect.victimHealthShare + effect.sharePerLevel * advanced,
    ),
  });
}

/**
 * Blast damage scales from what died, not a flat number.
 *
 * A late-run elite durable enemy therefore detonates for a great deal and a
 * light one barely pops, which makes target choice the play and lets Phase 6's
 * health scaling feed the effect automatically.
 */
export function explosionDamage(resolved: ResolvedExplosion, victimMaxHealth: number): number {
  return resolved.flatDamage + Math.max(0, victimMaxHealth) * resolved.victimHealthShare;
}

export interface ResolvedChain {
  readonly maxDepth: number;
  readonly damageFalloff: number;
  readonly radiusFalloff: number;
}

export function resolveChain(
  effect: Extract<SkillEffectDefinition, { kind: "chain_reaction" }>,
  level: number,
): ResolvedChain {
  const advanced = steps(level);
  return Object.freeze({
    maxDepth: effect.baseDepth + effect.depthPerLevel * advanced,
    damageFalloff: Math.min(1, effect.damageFalloff + effect.falloffPerLevel * advanced),
    radiusFalloff: Math.min(1, effect.radiusFalloff + effect.radiusFalloffPerLevel * advanced),
  });
}

/** Damage and radius multipliers at a given chain depth. */
export function chainScaleAtDepth(
  resolved: ResolvedChain,
  depth: number,
): Readonly<{ damage: number; radius: number }> {
  const level = Math.max(0, Math.floor(depth));
  return Object.freeze({
    damage: resolved.damageFalloff ** level,
    radius: resolved.radiusFalloff ** level,
  });
}

export function resolveMomentum(
  effect: Extract<SkillEffectDefinition, { kind: "piercing_momentum" }>,
  level: number,
): number {
  return effect.damagePerUniqueHit + effect.perLevel * steps(level);
}

export function resolveFractureChance(
  effect: Extract<SkillEffectDefinition, { kind: "fracture" }>,
  level: number,
): number {
  return Math.min(1, effect.chance + effect.chancePerLevel * steps(level));
}

export function resolveBloodlust(
  effect: Extract<SkillEffectDefinition, { kind: "bloodlust" }>,
  level: number,
): Readonly<{ windowMs: number; killsPerStep: number; attackSpeedPerStep: number }> {
  return Object.freeze({
    windowMs: effect.windowMs,
    killsPerStep: effect.killsPerStep,
    attackSpeedPerStep: effect.attackSpeedPerStep + effect.attackSpeedPerLevel * steps(level),
  });
}

/** Find one skill's effect of a given kind, if the theme declares it. */
export function findSkillEffect<K extends SkillEffectDefinition["kind"]>(
  skills: readonly SkillDefinition[],
  skillId: SkillId,
  kind: K,
): Extract<SkillEffectDefinition, { kind: K }> | undefined {
  const skill = skills.find((candidate) => candidate.id === skillId);
  return skill?.effects?.find((effect) => effect.kind === kind) as
    | Extract<SkillEffectDefinition, { kind: K }>
    | undefined;
}

export function skillMaxLevel(skills: readonly SkillDefinition[], skillId: SkillId): number {
  return skills.find((candidate) => candidate.id === skillId)?.maxLevel ?? 1;
}

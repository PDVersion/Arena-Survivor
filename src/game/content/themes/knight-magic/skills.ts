import { archetypeIds } from "../../../core/archetypes/ids";
import type { SkillDefinition } from "../../../core/archetypes/contracts";

/**
 * Skills level rather than toggling on. Held in step with the production pack.
 *
 * Level 1 is deliberately weaker than the V0.2 fixed values so investment has
 * somewhere to go; the cap is far stronger. Every `*PerLevel` is the increment
 * past the first level, so the base numbers read as "what this does when taken".
 */
export const skills = [
  {
    id: archetypeIds.skill.piercingMomentum,
    maxLevel: 6,
    effects: [{ kind: "piercing_momentum", damagePerUniqueHit: 0.1, perLevel: 0.1 }],
  },
  {
    // Blast damage is a share of what died, so clearing a durable target is
    // worth far more than popping a light one. Radius 44 at level 1 versus
    // V0.2's fixed 96, reaching 128 at the cap.
    id: archetypeIds.skill.onKillExplosion,
    maxLevel: 8,
    effects: [{
      kind: "on_kill_explosion",
      baseRadius: 44,
      radiusPerLevel: 12,
      flatDamage: 3,
      flatPerLevel: 2,
      victimHealthShare: 0.3,
      sharePerLevel: 0.08,
      maxShare: 0.9,
    }],
  },
  {
    id: archetypeIds.skill.fracture,
    maxLevel: 5,
    effects: [{
      kind: "fracture",
      chance: 0.15,
      chancePerLevel: 0.05,
      childEnemyId: archetypeIds.enemy.fastFragile,
      childCount: 2,
      rewardMultiplier: 0,
    }],
  },
  {
    id: archetypeIds.skill.bloodlust,
    maxLevel: 6,
    effects: [{
      kind: "bloodlust",
      windowMs: 5_000,
      killsPerStep: 10,
      attackSpeedPerStep: 0.01,
      attackSpeedPerLevel: 0.005,
    }],
  },
  {
    // An explicit depth limit replaces "bounded only by exact-once claims", so
    // a 300-enemy chain stays finite, readable, and measurable.
    id: archetypeIds.skill.chainReaction,
    maxLevel: 5,
    effects: [{
      kind: "chain_reaction",
      baseDepth: 2,
      depthPerLevel: 1,
      damageFalloff: 0.7,
      falloffPerLevel: 0.04,
      radiusFalloff: 0.85,
      radiusFalloffPerLevel: 0.02,
    }],
  },
] as const satisfies readonly SkillDefinition[];

import { archetypeIds } from "../../../core/archetypes/ids";
import type { SkillDefinition } from "../../../core/archetypes/contracts";

export const skills = [
  {
    id: archetypeIds.skill.piercingMomentum,
    effects: [{ kind: "piercing_momentum", damagePerUniqueHit: 0.1 }],
  },
  { id: archetypeIds.skill.onKillExplosion, effects: [{ kind: "on_kill_explosion", radius: 96, damage: 15 }] },
  { id: archetypeIds.skill.fracture, effects: [{ kind: "fracture", chance: 0.15, childEnemyId: archetypeIds.enemy.fastFragile, childCount: 2, rewardMultiplier: 0 }] },
  { id: archetypeIds.skill.bloodlust, effects: [{ kind: "bloodlust", windowMs: 5_000, killsPerStep: 10, attackSpeedPerStep: 0.01 }] },
  { id: archetypeIds.skill.chainReaction, effects: [{ kind: "chain_reaction" }] },
] as const satisfies readonly SkillDefinition[];

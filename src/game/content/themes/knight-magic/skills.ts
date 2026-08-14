import { archetypeIds } from "../../../core/archetypes/ids";
import type { SkillDefinition } from "../../../core/archetypes/contracts";

export const skills = [
  {
    id: archetypeIds.skill.piercingMomentum,
    effects: [{ kind: "piercing_momentum", damagePerUniqueHit: 0.1 }],
  },
  { id: archetypeIds.skill.onKillExplosion },
  { id: archetypeIds.skill.fracture },
  { id: archetypeIds.skill.bloodlust },
  { id: archetypeIds.skill.chainReaction },
] as const satisfies readonly SkillDefinition[];

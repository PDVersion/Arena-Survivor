import { archetypeIds } from "../../../core/archetypes/ids";
import type { SkillDefinition } from "../../../core/archetypes/contracts";

export const skills = Object.values(archetypeIds.skill).map((id) => ({ id })) satisfies readonly SkillDefinition[];

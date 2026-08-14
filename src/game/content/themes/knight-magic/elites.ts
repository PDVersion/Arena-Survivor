import { eliteIds } from "../../../core/archetypes/categories";
import type { EliteDefinition } from "../../../core/archetypes/contracts";

export const elites = [{ id: eliteIds.baseline }] as const satisfies readonly EliteDefinition[];

import { archetypeIds } from "../../../core/archetypes/ids";
import type { CharacterDefinition } from "../../../core/archetypes/contracts";

export const characters = [
  {
    id: archetypeIds.character.starter,
    radius: 18,
    presentationToken: "player",
  },
] as const satisfies readonly CharacterDefinition[];

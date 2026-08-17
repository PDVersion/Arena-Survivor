import { archetypeIds } from "../../../core/archetypes/ids";
import type { PickupDefinition } from "../../../core/archetypes/contracts";

export const pickups = [
  {
    id: archetypeIds.pickup.experience,
    radius: 7,
    magnetSpeed: 320,
    presentationToken: "pickup",
  },
] as const satisfies readonly PickupDefinition[];

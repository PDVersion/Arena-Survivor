import { archetypeIds } from "../../../core/archetypes/ids";
import type { PickupDefinition } from "../../../core/archetypes/contracts";

export const pickups = [
  {
    id: archetypeIds.pickup.experience,
    kind: "money", denominations: [4, 25],
    radius: 7,
    magnetSpeed: 320,
    magnetPull: { startSpeed: 70, acceleration: 650, maxSpeed: 1900 },
    presentationToken: "pickup",
  },
  ...([archetypeIds.pickup.magnet, archetypeIds.pickup.food, archetypeIds.pickup.impact] as const).map((id) => ({
    id, radius: 10, magnetSpeed: 280, presentationToken: "pickup" as const,
    kind: id === archetypeIds.pickup.magnet ? "magnet" as const : id === archetypeIds.pickup.food ? "food" as const : "impact" as const,
  })),
] as const satisfies readonly PickupDefinition[];

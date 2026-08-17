import { archetypeIds } from "../../../core/archetypes/ids";
import type { CharacterDefinition } from "../../../core/archetypes/contracts";

export const characters = [
  {
    id: archetypeIds.character.starter,
    radius: 18,
    presentationToken: "player",
    baseStats: {
      maxHealth: 100,
      moveSpeed: 200,
      armour: 0,
      regeneration: 0,
      pickupRadius: 80,
      damageBonus: 0,
      attackSpeedBonus: 0,
      critChance: 0.05,
      critDamage: 2,
      luck: 0,
      xpMultiplier: 1,
    },
  },
] as const satisfies readonly CharacterDefinition[];

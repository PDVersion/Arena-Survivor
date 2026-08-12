import { archetypeIds } from "../../src/game/core/archetypes/ids";
import type { ThemeCopy } from "../../src/game/core/archetypes/contracts";
import { defineTheme } from "../../src/game/content/define-theme";

const content = Object.fromEntries(
  Object.values(archetypeIds).flatMap((category) =>
    Object.values(category).map((id) => [id, { name: `Test ${id}`, description: `Test copy for ${id}` }]),
  ),
) as ThemeCopy["content"];

export const alternateTheme = defineTheme({
  id: "alternate_test",
  schemaVersion: 1,
  copy: {
    gameTitle: "Test Swarm",
    arenaName: "Neon Test Grid",
    bootStatus: "Fixture ready",
    bootFailure: "Fixture failed",
    movementHint: "Use test controls",
    content,
  },
  tokens: {
    palette: {
      background: "#111111",
      floor: "#222222",
      grid: "#333333",
      accent: "#00ff00",
      text: "#ffffff",
      player: "#ff00ff",
    },
    playerShape: "circle",
  },
  characters: [
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
  ],
});

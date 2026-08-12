import type { ThemeTokens } from "../../../core/archetypes/contracts";

export const tokens = {
  palette: {
    background: "#0a0f1b",
    floor: "#17213a",
    grid: "#263758",
    accent: "#d6ad55",
    text: "#f7e7b5",
    player: "#7dd3fc",
    enemy: "#e87979",
    projectile: "#c4b5fd",
    critical: "#fbbf24",
  },
  playerShape: "diamond",
} as const satisfies ThemeTokens;

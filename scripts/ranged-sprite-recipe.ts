import type { SpriteBuildDefinition } from "../src/game/systems/sprites/sprite-pipeline";
export const rangedSpriteRecipe = {
  "contentId": "enemy.ranged_attacker",
  "source": "build/sprites/raw/enemy_ranged_attacker.a3.png",
  "output": "public/sprites/eco-guardian/enemy_ranged_attacker.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "frames": 7,
  "background": "transparent",
  "sourceGrid": {
    "left": -30,
    "top": 170,
    "cellWidth": 323,
    "cellHeight": 400,
    "fit": "contain",
    "allowTransparentPadding": true
  },
  "outlineWidth": 2,
  "palette": [
    [
      "#172d5f",
      "#64748b",
      "#e2e8f0",
      "#f8fafc"
    ],
    [
      "#111827",
      "#374151",
      "#6b7280",
      "#d1d5db"
    ],
    [
      "#713f12",
      "#b7791f",
      "#facc15",
      "#fde68a"
    ]
  ],
  "outline": "#111827",
  "acceptedOutput": "build/sprites/accepted/enemy_ranged_attacker.png"
} as const satisfies SpriteBuildDefinition;

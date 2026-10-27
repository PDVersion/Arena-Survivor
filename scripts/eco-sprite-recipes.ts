/** Owner-selected style2 recipes; preserved raw inputs remain reproducible. */
import type { SpriteBuildDefinition } from "../src/game/systems/sprites/sprite-pipeline";
export const ecoSpriteRecipes = [
  {
    "contentId": "enemy.swarm_basic",
    "source": "build/sprites/raw/enemy_swarm_basic.a2.png",
    "output": "public/sprites/eco-guardian/enemy_swarm_basic.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 90,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#173b73",
        "#356fae",
        "#60a5fa",
        "#9ac8fb"
      ],
      [
        "#4b5563",
        "#9ca3af",
        "#e2e8f0",
        "#f8fafc"
      ]
    ],
    "outline": "#173b73",
    "acceptedOutput": "build/sprites/accepted/enemy_swarm_basic.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.swarm_basic"
  },
  {
    "contentId": "enemy.fast_fragile",
    "source": "build/sprites/raw/enemy_fast_fragile.a4.png",
    "output": "public/sprites/eco-guardian/enemy_fast_fragile.png",
    "frameWidth": 48,
    "frameHeight": 48,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 90,
      "cellWidth": 543,
      "cellHeight": 543
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
        "#7f1d1d",
        "#b91c1c",
        "#ef4444",
        "#fca5a5"
      ],
      [
        "#173b73",
        "#356fae",
        "#2563eb",
        "#93c5fd"
      ],
      [
        "#713f12",
        "#b7791f",
        "#facc15",
        "#fde68a"
      ]
    ],
    "outline": "#172d5f",
    "acceptedOutput": "build/sprites/accepted/enemy_fast_fragile.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.fast_fragile"
  },
  {
    "contentId": "enemy.slow_durable",
    "source": "build/sprites/raw/enemy_slow_durable.a4.png",
    "output": "public/sprites/eco-guardian/enemy_slow_durable.png",
    "frameWidth": 96,
    "frameHeight": 96,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 30,
      "cellWidth": 543,
      "cellHeight": 680,
      "fit": "contain"
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#0f4f52",
        "#169b91",
        "#2dd4bf",
        "#82eadc"
      ],
      [
        "#4b5563",
        "#9ca3af",
        "#e2e8f0",
        "#f8fafc"
      ]
    ],
    "outline": "#0f4f52",
    "acceptedOutput": "build/sprites/accepted/enemy_slow_durable.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.slow_durable"
  },
  {
    "contentId": "enemy.death_spawner",
    "source": "build/sprites/raw/enemy_death_spawner.a3.png",
    "output": "public/sprites/eco-guardian/enemy_death_spawner.png",
    "frameWidth": 96,
    "frameHeight": 96,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 125,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#3b1762",
        "#8050bd",
        "#c084fc",
        "#dcb5fd"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ],
      [
        "#7c2d12",
        "#c65d1a",
        "#fb923c",
        "#fdba74"
      ]
    ],
    "outline": "#3b1762",
    "acceptedOutput": "build/sprites/accepted/enemy_death_spawner.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.death_spawner"
  },
  {
    "contentId": "character.starter",
    "source": "build/sprites/raw/character_starter.a4.png",
    "output": "public/sprites/eco-guardian/character_starter.png",
    "frameWidth": 96,
    "frameHeight": 96,
    "frames": 8,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 232,
      "cellWidth": 272,
      "cellHeight": 288,
      "fit": "contain",
      "allowTransparentPadding": true
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
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
      ],
      [
        "#7c2d12",
        "#c65d1a",
        "#fb923c",
        "#fdba74"
      ]
    ],
    "outline": "#14532d",
    "acceptedOutput": "build/sprites/accepted/character_starter.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.character.starter"
  },
  {
    "contentId": "enemy.stationary_fragment",
    "source": "build/sprites/raw/enemy_stationary_fragment.a1.png",
    "output": "public/sprites/eco-guardian/enemy_stationary_fragment.png",
    "frameWidth": 48,
    "frameHeight": 48,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 122,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#0f4f52",
        "#169b91",
        "#2dd4bf",
        "#82eadc"
      ]
    ],
    "outline": "#0f4f52",
    "acceptedOutput": "build/sprites/accepted/enemy_stationary_fragment.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.stationary_fragment"
  },
  {
    "contentId": "enemy.cluster_fodder",
    "source": "build/sprites/raw/enemy_cluster_fodder.a1.png",
    "output": "public/sprites/eco-guardian/enemy_cluster_fodder.png",
    "frameWidth": 48,
    "frameHeight": 48,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 85,
      "cellWidth": 543,
      "cellHeight": 543
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
        "#7c2d12",
        "#c65d1a",
        "#fb923c",
        "#fdba74"
      ],
      [
        "#111827",
        "#374151",
        "#6b7280",
        "#d1d5db"
      ]
    ],
    "outline": "#172d5f",
    "acceptedOutput": "build/sprites/accepted/enemy_cluster_fodder.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.cluster_fodder"
  },
  {
    "contentId": "enemy.gust_drifter",
    "source": "build/sprites/raw/enemy_gust_drifter.a1.png",
    "output": "public/sprites/eco-guardian/enemy_gust_drifter.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 100,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#3b1762",
        "#8050bd",
        "#c084fc",
        "#dcb5fd"
      ],
      [
        "#713f12",
        "#b7791f",
        "#facc15",
        "#fde68a"
      ]
    ],
    "outline": "#3b1762",
    "acceptedOutput": "build/sprites/accepted/enemy_gust_drifter.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.gust_drifter"
  },
  {
    "contentId": "enemy.committed_charger",
    "source": "build/sprites/raw/enemy_committed_charger.a1.png",
    "output": "public/sprites/eco-guardian/enemy_committed_charger.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 113,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#111827",
        "#374151",
        "#6b7280",
        "#d1d5db"
      ],
      [
        "#0f4f52",
        "#169b91",
        "#2dd4bf",
        "#82eadc"
      ]
    ],
    "outline": "#111827",
    "acceptedOutput": "build/sprites/accepted/enemy_committed_charger.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.committed_charger"
  },
  {
    "contentId": "enemy.mini_boss",
    "source": "build/sprites/raw/enemy_mini_boss.a1.png",
    "output": "public/sprites/eco-guardian/enemy_mini_boss.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 105,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#0f4f52",
        "#169b91",
        "#2dd4bf",
        "#82eadc"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#173b73",
        "#356fae",
        "#60a5fa",
        "#9ac8fb"
      ]
    ],
    "outline": "#0f4f52",
    "acceptedOutput": "build/sprites/accepted/enemy_mini_boss.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.mini_boss"
  },
  {
    "contentId": "enemy.final_boss",
    "source": "build/sprites/raw/enemy_final_boss.a1.png",
    "output": "public/sprites/eco-guardian/enemy_final_boss.png",
    "frameWidth": 192,
    "frameHeight": 192,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 95,
      "cellWidth": 543,
      "cellHeight": 582,
      "fit": "contain"
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#3b1762",
        "#8050bd",
        "#c084fc",
        "#dcb5fd"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ],
      [
        "#173b73",
        "#356fae",
        "#60a5fa",
        "#9ac8fb"
      ],
      [
        "#0f4f52",
        "#169b91",
        "#2dd4bf",
        "#82eadc"
      ]
    ],
    "outline": "#3b1762",
    "acceptedOutput": "build/sprites/accepted/enemy_final_boss.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.final_boss"
  },
  {
    "contentId": "weapon.starter",
    "source": "build/sprites/raw/weapon_starter.a1.png",
    "output": "public/sprites/eco-guardian/weapon_starter.png",
    "frameWidth": 128,
    "frameHeight": 32,
    "frames": 3,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 266,
      "cellWidth": 724,
      "cellHeight": 181
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#164e63",
        "#3893b5",
        "#7dd3fc",
        "#bae6fd"
      ],
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
      ],
      [
        "#111827",
        "#374151",
        "#6b7280",
        "#d1d5db"
      ]
    ],
    "outline": "#164e63",
    "acceptedOutput": "build/sprites/accepted/weapon_starter.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.weapon.starter"
  },
  {
    "contentId": "weapon.secondary",
    "source": "build/sprites/raw/weapon_secondary.a1.png",
    "output": "public/sprites/eco-guardian/weapon_secondary.png",
    "frameWidth": 128,
    "frameHeight": 64,
    "frames": 3,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 190,
      "cellWidth": 724,
      "cellHeight": 362
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#164e63",
        "#3893b5",
        "#7dd3fc",
        "#bae6fd"
      ],
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
      ],
      [
        "#111827",
        "#374151",
        "#6b7280",
        "#d1d5db"
      ]
    ],
    "outline": "#164e63",
    "acceptedOutput": "build/sprites/accepted/weapon_secondary.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.weapon.secondary"
  },
  {
    "contentId": "weapon.secondary_evolved",
    "source": "build/sprites/raw/weapon_secondary_evolved.a1.png",
    "output": "public/sprites/eco-guardian/weapon_secondary_evolved.png",
    "frameWidth": 128,
    "frameHeight": 64,
    "frames": 3,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 190,
      "cellWidth": 724,
      "cellHeight": 362
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#164e63",
        "#3893b5",
        "#7dd3fc",
        "#bae6fd"
      ],
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
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
    "outline": "#164e63",
    "acceptedOutput": "build/sprites/accepted/weapon_secondary_evolved.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.weapon.secondary_evolved"
  },
  {
    "contentId": "pickup.impact",
    "source": "build/sprites/raw/pickup_experience.a1.png",
    "output": "public/sprites/eco-guardian/pickup_impact.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 3,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 0,
      "cellWidth": 724,
      "cellHeight": 724
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#365314",
        "#65a30d",
        "#a3e635",
        "#d9f99d"
      ]
    ],
    "outline": "#365314",
    "acceptedOutput": "build/sprites/accepted/pickup_impact.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.pickup.impact"
  },
  {
    "contentId": "shrine.spawn_surge",
    "source": "build/sprites/raw/shrine_spawn_surge.a1.png",
    "output": "public/sprites/eco-guardian/shrine_spawn_surge.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 106,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#881337",
        "#be3459",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ]
    ],
    "outline": "#3f4b26",
    "acceptedOutput": "build/sprites/accepted/shrine_spawn_surge.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.shrine.spawn_surge"
  },
  {
    "contentId": "shrine.greed",
    "source": "build/sprites/raw/shrine_greed.a1.png",
    "output": "public/sprites/eco-guardian/shrine_greed.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 82,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#881337",
        "#be3459",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ]
    ],
    "outline": "#3f4b26",
    "acceptedOutput": "build/sprites/accepted/shrine_greed.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.shrine.greed"
  },
  {
    "contentId": "shrine.multiplicity",
    "source": "build/sprites/raw/shrine_multiplicity.a1.png",
    "output": "public/sprites/eco-guardian/shrine_multiplicity.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 99,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#881337",
        "#be3459",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ]
    ],
    "outline": "#3f4b26",
    "acceptedOutput": "build/sprites/accepted/shrine_multiplicity.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.shrine.multiplicity"
  },
  {
    "contentId": "shrine.duplication",
    "source": "build/sprites/raw/shrine_duplication.a1.png",
    "output": "public/sprites/eco-guardian/shrine_duplication.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 117,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#881337",
        "#be3459",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ]
    ],
    "outline": "#3f4b26",
    "acceptedOutput": "build/sprites/accepted/shrine_duplication.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.shrine.duplication"
  },
  {
    "contentId": "shrine.escalation",
    "source": "build/sprites/raw/shrine_escalation.a1.png",
    "output": "public/sprites/eco-guardian/shrine_escalation.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 105,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#881337",
        "#be3459",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ]
    ],
    "outline": "#3f4b26",
    "acceptedOutput": "build/sprites/accepted/shrine_escalation.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.shrine.escalation"
  },
  {
    "contentId": "hazard.damage_zone",
    "source": "build/sprites/raw/hazard_damage_zone.a1.png",
    "output": "public/sprites/eco-guardian/hazard_damage_zone.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 117,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#7c2d12",
        "#c65d1a",
        "#fb923c",
        "#fdba74"
      ],
      [
        "#3f4b26",
        "#68753b",
        "#91a657",
        "#c0d187"
      ]
    ],
    "outline": "#3f4b26",
    "acceptedOutput": "build/sprites/accepted/hazard_damage_zone.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.hazard.damage_zone"
  },
  {
    "contentId": "hazard.obstacle",
    "source": "build/sprites/raw/hazard_obstacle.a1.png",
    "output": "public/sprites/eco-guardian/hazard_obstacle.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 90,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#101c15",
        "#1b2b20",
        "#23372a",
        "#51644c"
      ],
      [
        "#374151",
        "#6b7280",
        "#d1d5db",
        "#f8fafc"
      ]
    ],
    "outline": "#374151",
    "acceptedOutput": "build/sprites/accepted/hazard_obstacle.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.hazard.obstacle"
  },
  {
    "contentId": "hazard.periodic_burst",
    "source": "build/sprites/raw/hazard_periodic_burst.a1.png",
    "output": "public/sprites/eco-guardian/hazard_periodic_burst.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 111,
      "cellWidth": 543,
      "cellHeight": 543
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#881337",
        "#be3459",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#101c15",
        "#1b2b20",
        "#23372a",
        "#51644c"
      ]
    ],
    "outline": "#101c15",
    "acceptedOutput": "build/sprites/accepted/hazard_periodic_burst.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.hazard.periodic_burst"
  },
  {
    "contentId": "icon.weapon.starter",
    "source": "build/sprites/raw/icon_weapon_starter.a1.png",
    "output": "public/sprites/eco-guardian/icon_weapon_starter.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 1,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 0,
      "cellWidth": 1254,
      "cellHeight": 1254
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#164e63",
        "#3893b5",
        "#7dd3fc",
        "#bae6fd"
      ],
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
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
    "outline": "#164e63",
    "acceptedOutput": "build/sprites/accepted/icon_weapon_starter.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.icon.weapon.starter"
  },
  {
    "contentId": "icon.weapon.secondary",
    "source": "build/sprites/raw/icon_weapon_secondary.a1.png",
    "output": "public/sprites/eco-guardian/icon_weapon_secondary.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 1,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 0,
      "cellWidth": 1254,
      "cellHeight": 1254
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#164e63",
        "#3893b5",
        "#7dd3fc",
        "#bae6fd"
      ],
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
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
    "outline": "#164e63",
    "acceptedOutput": "build/sprites/accepted/icon_weapon_secondary.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.icon.weapon.secondary"
  },
  {
    "contentId": "icon.weapon.secondary_evolved",
    "source": "build/sprites/raw/icon_weapon_secondary_evolved.a1.png",
    "output": "public/sprites/eco-guardian/icon_weapon_secondary_evolved.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 1,
    "background": "transparent",
    "sourceGrid": {
      "left": 0,
      "top": 0,
      "cellWidth": 1254,
      "cellHeight": 1254
    },
    "outlineWidth": 2,
    "palette": [
      [
        "#164e63",
        "#3893b5",
        "#7dd3fc",
        "#bae6fd"
      ],
      [
        "#14532d",
        "#22a34e",
        "#4ade80",
        "#8df0ac"
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
    "outline": "#164e63",
    "acceptedOutput": "build/sprites/accepted/icon_weapon_secondary_evolved.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.icon.weapon.secondary_evolved"
  },
  {
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
    "acceptedOutput": "build/sprites/accepted/enemy_ranged_attacker.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.ranged_attacker"
  },
  {
    "contentId": "pickup.experience",
    "source": "build/sprites/raw/pickup_money.a1.png",
    "output": "public/sprites/eco-guardian/pickup_experience.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 3,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/pickup_money.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.pickup.experience"
  },
  {
    "contentId": "pickup.magnet",
    "source": "build/sprites/raw/pickup_magnet.a1.png",
    "output": "public/sprites/eco-guardian/pickup_magnet.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 4,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/pickup_magnet.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.pickup.magnet"
  },
  {
    "contentId": "pickup.food",
    "source": "build/sprites/raw/pickup_food.a1.png",
    "output": "public/sprites/eco-guardian/pickup_food.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 1,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/pickup_food.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.pickup.food"
  },
  {
    "contentId": "enemy.scavenger",
    "source": "build/sprites/raw/enemy_scavenger.a2.png",
    "output": "public/sprites/eco-guardian/enemy_scavenger.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/enemy_scavenger.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.enemy.scavenger"
  },
  {
    "contentId": "weapon.cleaning_bin",
    "source": "build/sprites/raw/weapon_cleaning_bin.a1.png",
    "output": "public/sprites/eco-guardian/weapon_cleaning_bin.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 3,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/weapon_cleaning_bin.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.weapon.cleaning_bin"
  },
  {
    "contentId": "weapon.rake_beam",
    "source": "build/sprites/raw/weapon_rake_beam.a2.png",
    "output": "public/sprites/eco-guardian/weapon_rake_beam.png",
    "frameWidth": 96,
    "frameHeight": 32,
    "frames": 1,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/weapon_rake_beam.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.weapon.rake_beam"
  },
  {
    "contentId": "weapon.orbiting_rake",
    "source": "build/sprites/raw/weapon_orbiting_shovel.a1.png",
    "output": "public/sprites/eco-guardian/weapon_orbiting_shovel.png",
    "frameWidth": 96,
    "frameHeight": 32,
    "frames": 1,
    "background": "transparent",
    "keepLargestComponentPerFrame": true,
    "outlineWidth": 2,
    "palette": [
      [
        "#172d3c",
        "#475569",
        "#94a3b8",
        "#e2e8f0"
      ],
      [
        "#713f12",
        "#ca8a04",
        "#facc15",
        "#fef08a"
      ],
      [
        "#14532d",
        "#16a34a",
        "#86efac",
        "#dcfce7"
      ],
      [
        "#7f1d1d",
        "#dc2626",
        "#fb7185",
        "#fecdd3"
      ],
      [
        "#78350f",
        "#b45309",
        "#fb923c",
        "#ffedd5"
      ]
    ],
    "outline": "#172d3c",
    "acceptedOutput": "build/sprites/accepted/weapon_orbiting_shovel.png",
    "theme": "eco-guardian",
    "textureKey": "eco_guardian.weapon.orbiting_rake"
  }
] as const satisfies readonly (SpriteBuildDefinition & { readonly theme: string; readonly textureKey: string })[];

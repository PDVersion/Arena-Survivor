import type { ThemeSprites } from "../../../core/archetypes/contracts";

/** Full owner-selected style2 roster. All measurements are presentation only. */
export const sprites = {
  "enemy.swarm_basic": {
    "key": "eco_guardian.enemy.swarm_basic",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.fast_fragile": {
    "key": "eco_guardian.enemy.fast_fragile",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 48,
    "frameHeight": 48,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.slow_durable": {
    "key": "eco_guardian.enemy.slow_durable",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 96,
    "frameHeight": 96,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.death_spawner": {
    "key": "eco_guardian.enemy.death_spawner",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 96,
    "frameHeight": 96,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "character.starter": {
    "key": "eco_guardian.character.starter",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 96,
    "frameHeight": 96,
    "frames": 8,
    "states": {
      "idle": 4,
      "move": 0,
      "hit": 5,
      "death": 7
    },
    "authoredFacing": "right",
    "stateFacing": {
      "hit": "left"
    },
    "walkAnimation": {
      "frames": [
        0,
        1,
        2,
        3
      ],
      "distancePerFrame": 20
    },
    "frameAnchors": [
      {
        "x": 54.5,
        "y": 48
      },
      {
        "x": 52,
        "y": 48
      },
      {
        "x": 54,
        "y": 48
      },
      {
        "x": 52,
        "y": 48
      },
      {
        "x": 46,
        "y": 48
      },
      {
        "x": 49.5,
        "y": 48
      },
      {
        "x": 49.5,
        "y": 48
      },
      {
        "x": 48,
        "y": 48
      }
    ]
  },
  "enemy.stationary_fragment": {
    "key": "eco_guardian.enemy.stationary_fragment",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 48,
    "frameHeight": 48,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.cluster_fodder": {
    "key": "eco_guardian.enemy.cluster_fodder",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 48,
    "frameHeight": 48,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.gust_drifter": {
    "key": "eco_guardian.enemy.gust_drifter",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.committed_charger": {
    "key": "eco_guardian.enemy.committed_charger",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.mini_boss": {
    "key": "eco_guardian.enemy.mini_boss",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "enemy.final_boss": {
    "key": "eco_guardian.enemy.final_boss",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 192,
    "frameHeight": 192,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  // Existing vacuum tool art is reused for HUD identification; aura delivery stays procedural.
  "weapon.secondary": {
    "key": "eco_guardian.weapon.secondary",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 64,
    "frames": 3,
    "states": { "idle": 0, "move": 0, "hit": 1, "death": 2 }
  },
  "weapon.starter": {
    "key": "eco_guardian.weapon.starter",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 32,
    "frames": 3,
    "states": {
      "idle": 0,
      "move": 0,
      "hit": 1,
      "death": 2
    },
    "iconFrameKey": "eco_guardian.icon.weapon.starter",
    "toolSpan": 112,
    "frameAnchors": [
      {
        "x": 8,
        "y": 16.0
      },
      {
        "x": 8,
        "y": 16.0
      },
      {
        "x": 8,
        "y": 16.0
      }
    ]
  },
  "shrine.spawn_surge": {
    "key": "eco_guardian.shrine.spawn_surge",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "shrine.greed": {
    "key": "eco_guardian.shrine.greed",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "shrine.multiplicity": {
    "key": "eco_guardian.shrine.multiplicity",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "shrine.duplication": {
    "key": "eco_guardian.shrine.duplication",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "shrine.escalation": {
    "key": "eco_guardian.shrine.escalation",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "hazard.damage_zone": {
    "key": "eco_guardian.hazard.damage_zone",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "hazard.obstacle": {
    "key": "eco_guardian.hazard.obstacle",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "hazard.periodic_burst": {
    "key": "eco_guardian.hazard.periodic_burst",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 128,
    "frameHeight": 128,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    }
  },
  "enemy.ranged_attacker": {
    "key": "eco_guardian.enemy.ranged_attacker",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 7,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right",
    "attackFrames": {
      "prepare": 4,
      "release": 5,
      "recover": 6
    },
    "frameAnchors": [
      {
        "x": 38,
        "y": 32
      },
      {
        "x": 31,
        "y": 32
      },
      {
        "x": 35,
        "y": 32
      },
      {
        "x": 31,
        "y": 32
      },
      {
        "x": 31,
        "y": 32
      },
      {
        "x": 26,
        "y": 32
      },
      {
        "x": 27,
        "y": 32
      }
    ]
  },
  "pickup.impact": {
    "key": "eco_guardian.pickup.impact",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 3,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 1,
      "death": 2
    }
  },
  "pickup.experience": {
    "key": "eco_guardian.pickup.experience",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 3,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 2
    }
  },
  "pickup.magnet": {
    "key": "eco_guardian.pickup.magnet",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 0,
      "hit": 2,
      "death": 2
    }
  },
  "pickup.food": {
    "key": "eco_guardian.pickup.food",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "frames": 1,
    "states": {
      "idle": 0,
      "move": 0,
      "hit": 0,
      "death": 0
    }
  },
  "enemy.scavenger": {
    "key": "eco_guardian.enemy.scavenger",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 4,
    "states": {
      "idle": 0,
      "move": 1,
      "hit": 2,
      "death": 3
    },
    "authoredFacing": "right"
  },
  "weapon.cleaning_bin": {
    "key": "eco_guardian.weapon.cleaning_bin",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "frames": 3,
    "states": {
      "idle": 0,
      "move": 0,
      "hit": 2,
      "death": 2
    }
  },
  "weapon.orbiting_rake": {
    "key": "eco_guardian.weapon.orbiting_rake",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 96,
    "frameHeight": 32,
    "frames": 1,
    "states": {
      "idle": 0,
      "move": 0,
      "hit": 0,
      "death": 0
    }
  },
  "weapon.rake_beam": {
    "key": "eco_guardian.weapon.rake_beam",
    "path": "sprites/eco-guardian/atlas.png",
    "frameWidth": 96,
    "frameHeight": 32,
    "frames": 1,
    "states": {
      "idle": 0,
      "move": 0,
      "hit": 0,
      "death": 0
    }
  }
} as const satisfies ThemeSprites;

import type { ThemeSprites } from "../../../core/archetypes/contracts";
import { archetypeIds } from "../../../core/archetypes/ids";

/**
 * Sprite sheets for this pack.
 *
 * Its own file rather than an entry in `tokens.ts` on purpose: `tokens.ts` is
 * edited whenever content needs a colour, and a sprite roster is edited on
 * every single sheet. Separating them gives the sprite work sole ownership of
 * one file and removes what would otherwise be the busiest merge conflict in
 * V0.4 — see `build/BUILD_PLAN_V0.4.md` §2.
 *
 * Entries are optional: every actor without one falls back to its primitive.
 */
export const sprites = {
  [archetypeIds.enemy.swarmBasic]: {
    key: "eco_guardian.enemy.swarm_basic",
    path: "sprites/eco-guardian/atlas.png",
    frameWidth: 32,
    frameHeight: 32,
    frames: 4,
    states: { idle: 0, move: 1, hit: 2, death: 3 },
  },
} as const satisfies ThemeSprites;

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
  [archetypeIds.enemy.fastFragile]: {
    key: "eco_guardian.enemy.fast_fragile",
    path: "sprites/eco-guardian/atlas.png",
    frameWidth: 24,
    frameHeight: 24,
    frames: 4,
    states: { idle: 0, move: 1, hit: 2, death: 3 },
  },
  [archetypeIds.enemy.slowDurable]: {
    key: "eco_guardian.enemy.slow_durable",
    path: "sprites/eco-guardian/atlas.png",
    frameWidth: 48,
    frameHeight: 48,
    frames: 4,
    states: { idle: 0, move: 1, hit: 2, death: 3 },
  },
  [archetypeIds.enemy.deathSpawner]: {
    key: "eco_guardian.enemy.death_spawner",
    path: "sprites/eco-guardian/atlas.png",
    frameWidth: 48,
    frameHeight: 48,
    frames: 4,
    states: { idle: 0, move: 1, hit: 2, death: 3 },
  },
  // Accepted broken-glass pose, reused until the dedicated fragment art pass.
  [archetypeIds.enemy.stationaryFragment]: {
    key: "eco_guardian.enemy.stationary_fragment",
    atlasFrameKey: "eco_guardian.enemy.slow_durable",
    path: "sprites/eco-guardian/atlas.png",
    frameWidth: 48, frameHeight: 48, frames: 4,
    states: { idle: 3, move: 3, hit: 3, death: 3 },
  },
  [archetypeIds.character.starter]: {
    // Centre of the hood's upper silhouette, measured in accepted 48px frames.
    // y compensates the one-pixel top shift; idle/walk/hit share a fixed anchor.
    frameAnchors: [{ x: 25.5, y: 24 }, { x: 26, y: 25 }, { x: 25, y: 24 },
      { x: 26.5, y: 24 }, { x: 25, y: 24 }, { x: 28, y: 24 },
      { x: 28, y: 25 }, { x: 24, y: 25 }],
    authoredFacing: "right",
    stateFacing: { hit: "left" },
    walkAnimation: { frames: [0, 1, 2, 1], distancePerFrame: 20 },
    key: "eco_guardian.character.starter",
    path: "sprites/eco-guardian/atlas.png",
    frameWidth: 48,
    frameHeight: 48,
    frames: 8,
    states: { idle: 4, move: 0, hit: 5, death: 7 },
  },
} as const satisfies ThemeSprites;

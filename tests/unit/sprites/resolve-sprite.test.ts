import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import type { SpriteDefinition } from "../../../src/game/core/archetypes/contracts";
import { resolveSprite, spriteEntries } from "../../../src/game/systems/sprites/resolve-sprite";

const sprite: SpriteDefinition = {
  key: archetypeIds.enemy.swarmBasic,
  path: "sprites/test/enemy_swarm_basic.png",
  frameWidth: 32,
  frameHeight: 32,
  frames: 4,
  states: { idle: 0, move: 1, hit: 2, death: 3 },
};

describe("resolveSprite", () => {
  it("returns nothing when the pack declares no sprites", () => {
    expect(resolveSprite({}, archetypeIds.enemy.swarmBasic)).toBeUndefined();
  });

  it("returns nothing for content the pack has not sprited", () => {
    // The normal case for most content most of the time: the roster grows
    // faster than the art does, and the actor falls back to its primitive.
    const tokens = { sprites: { [archetypeIds.enemy.swarmBasic]: sprite } };
    expect(resolveSprite(tokens, archetypeIds.enemy.fastFragile)).toBeUndefined();
  });

  it("returns the entry when there is one", () => {
    const tokens = { sprites: { [archetypeIds.enemy.swarmBasic]: sprite } };
    expect(resolveSprite(tokens, archetypeIds.enemy.swarmBasic)).toBe(sprite);
  });
});

describe("spriteEntries", () => {
  it("is empty for a pack with no sprites", () => {
    expect(spriteEntries({})).toEqual([]);
    expect(spriteEntries({ sprites: {} })).toEqual([]);
  });

  it("lists every declared sprite with its content id", () => {
    const tokens = { sprites: { [archetypeIds.enemy.swarmBasic]: sprite } };
    expect(spriteEntries(tokens)).toEqual([[archetypeIds.enemy.swarmBasic, sprite]]);
  });
});

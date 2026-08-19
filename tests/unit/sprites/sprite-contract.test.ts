import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import type {
  SpriteDefinition,
  ThemeManifest,
  ThemeSprites,
} from "../../../src/game/core/archetypes/contracts";
import { validateTheme } from "../../../src/game/content/define-theme";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { alternateTheme } from "../../fixtures/alternate-theme";

const wellFormed: SpriteDefinition = {
  key: archetypeIds.enemy.swarmBasic,
  path: "sprites/alternate/enemy_swarm_basic.png",
  frameWidth: 32,
  frameHeight: 32,
  frames: 4,
  states: { idle: 0, move: 1, hit: 2, death: 3 },
};

/** The fixture, with a sprite map spliced in. Never mutates the fixture. */
function withSprites(sprites: ThemeSprites): ThemeManifest {
  return { ...alternateTheme, tokens: { ...alternateTheme.tokens, sprites } };
}

/** A single entry that is deliberately wrong in exactly one way. */
function withBrokenSprite(overrides: Record<string, unknown>): ThemeManifest {
  return withSprites({
    [archetypeIds.enemy.swarmBasic]: { ...wellFormed, ...overrides },
  } as ThemeSprites);
}

describe("sprite contract", () => {
  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
    ["alternate", alternateTheme],
  ])("keeps the %s manifest valid with no sprites declared", (_name, theme) => {
    // The property the whole split depends on: a pack without art is complete,
    // not incomplete. It is what lets knight-magic ship with no roster at all.
    // The production packs declare an empty map; the fixture omits the key.
    expect(validateTheme(theme)).toEqual([]);
  });

  it("accepts a well-formed entry", () => {
    expect(validateTheme(withSprites({ [archetypeIds.enemy.swarmBasic]: wellFormed }))).toEqual([]);
  });

  it("rejects a sprite for content the theme does not define", () => {
    // A hand-typed key is the realistic way this happens, and the art is dead
    // weight if nothing ever renders it.
    const theme = withSprites({ "enemy.not_a_real_role": wellFormed } as unknown as ThemeSprites);
    expect(validateTheme(theme)).toContain("sprites.enemy.not_a_real_role has no definition in this theme");
  });

  it("rejects a duplicate texture key", () => {
    // Two entries sharing a key means the second load silently wins.
    const theme = withSprites({
      [archetypeIds.enemy.swarmBasic]: wellFormed,
      [archetypeIds.enemy.fastFragile]: { ...wellFormed, path: "sprites/alternate/other.png" },
    });
    expect(validateTheme(theme)).toContain(`duplicate sprite texture key: ${wellFormed.key}`);
  });

  it.each([
    ["an empty texture key", { key: "  " }],
    ["an absolute path", { path: "/sprites/alternate/enemy.png" }],
    ["a path that is not a sheet", { path: "sprites/alternate/enemy.webp" }],
    ["a zero frame width", { frameWidth: 0 }],
    ["a fractional frame height", { frameHeight: 31.5 }],
    ["no frames", { frames: 0 }],
  ])("rejects %s", (_name, overrides) => {
    expect(validateTheme(withBrokenSprite(overrides)).length).toBeGreaterThan(0);
  });

  it("rejects a missing state", () => {
    const theme = withBrokenSprite({ states: { idle: 0, move: 1, hit: 2 } });
    expect(validateTheme(theme)).toContain("sprites.enemy.swarm_basic is missing the death frame");
  });

  it.each([
    ["past the end of the sheet", 4],
    ["negative", -1],
    ["fractional", 1.5],
  ])("rejects a %s frame index", (_name, frame) => {
    const theme = withBrokenSprite({ states: { ...wellFormed.states, hit: frame } });
    // A state pointing outside the sheet renders as a blank quad, which reads
    // as a missing entity rather than as a broken index.
    expect(validateTheme(theme)).toContain("sprites.enemy.swarm_basic hit frame must be within [0, 4)");
  });
});

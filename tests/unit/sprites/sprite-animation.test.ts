import { describe, expect, it } from "vitest";
import {
  resolveAnimatedSpriteState,
  SPRITE_MOVE_FRAME_MS,
} from "../../../src/game/systems/sprites/sprite-animation";

describe("sprite animation state", () => {
  it("alternates idle and move for a moving actor", () => {
    const animation = { moving: true, phaseMs: 0 };
    expect(resolveAnimatedSpriteState(0, animation)).toBe("idle");
    expect(resolveAnimatedSpriteState(SPRITE_MOVE_FRAME_MS, animation)).toBe("move");
    expect(resolveAnimatedSpriteState(SPRITE_MOVE_FRAME_MS * 2, animation)).toBe("idle");
  });

  it("lets a hit frame temporarily override movement", () => {
    const animation = {
      moving: true,
      phaseMs: 0,
      transient: { state: "hit" as const, untilMs: SPRITE_MOVE_FRAME_MS * 2 },
    };
    expect(resolveAnimatedSpriteState(SPRITE_MOVE_FRAME_MS, animation)).toBe("hit");
    expect(resolveAnimatedSpriteState(SPRITE_MOVE_FRAME_MS * 2, animation)).toBe("idle");
  });

  it("keeps a non-moving actor idle", () => {
    expect(resolveAnimatedSpriteState(10_000, { moving: false, phaseMs: 0 })).toBe("idle");
  });
});

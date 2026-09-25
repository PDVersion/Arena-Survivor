import { describe, expect, it } from "vitest";
import {
  advancePlayerMovementFrame,
  resolveSpriteFlipX,
  resolveAnimatedSpriteState,
  SPRITE_MOVE_FRAME_MS,
  SPRITE_PLAYER_FRAME_DISTANCE,
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

  it("cycles by travelled distance, advances once after a long frame, and returns to idle", () => {
    let animation = advancePlayerMovementFrame({ step: 0, distance: 0 }, 1);
    expect(animation.frame).toBe(0);
    animation = advancePlayerMovementFrame(animation, SPRITE_PLAYER_FRAME_DISTANCE);
    expect(animation.frame).toBe(1);
    animation = advancePlayerMovementFrame(animation, SPRITE_PLAYER_FRAME_DISTANCE * 4);
    expect(animation.frame).toBe(2);
    expect(advancePlayerMovementFrame(animation, 0).frame).toBe(4);
  });

  it("holds the current walk pose across a zero-displacement render tick while still moving", () => {
    const started = advancePlayerMovementFrame({ step: 0, distance: 0 }, 30, true);
    const held = advancePlayerMovementFrame(started, 0, true);

    expect(held).toEqual(started);
    expect(advancePlayerMovementFrame(held, 0, false).frame).toBe(4);
  });

  it("keeps the authored left-facing pose regular and mirrors rightward motion", () => {
    expect(resolveSpriteFlipX(true, -1)).toBe(false);
    expect(resolveSpriteFlipX(false, 1)).toBe(true);
    expect(resolveSpriteFlipX(true, 0)).toBe(true);
  });
});

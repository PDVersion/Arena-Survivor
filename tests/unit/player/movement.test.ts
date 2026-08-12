import { describe, expect, it } from "vitest";
import { clampPlayerPosition, resolveMovement } from "../../../src/game/systems/player-movement";

describe("player movement", () => {
  it("resolves cardinal input at the configured speed", () => {
    expect(
      resolveMovement({ left: false, right: true, up: false, down: false }, 200),
    ).toEqual({ x: 200, y: 0 });
  });

  it("normalizes diagonal input to the configured speed", () => {
    const velocity = resolveMovement({ left: false, right: true, up: true, down: false }, 200);

    expect(Math.hypot(velocity.x, velocity.y)).toBeCloseTo(200);
    expect(velocity.x).toBeCloseTo(Math.SQRT1_2 * 200);
    expect(velocity.y).toBeCloseTo(-Math.SQRT1_2 * 200);
  });

  it("cancels opposing inputs", () => {
    expect(resolveMovement({ left: true, right: true, up: true, down: true }, 200)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("clamps the player centre inside every arena edge", () => {
    expect(clampPlayerPosition({ x: -50, y: 1900 }, 18, { width: 2400, height: 1600 })).toEqual({
      x: 18,
      y: 1582,
    });
    expect(clampPlayerPosition({ x: 2500, y: -1 }, 18, { width: 2400, height: 1600 })).toEqual({
      x: 2382,
      y: 18,
    });
  });
});

import { describe, expect, it } from "vitest";
import { canSpawn, pointOnSpawnRing } from "../../../src/game/systems/spawning";

describe("spawning rules", () => {
  it("enforces an exclusive live-entity cap", () => {
    expect(canSpawn(79, 80)).toBe(true);
    expect(canSpawn(80, 80)).toBe(false);
    expect(canSpawn(81, 80)).toBe(false);
  });

  it("places spawns on a ring and clamps them inside the arena margin", () => {
    expect(pointOnSpawnRing({ x: 100, y: 100 }, 50, 0, { width: 300, height: 200 }, 10)).toEqual({
      x: 150,
      y: 100,
    });
    expect(pointOnSpawnRing({ x: 280, y: 190 }, 50, 0, { width: 300, height: 200 }, 10)).toEqual({
      x: 290,
      y: 190,
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  selectBloodlust,
  shouldExplodeOnKill,
  shouldFracture,
  targetsWithinRadius,
} from "../../../src/game/systems/effects/on-kill-effects";

describe("on-kill interaction matrix", () => {
  it.each([
    ["direct", true, false, true],
    ["explosion", true, false, false],
    ["explosion", true, true, true],
    ["chained_explosion", true, true, true],
    ["direct", false, true, false],
  ] as const)("source %s explosion=%s chain=%s resolves %s", (source, explosion, chain, expected) => {
    expect(shouldExplodeOnKill(source, explosion, chain)).toBe(expected);
  });

  it("queries explosion targets deterministically by squared distance", () => {
    const targets = [
      { id: "a", x: 0, y: 0, active: true },
      { id: "b", x: 3, y: 4, active: true },
      { id: "c", x: 6, y: 0, active: true },
      { id: "dead", x: 0, y: 0, active: false },
    ];
    expect(targetsWithinRadius(targets, { x: 0, y: 0 }, 5).map(({ id }) => id)).toEqual(["a", "b"]);
  });

  it("resolves Fracture chance from an injected random source", () => {
    expect(shouldFracture(0.15, () => 0.149)).toBe(true);
    expect(shouldFracture(0.15, () => 0.15)).toBe(false);
  });

  it("uses only kills in the previous five simulation seconds for Bloodlust", () => {
    const result = selectBloodlust([0, 1_000, 5_001, 5_500, 9_999, 10_000], 10_000, {
      windowMs: 5_000,
      killsPerStep: 2,
      attackSpeedPerStep: 0.01,
    });
    expect(result.killTimesMs).toEqual([5_001, 5_500, 9_999, 10_000]);
    expect(result.attackSpeedBonus).toBe(0.02);
  });
});

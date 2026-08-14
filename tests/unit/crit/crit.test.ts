import { describe, expect, it } from "vitest";
import { critTierMultiplier, resolveCritTier } from "../../../src/game/core/combat/crit";

describe("overcrit tiers", () => {
  it.each([
    [0, 0, 0], [0.999, 0, 1], [1, 1, 1], [2, 2, 2], [3, 3, 3],
  ])("resolves boundary chance %s", (chance, lowTier, highTier) => {
    expect(resolveCritTier(chance, () => 0).tier).toBe(highTier);
    expect(resolveCritTier(chance, () => 0.999999).tier).toBe(lowTier);
  });

  it("resolves 247% as guaranteed tier two plus a 47% tier-three roll", () => {
    const high = resolveCritTier(2.47, () => 0.46);
    expect(high).toMatchObject({ tier: 3, guaranteedTier: 2, multiplier: 8 });
    expect(high.fractionalChance).toBeCloseTo(0.47);
    expect(resolveCritTier(2.47, () => 0.47)).toMatchObject({ tier: 2, multiplier: 4 });
  });

  it("uses the product doubling sequence without a tier cap", () => {
    expect([0, 1, 2, 3, 4].map(critTierMultiplier)).toEqual([1, 2, 4, 8, 16]);
  });
});

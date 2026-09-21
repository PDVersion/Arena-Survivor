import { describe, expect, it } from "vitest";
import {
  expectedRealDurationMs,
  resolveGameplayRate,
} from "../../../src/game/systems/time/gameplay-time";

describe("gameplay time", () => {
  it("preserves current timing at the neutral seam", () => {
    expect(resolveGameplayRate({
      baseRate: 1,
      reducedMotion: false,
      hitStopActive: false,
      deathSlowActive: false,
    })).toBe(1);
  });

  it("multiplies feedback slowdowns into the base rate", () => {
    expect(resolveGameplayRate({
      baseRate: 0.5,
      reducedMotion: false,
      hitStopActive: true,
      deathSlowActive: false,
    })).toBeCloseTo(0.04);
  });

  it("reduced motion removes feedback slowdown but not the base pace", () => {
    expect(resolveGameplayRate({
      baseRate: 0.5,
      reducedMotion: true,
      hitStopActive: true,
      deathSlowActive: true,
    })).toBe(0.5);
  });

  it("reports wall duration for a simulated run", () => {
    expect(expectedRealDurationMs(300_000, 0.5)).toBe(600_000);
  });
});

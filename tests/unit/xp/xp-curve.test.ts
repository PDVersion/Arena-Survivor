import { describe, expect, it } from "vitest";
import {
  awardExperience,
  createProgressionState,
  DEFAULT_XP_CURVE,
  xpRequiredForLevel,
  xpRequiredForLevelOn,
} from "../../../src/game/systems/xp";
import type { XpCurve } from "../../../src/game/core/archetypes/tuning";

/** The curve V0.3 Phase 3 switches the production themes to. */
const bandedCurve: XpCurve = {
  kind: "banded",
  baseXp: 4,
  bands: [
    { fromLevel: 1, growth: 1.35 },
    { fromLevel: 5, growth: 1.22 },
    { fromLevel: 12, growth: 1.16 },
    { fromLevel: 25, growth: 1.12 },
  ],
};

describe("XP curve shapes", () => {
  it("keeps the default curve linear and identical to V0.2", () => {
    expect(DEFAULT_XP_CURVE).toEqual({ kind: "linear", baseXp: 2, step: 2 });
    expect([1, 2, 3, 4, 10].map((level) => xpRequiredForLevel(level))).toEqual([2, 4, 6, 8, 20]);
  });

  it("ignores extra arguments so it stays safe to pass to map", () => {
    // A curve must never arrive as an array index.
    expect([1, 2, 3, 4].map(xpRequiredForLevel)).toEqual([2, 4, 6, 8]);
  });

  it("compounds banded growth from the unrounded requirement", () => {
    const requirements = [1, 2, 3, 4, 5, 8, 10, 12, 15, 20, 25, 30].map((level) =>
      xpRequiredForLevelOn(bandedCurve, level),
    );

    expect(requirements).toEqual([4, 5, 7, 10, 13, 24, 36, 53, 83, 175, 368, 649]);
  });

  it("applies the band that owns the level being left", () => {
    // Level 4 still uses band one's 1.35; level 5 is the first to use 1.22.
    expect(xpRequiredForLevelOn(bandedCurve, 5)).toBe(Math.round(4 * 1.35 ** 4));
    expect(xpRequiredForLevelOn(bandedCurve, 6)).toBe(Math.round(4 * 1.35 ** 4 * 1.22));
  });

  it("grows strictly and outpaces the linear curve past the early game", () => {
    let previous = 0;
    for (let level = 1; level <= 40; level += 1) {
      const requirement = xpRequiredForLevelOn(bandedCurve, level);
      expect(requirement).toBeGreaterThan(previous);
      previous = requirement;
    }
    expect(xpRequiredForLevelOn(bandedCurve, 30)).toBeGreaterThan(xpRequiredForLevel(30) * 10);
  });

  it("resolves levels through a supplied curve when awarding experience", () => {
    const state = createProgressionState(bandedCurve);
    expect(state.xpToNextLevel).toBe(4);

    const result = awardExperience(state, 9, 1, bandedCurve);
    expect(result).toMatchObject({
      levelsGained: 2,
      progression: { level: 3, xp: 0, xpToNextLevel: 7, pendingChoices: 2 },
    });
  });

  it("rejects a non-positive level on either entry point", () => {
    expect(() => xpRequiredForLevel(0)).toThrow(/positive integer/);
    expect(() => xpRequiredForLevelOn(bandedCurve, 1.5)).toThrow(/positive integer/);
  });
});

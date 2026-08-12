import { describe, expect, it } from "vitest";
import {
  awardExperience,
  claimExperiencePickup,
  consumePendingChoice,
  createProgressionState,
  xpRequiredForLevel,
} from "../../../src/game/systems/xp";

describe("experience progression", () => {
  it("uses an explicit increasing XP curve", () => {
    expect([1, 2, 3, 4].map(xpRequiredForLevel)).toEqual([2, 4, 6, 8]);
  });

  it("retains overflow and queues every level crossed by one award", () => {
    const result = awardExperience(createProgressionState(), 10);

    expect(result).toEqual({
      awardedXp: 10,
      levelsGained: 2,
      progression: { level: 3, xp: 4, xpToNextLevel: 6, pendingChoices: 2 },
    });
    expect(consumePendingChoice(result.progression).pendingChoices).toBe(1);
  });

  it("preserves fractional bonus XP before resolving levels", () => {
    expect(awardExperience(createProgressionState(), 2, 1.5)).toMatchObject({
      awardedXp: 3,
      levelsGained: 1,
      progression: { level: 2, xp: 1 },
    });
    expect(awardExperience(createProgressionState(), 1, 1.5)).toMatchObject({
      awardedXp: 1.5,
      progression: { level: 1, xp: 1.5 },
    });
  });

  it("awards each stable pickup identity at most once", () => {
    const first = claimExperiencePickup(new Set(), "pickup-1", 4);
    const duplicate = claimExperiencePickup(first.claimedPickupIds, "pickup-1", 4);

    expect(first).toMatchObject({ claimed: true, awardedXp: 4 });
    expect(duplicate).toMatchObject({ claimed: false, awardedXp: 0 });
    expect(duplicate.claimedPickupIds).toBe(first.claimedPickupIds);
  });
});

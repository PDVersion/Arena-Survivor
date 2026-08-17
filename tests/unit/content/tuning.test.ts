import { describe, expect, it } from "vitest";
import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { validateTheme } from "../../../src/game/content/define-theme";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { alternateTheme } from "../../fixtures/alternate-theme";
import { DEFAULT_DIFFICULTY_TUNING } from "../../../src/game/systems/chaos/world-modifiers";

function withTuning(tuning: unknown): ThemeManifest {
  return { ...alternateTheme, tuning } as unknown as ThemeManifest;
}

describe("theme tuning packs", () => {
  it.each(themeRegistry.map((entry) => [entry.key, entry.theme] as const))(
    "requires a complete tuning pack on the %s production theme",
    (_key, theme) => {
      expect(validateTheme(theme)).toEqual([]);
      expect(theme.tuning.progression.xpCurve.baseXp).toBeGreaterThan(0);
      expect(theme.tuning.director.spawnIntervalMs).toBeGreaterThan(0);
      expect(theme.tuning.director.spawnRadius).toBeGreaterThan(0);
    },
  );

  it("keeps every production Chaos pack aligned with the V0.2 baseline for now", () => {
    for (const entry of themeRegistry) {
      expect(entry.theme.tuning.difficulty.chaos).toEqual(DEFAULT_DIFFICULTY_TUNING.chaos);
    }
  });

  it("reports a missing tuning pack", () => {
    expect(validateTheme(withTuning(undefined))).toContain("tuning pack is required");
  });

  it("rejects a non-positive cadence, radius, or base requirement", () => {
    const issues = validateTheme(
      withTuning({
        progression: { xpCurve: { kind: "linear", baseXp: 0, step: 2 }, toughnessRewardShare: 0 },
        director: { spawnIntervalMs: 0, spawnRadius: -1 },
        difficulty: { chaos: DEFAULT_DIFFICULTY_TUNING.chaos },
      }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        "tuning.progression.xpCurve baseXp must be greater than zero",
        "tuning.director.spawnIntervalMs must be greater than zero",
        "tuning.director.spawnRadius must be greater than zero",
      ]),
    );
  });

  it("rejects banded curves that are unordered, empty, or shrinking", () => {
    const unordered = validateTheme(
      withTuning({
        progression: {
          xpCurve: {
            kind: "banded",
            baseXp: 4,
            bands: [
              { fromLevel: 1, growth: 1.3 },
              { fromLevel: 1, growth: 0.9 },
            ],
          },
          toughnessRewardShare: 0,
        },
        director: { spawnIntervalMs: 400, spawnRadius: 360 },
        difficulty: { chaos: DEFAULT_DIFFICULTY_TUNING.chaos },
      }),
    );

    expect(unordered).toEqual(
      expect.arrayContaining([
        "tuning.progression.xpCurve bands must ascend by fromLevel",
        "tuning.progression.xpCurve band growth cannot shrink a requirement",
      ]),
    );

    const empty = validateTheme(
      withTuning({
        progression: { xpCurve: { kind: "banded", baseXp: 4, bands: [] }, toughnessRewardShare: 0 },
        director: { spawnIntervalMs: 400, spawnRadius: 360 },
        difficulty: { chaos: DEFAULT_DIFFICULTY_TUNING.chaos },
      }),
    );
    expect(empty).toEqual(
      expect.arrayContaining([
        "tuning.progression.xpCurve must declare at least one band",
        "tuning.progression.xpCurve must declare a band starting at level 1",
      ]),
    );
  });

  it("rejects negative Chaos coefficients and an impossible elite cap", () => {
    const issues = validateTheme(
      withTuning({
        progression: { xpCurve: { kind: "linear", baseXp: 2, step: 2 }, toughnessRewardShare: -1 },
        director: { spawnIntervalMs: 400, spawnRadius: 360 },
        difficulty: {
          chaos: { ...DEFAULT_DIFFICULTY_TUNING.chaos, xpPerPoint: -0.5, eliteChanceCap: 2 },
        },
      }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        "tuning.progression.toughnessRewardShare cannot be negative",
        "tuning.difficulty.chaos.xpPerPoint cannot be negative",
        "tuning.difficulty.chaos.eliteChanceCap cannot exceed one",
      ]),
    );
  });
});

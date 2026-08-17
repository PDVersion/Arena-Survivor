import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { validateTheme } from "../../../src/game/content/define-theme";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { alternateTheme } from "../../fixtures/alternate-theme";
import { DEFAULT_DIFFICULTY_TUNING } from "../../../src/game/systems/chaos/world-modifiers";

const validDirector = alternateTheme.tuning.director;

function withTuning(tuning: unknown): ThemeManifest {
  return { ...alternateTheme, tuning } as unknown as ThemeManifest;
}

describe("theme tuning packs", () => {
  it.each(themeRegistry.map((entry) => [entry.key, entry.theme] as const))(
    "requires a complete tuning pack on the %s production theme",
    (_key, theme) => {
      expect(validateTheme(theme)).toEqual([]);
      expect(theme.tuning.progression.xpCurve.baseXp).toBeGreaterThan(0);
      expect(theme.tuning.director.baseIntervalMs).toBeGreaterThan(0);
      expect(theme.tuning.director.roles.some((role) => role.unlockAt === 0)).toBe(true);
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
        director: { ...validDirector, baseIntervalMs: 0, minIntervalMs: 0 },
        difficulty: { chaos: DEFAULT_DIFFICULTY_TUNING.chaos },
      }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        "tuning.progression.xpCurve baseXp must be greater than zero",
        "tuning.director.baseIntervalMs must be greater than zero",
        "tuning.director.minIntervalMs must be greater than zero",
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
        director: validDirector,
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
        director: validDirector,
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
        director: validDirector,
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

describe("wave movement validation", () => {
  it("rejects an unsupported movement", () => {
    const roles = validDirector.roles.map((role, index) =>
      index === 0 ? { ...role, waveMovement: "seek" } : role,
    );
    const issues = validateTheme(
      withTuning({ ...alternateTheme.tuning, director: { ...validDirector, roles } }),
    );
    expect(issues.some((issue) => issue.includes("waveMovement must be chase or drift"))).toBe(true);
  });

  it("rejects a chasing wave the player cannot outrun", () => {
    // The fast role outruns the player, so declaring its wave as a chase is a
    // guaranteed death sentence with the starter weapon.
    const roles = validDirector.roles.map((role) =>
      role.enemyId === archetypeIds.enemy.fastFragile
        ? { ...role, waveMovement: "chase" }
        : role,
    );
    const issues = validateTheme(
      withTuning({ ...alternateTheme.tuning, director: { ...validDirector, roles } }),
    );
    expect(issues).toContain(
      `${archetypeIds.enemy.fastFragile} outruns the player, so its wave must drift`,
    );
  });
});

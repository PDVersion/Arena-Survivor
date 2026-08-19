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
    // No production role outruns the player any more (REC-066), so the theme is
    // deliberately pushed back into the state the rule exists to catch: a role
    // raised above the player while still declaring a chasing wave, which with
    // the starter weapon is a guaranteed death sentence.
    const playerSpeed = alternateTheme.characters[0]!.baseStats.moveSpeed;
    const enemies = alternateTheme.enemies.map((enemy) =>
      enemy.id === archetypeIds.enemy.fastFragile
        ? { ...enemy, moveSpeed: playerSpeed + 40 }
        : enemy,
    );
    const roles = validDirector.roles.map((role) =>
      role.enemyId === archetypeIds.enemy.fastFragile
        ? { ...role, waveMovement: "chase" }
        : role,
    );
    const issues = validateTheme({
      ...alternateTheme,
      enemies,
      tuning: { ...alternateTheme.tuning, director: { ...validDirector, roles } },
    } as unknown as ThemeManifest);

    expect(issues).toContain(
      `${archetypeIds.enemy.fastFragile} outruns the player, so its wave must drift`,
    );
  });

  it("accepts the shipped fast role, which stays just below the player", () => {
    // The rule is a safety net now rather than a live constraint: nothing in
    // either production pack triggers it.
    for (const entry of themeRegistry) {
      const playerSpeed = entry.theme.characters[0]!.baseStats.moveSpeed;
      for (const enemy of entry.theme.enemies) {
        expect(enemy.moveSpeed).toBeLessThan(playerSpeed);
      }
    }
  });
});

describe("weapon stats", () => {
  it.each(themeRegistry.map((entry) => [entry.key, entry.theme] as const))(
    "gives every %s weapon the generic stat surface",
    (_key, theme) => {
      for (const weapon of theme.weapons) {
        expect(weapon.range).toBeGreaterThan(0);
        expect(weapon.knockback).toBeGreaterThanOrEqual(0);
        expect(weapon.armourPierce).toBeGreaterThanOrEqual(0);
        expect(weapon.armourPierce).toBeLessThanOrEqual(1);
      }
    },
  );

  it("requires delivery to cover the declared range", () => {
    const weapon = alternateTheme.weapons[0]!;
    const unreachable = {
      ...alternateTheme,
      // Range far beyond what the projectile can physically fly.
      weapons: [{ ...weapon, range: weapon.projectileSpeed * 100 }],
    } as unknown as ThemeManifest;

    expect(validateTheme(unreachable)).toContain(
      `${weapon.id} projectile flight cannot reach its declared range`,
    );
  });

  it("rejects out-of-range generic stats", () => {
    const weapon = alternateTheme.weapons[0]!;
    const invalid = {
      ...alternateTheme,
      weapons: [{ ...weapon, range: 0, knockback: -1, armourPierce: 2, critDamage: 0.5 }],
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        `${weapon.id} range must be greater than zero`,
        `${weapon.id} knockback cannot be negative`,
        `${weapon.id} armourPierce must be between zero and one`,
        `${weapon.id} critDamage must be at least one`,
      ]),
    );
  });

  it("leaves crit overrides unset so weapons inherit the player's stats", () => {
    for (const entry of themeRegistry) {
      for (const weapon of entry.theme.weapons) {
        expect(weapon.critChance).toBeUndefined();
        expect(weapon.critDamage).toBeUndefined();
      }
    }
  });
});

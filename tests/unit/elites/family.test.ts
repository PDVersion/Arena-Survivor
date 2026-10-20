import { describe, expect, it, vi } from "vitest";
import { eliteIds } from "../../../src/game/core/archetypes/categories";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { eliteIncomingDamage, eliteSpeedMultiplier, eliteSplitCount, selectElite } from "../../../src/game/systems/elites/elites";

for (const theme of [ecoGuardianTheme, knightMagicTheme]) describe(`${theme.id} elite family`, () => {
  const split = theme.elites.find((e) => e.id === eliteIds.split)!;
  const shield = theme.elites.find((e) => e.id === eliteIds.shield)!;
  const acceleration = theme.elites.find((e) => e.id === eliteIds.acceleration)!;
  it("selects all four identities on deterministic bands only after an elite roll", () => {
    for (let i = 0; i < theme.elites.length; i++) {
      const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce((i + 0.5) / theme.elites.length);
      expect(selectElite(theme.elites, 1, random)).toBe(theme.elites[i]);
      expect(random).toHaveBeenCalledTimes(2);
    }
    const random = vi.fn(() => 0.8);
    expect(selectElite(theme.elites, 0.8, random)).toBeUndefined();
    expect(random).toHaveBeenCalledTimes(1);
  });
  it("inherits every actual variant and explicit non-elite without consuming randomness", () => {
    const random = vi.fn(() => 0);
    for (const elite of theme.elites) expect(selectElite(theme.elites, 0, random, elite.id)).toBe(elite);
    expect(selectElite(theme.elites, 1, random, false)).toBeUndefined();
    expect(selectElite(theme.elites, 0, random, true)?.id).toBe(eliteIds.baseline);
    expect(random).not.toHaveBeenCalled();
  });
  it("bounds split work to two one-generation children without losing variant identity", () => {
    expect(eliteSplitCount(split, 0)).toBe(2);
    expect(eliteSplitCount(split, 1)).toBe(0);
    expect(eliteSplitCount(split, 2)).toBe(0);
    expect(eliteSplitCount(shield, 0)).toBe(0);
    expect(split.split!.childCount * split.split!.rewardMultiplier).toBe(1);
  });
  it("breaks shields at the exact threshold without immunity or rounding", () => {
    expect(eliteIncomingDamage(shield, 51, 100, 3.75)).toBe(1.875);
    expect(eliteIncomingDamage(shield, 50, 100, 3.75)).toBe(3.75);
    expect(eliteIncomingDamage(shield, 1, 100, 100)).toBe(100);
    expect(eliteIncomingDamage(undefined, 100, 100, -5)).toBe(0);
  });
  it("ramps and clamps at simulation age, retaining stationary role zero speed", () => {
    expect(eliteSpeedMultiplier(acceleration, -1)).toBe(1);
    expect(eliteSpeedMultiplier(acceleration, 0)).toBe(1);
    expect(eliteSpeedMultiplier(acceleration, 1500)).toBe(1.25);
    expect(eliteSpeedMultiplier(acceleration, 3000)).toBe(1.5);
    expect(eliteSpeedMultiplier(acceleration, 9000)).toBe(1.5);
    expect(eliteSpeedMultiplier(split, 3000)).toBe(1);
    expect(0 * eliteSpeedMultiplier(acceleration, 3000)).toBe(0);
  });
  it("rejects unbounded recursion, immunity and nonfinite acceleration", () => {
    const issues = validateTheme({ ...theme, elites: [theme.elites[0]!,
      { ...split, split: { ...split.split!, maxDepth: 2 } },
      { ...shield, shield: { ...shield.shield!, damageMultiplier: 0 } },
      { ...acceleration, acceleration: { ...acceleration.acceleration!, durationMs: Infinity } },
    ] });
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining("split must have bounded"), expect.stringContaining("shield must have finite"), expect.stringContaining("acceleration must have a finite"),
    ]));
  });
});

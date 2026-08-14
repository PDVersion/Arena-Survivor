import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { createRunState } from "../../../src/game/state/run-state";
import { formatRunTime, selectHudValues, selectRunSummaryValues } from "../../../src/game/state/statistics";

const character = knightMagicTheme.characters[0];
if (!character) throw new Error("Missing starter character");

describe("run statistics presentation", () => {
  it("formats remaining time with ceiling semantics and no negatives", () => {
    expect(formatRunTime(300_000)).toBe("5:00");
    expect(formatRunTime(60_001)).toBe("1:01");
    expect(formatRunTime(999)).toBe("0:01");
    expect(formatRunTime(-1)).toBe("0:00");
  });

  it("selects complete serializable HUD values from run state", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId: character.id,
      baseStats: character.baseStats,
      durationMs: 5_000,
    });

    expect(selectHudValues(run)).toEqual({
      health: "100 / 100",
      experience: "0 / 2",
      level: "1",
      time: "0:05",
      kills: "0",
      enemies: "0",
    });
  });

  it("formats a terminal ledger entirely with theme-owned vocabulary", () => {
    const run = createRunState({
      themeId: knightMagicTheme.id,
      characterId: character.id,
      baseStats: character.baseStats,
    });
    const summary = selectRunSummaryValues(run, knightMagicTheme.copy.vocabulary);
    expect(summary.title).toBe("Trial Record");
    expect(summary.metrics).toContain("Peak Foes: 0");
    expect(summary.damage).toContain("Total Damage: 0");
  });
});

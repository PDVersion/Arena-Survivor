import { beforeEach, describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import {
  createSessionStatistics,
  foldRun,
  getSessionStatistics,
  recordFinishedRun,
  resetSessionStatistics,
  type RunContribution,
} from "../../../src/game/state/session-statistics";

function run(
  level: number,
  kills: number,
  totalDamage: number,
  upgradeCounts: Record<string, number> = {},
): RunContribution {
  return { level, statistics: { kills, totalDamage, upgradeCounts } };
}

describe("session statistics", () => {
  beforeEach(() => {
    resetSessionStatistics();
  });

  it("starts empty", () => {
    const session = createSessionStatistics();
    expect(session).toMatchObject({
      runsPlayed: 0,
      totalKills: 0,
      totalDamage: 0,
      bestLevel: 0,
      bestKills: 0,
      bestDamage: 0,
    });
    expect(session.upgrades).toEqual({});
  });

  it("accumulates totals and keeps bests across runs", () => {
    let session = createSessionStatistics();
    session = foldRun(session, run(24, 800, 12_000));
    session = foldRun(session, run(19, 950, 9_000));

    expect(session).toMatchObject({
      runsPlayed: 2,
      totalKills: 1750,
      totalDamage: 21_000,
      // Bests are per run, so the higher of each rather than the last run's.
      bestLevel: 24,
      bestKills: 950,
      bestDamage: 12_000,
    });
  });

  it("separates an upgrade's session total from its best single run", () => {
    let session = createSessionStatistics();
    session = foldRun(session, run(10, 0, 0, { [archetypeIds.upgrade.damage]: 5 }));
    session = foldRun(session, run(10, 0, 0, { [archetypeIds.upgrade.damage]: 3 }));

    expect(session.upgrades[archetypeIds.upgrade.damage]).toEqual({ total: 8, bestInRun: 5 });
  });

  it("records an upgrade first seen in a later run", () => {
    let session = createSessionStatistics();
    session = foldRun(session, run(10, 0, 0, { [archetypeIds.upgrade.damage]: 2 }));
    session = foldRun(session, run(10, 0, 0, { [archetypeIds.upgrade.luck]: 4 }));

    expect(session.upgrades[archetypeIds.upgrade.damage]).toEqual({ total: 2, bestInRun: 2 });
    expect(session.upgrades[archetypeIds.upgrade.luck]).toEqual({ total: 4, bestInRun: 4 });
  });

  it("counts a live run's totals without counting it as played", () => {
    recordFinishedRun(run(12, 100, 500, { [archetypeIds.upgrade.damage]: 2 }));
    const live = getSessionStatistics(run(30, 400, 9_000, { [archetypeIds.upgrade.damage]: 6 }));

    // The player has taken eight, so eight is what the Field Guide must show...
    expect(live.upgrades[archetypeIds.upgrade.damage]?.total).toBe(8);
    expect(live.totalDamage).toBe(9_500);
    // ...and a record it has already beaten shows immediately, because `Math.max`
    // makes merging the same live run on every read idempotent.
    expect(live.bestLevel).toBe(30);
    expect(live.bestKills).toBe(400);
    // Only the run count waits: a run being played has not been played yet.
    expect(live.runsPlayed).toBe(1);
  });

  it("keeps merging the same live run idempotent", () => {
    recordFinishedRun(run(12, 100, 500, { [archetypeIds.upgrade.damage]: 2 }));
    const live = run(30, 400, 9_000, { [archetypeIds.upgrade.damage]: 6 });

    expect(getSessionStatistics(live)).toEqual(getSessionStatistics(live));
  });

  it("does not double-count a run that has been recorded", () => {
    recordFinishedRun(run(12, 100, 500, { [archetypeIds.upgrade.damage]: 2 }));
    const stored = getSessionStatistics();

    expect(stored.totalKills).toBe(100);
    expect(stored.upgrades[archetypeIds.upgrade.damage]).toEqual({ total: 2, bestInRun: 2 });
    // Reading it again must not fold anything a second time.
    expect(getSessionStatistics()).toEqual(stored);
  });

  it("leaves the stored session untouched when a live run is merged", () => {
    recordFinishedRun(run(12, 100, 500));
    const before = getSessionStatistics();
    getSessionStatistics(run(30, 400, 9_000));

    expect(getSessionStatistics()).toEqual(before);
  });

  it("survives a restart, which is what a session is", () => {
    recordFinishedRun(run(12, 100, 500));
    recordFinishedRun(run(20, 300, 2_000));

    expect(getSessionStatistics().runsPlayed).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import {
  KILL_CHAIN_WINDOW_MS,
  createRunStatistics,
  observeChaos,
  observeCrit,
  observeLiveEnemies,
  observePierceChain,
  recordCommittedDamage,
  recordCommittedKill,
  sumDamageBreakdown,
} from "../../../src/game/systems/statistics/run-statistics";

describe("authoritative run statistics", () => {
  it("tracks high-water values from committed state", () => {
    let statistics = createRunStatistics(0.05);
    statistics = observeLiveEnemies(statistics, 300);
    statistics = observeLiveEnemies(statistics, 12);
    statistics = observeChaos(statistics, 4.2);
    statistics = observeCrit(statistics, 3.47, 4);
    statistics = observePierceChain(statistics, 13);

    expect(statistics).toMatchObject({
      liveEnemies: 12,
      peakEnemiesAlive: 300,
      highestChaos: 4.2,
      highestCritChance: 3.47,
      highestCritTier: 4,
      longestPierceChain: 13,
    });
  });

  it("uses one central five-second committed kill-chain window", () => {
    let statistics = createRunStatistics();
    for (const time of [0, 1, 4_999, KILL_CHAIN_WINDOW_MS]) {
      statistics = recordCommittedKill(statistics, time);
    }
    expect(statistics.kills).toBe(4);
    expect(statistics.largestKillChain).toBe(3);
    expect(statistics.recentKillTimesMs).toEqual([1, 4_999, 5_000]);
  });

  it("reconciles overkill-adjusted damage exactly across stable categories", () => {
    let statistics = createRunStatistics();
    statistics = recordCommittedDamage(statistics, {
      amount: 25,
      source: "direct",
      directBase: 10,
      criticalBonus: 10,
      piercingMomentum: 10,
    });
    statistics = recordCommittedDamage(statistics, { amount: 7, source: "explosion" });
    statistics = recordCommittedDamage(statistics, { amount: 3, source: "chained_explosion" });
    statistics = recordCommittedDamage(statistics, { amount: 5, source: "direct" });

    expect(statistics.damageBreakdown).toEqual({
      direct: 10,
      criticalBonus: 10,
      piercingMomentum: 5,
      explosion: 7,
      chainedExplosion: 3,
      remainder: 5,
    });
    expect(sumDamageBreakdown(statistics.damageBreakdown)).toBe(statistics.totalDamage);
    expect(statistics.totalDamage).toBe(40);
  });
});

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

describe("kill-window compaction regression", () => {
  function previous(statistics: ReturnType<typeof createRunStatistics>, nowMs: number) {
    const retained = statistics.recentKillTimesMs.filter((time) => time > nowMs - KILL_CHAIN_WINDOW_MS && time <= nowMs);
    const recentKillTimesMs = Object.freeze([...retained, nowMs]);
    return { ...statistics, kills: statistics.kills + 1,
      largestKillChain: Math.max(statistics.largestKillChain, recentKillTimesMs.length), recentKillTimesMs };
  }

  it("preserves order, equal times, expiry boundaries and future exclusion without mutating snapshots", () => {
    const input = { ...createRunStatistics(), largestKillChain: 20,
      recentKillTimesMs: Object.freeze([5001, 0, 10000, 5000, 5001, 10001, -1, 9999]) };
    const snapshot = structuredClone(input);
    const next = recordCommittedKill(input, 10000);
    expect(next).toEqual(previous(input, 10000));
    expect(next.recentKillTimesMs).toEqual([5001, 10000, 5001, 9999, 10000]);
    expect(input).toEqual(snapshot);
    expect(next.recentKillTimesMs).not.toBe(input.recentKillTimesMs);
    expect(Object.isFrozen(next.recentKillTimesMs)).toBe(true);
    expect(next.damageBreakdown).toBe(input.damageBreakdown);
    expect(next.upgradeCounts).toBe(input.upgradeCounts);
  });

  it("matches the previous rules across dense bursts, quiet gaps and backwards clock inputs", () => {
    let actual = createRunStatistics();
    let expected = createRunStatistics();
    let seed = 27;
    for (let index = 0; index < 3000; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const now = index < 1000 ? 100 : index < 2000 ? 5100 : 5000 + seed % 10000;
      const prior = actual;
      const priorTimes = [...prior.recentKillTimesMs];
      actual = recordCommittedKill(actual, now);
      expected = previous(expected, now);
      expect(actual).toEqual(expected);
      expect(prior.recentKillTimesMs).toEqual(priorTimes);
    }
  });
});

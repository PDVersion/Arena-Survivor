import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import {
  selectSessionCodex,
  selectShrineCodex,
  selectUpgradeCodex,
} from "../../../src/game/systems/codex/describe-shrine";
import {
  createSessionStatistics,
  foldRun,
} from "../../../src/game/state/session-statistics";

describe("shrine codex", () => {
  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("covers every %s shrine with themed identity", (_name, theme) => {
    const entries = selectShrineCodex(theme);

    expect(entries).toHaveLength(theme.shrines.length);
    for (const entry of entries) {
      const copy = theme.copy.content[entry.id];
      expect(entry.name).toBe(copy.name);
      expect(entry.description).toBe(copy.description);
      // An entry that says nothing about what it does is the defect this fixes.
      expect(entry.effects.length).toBeGreaterThan(0);
      for (const effect of entry.effects) {
        expect(effect.label.trim()).not.toBe("");
        expect(effect.display.trim()).not.toBe("");
      }
    }
  });

  it("reads every number from the definition the run resolves", () => {
    const greed = ecoGuardianTheme.shrines.find(
      (shrine) => shrine.id === archetypeIds.shrine.greed,
    )!;
    const entry = selectShrineCodex(ecoGuardianTheme).find(
      (candidate) => candidate.id === archetypeIds.shrine.greed,
    )!;

    expect(entry.effects).toEqual([
      { label: ecoGuardianTheme.copy.world.chaos, display: `+${greed.chaosIncrease}` },
      { label: ecoGuardianTheme.copy.world.enemySpawn, display: `×${greed.enemySpawnMultiplier}` },
      { label: ecoGuardianTheme.copy.world.xpGain, display: `×${greed.xpMultiplier}` },
    ]);
  });

  it("states the surge shrine's count and duration", () => {
    const surge = ecoGuardianTheme.shrines.find(
      (shrine) => shrine.id === archetypeIds.shrine.spawnSurge,
    )!;
    const entry = selectShrineCodex(ecoGuardianTheme).find(
      (candidate) => candidate.id === archetypeIds.shrine.spawnSurge,
    )!;

    expect(entry.effects).toContainEqual({
      label: ecoGuardianTheme.copy.codex.released,
      display: `${surge.spawnCount} over ${surge.spawnDurationMs / 1000}s`,
    });
    expect(entry.effects).toContainEqual({
      label: ecoGuardianTheme.copy.codex.reward,
      display: `×${surge.rewardMultiplier}`,
    });
  });

  it("names duplication rather than leaving it as an unexplained cost", () => {
    const entry = selectShrineCodex(ecoGuardianTheme).find(
      (candidate) => candidate.id === archetypeIds.shrine.duplication,
    )!;

    expect(entry.effects).toContainEqual({
      label: ecoGuardianTheme.copy.codex.duplicates,
      display: ecoGuardianTheme.copy.codex.duplicatesValue,
    });
  });

  it("omits effects a shrine does not have", () => {
    const entry = selectShrineCodex(ecoGuardianTheme).find(
      (candidate) => candidate.id === archetypeIds.shrine.greed,
    )!;

    // Greed changes no reward multiplier and releases nothing, so neither line
    // may appear claiming a 1x no-op.
    expect(entry.effects.map((effect) => effect.label)).not.toContain(
      ecoGuardianTheme.copy.codex.reward,
    );
    expect(entry.effects.map((effect) => effect.label)).not.toContain(
      ecoGuardianTheme.copy.codex.released,
    );
  });
});

describe("upgrade codex", () => {
  const empty = createSessionStatistics();

  it.each([
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ])("lists the whole %s pool, taken or not", (_name, theme) => {
    const entries = selectUpgradeCodex(theme, empty);

    // Every upgrade, not only the ones with a count: a zero says the upgrade
    // exists and how far it can be pushed, which is the reference value.
    expect(entries.map((entry) => entry.id)).toEqual(theme.upgrades.map((upgrade) => upgrade.id));
    for (const entry of entries) {
      expect(entry.name).toBe(theme.copy.content[entry.id].name);
      expect(entry.sessionTotal).toBe(0);
      expect(entry.bestInRun).toBe(0);
      expect(entry.maxPerRun).toBeGreaterThan(0);
    }
  });

  it("reads the per-run cap from the definition rather than restating it", () => {
    const entries = selectUpgradeCodex(ecoGuardianTheme, empty);
    for (const upgrade of ecoGuardianTheme.upgrades) {
      const entry = entries.find((candidate) => candidate.id === upgrade.id)!;
      expect(entry.maxPerRun).toBe(upgrade.maxLevel);
    }
  });

  it("reports session totals separately from the best single run", () => {
    let session = createSessionStatistics();
    session = foldRun(session, {
      level: 20,
      statistics: { kills: 0, totalDamage: 0, upgradeCounts: { [archetypeIds.upgrade.damage]: 5 } },
    });
    session = foldRun(session, {
      level: 20,
      statistics: { kills: 0, totalDamage: 0, upgradeCounts: { [archetypeIds.upgrade.damage]: 2 } },
    });

    const entry = selectUpgradeCodex(ecoGuardianTheme, session).find(
      (candidate) => candidate.id === archetypeIds.upgrade.damage,
    )!;
    expect(entry).toMatchObject({ sessionTotal: 7, bestInRun: 5 });
  });

  it("never claims more taken in one run than the run allows", () => {
    let session = createSessionStatistics();
    for (const upgrade of ecoGuardianTheme.upgrades) {
      session = foldRun(session, {
        level: 30,
        statistics: { kills: 0, totalDamage: 0, upgradeCounts: { [upgrade.id]: upgrade.maxLevel } },
      });
    }
    for (const entry of selectUpgradeCodex(ecoGuardianTheme, session)) {
      expect(entry.bestInRun).toBeLessThanOrEqual(entry.maxPerRun);
    }
  });
});

describe("session codex", () => {
  it("states the session totals in themed labels", () => {
    const session = foldRun(createSessionStatistics(), {
      level: 27,
      statistics: { kills: 812, totalDamage: 15_400, upgradeCounts: {} },
    });
    const lines = selectSessionCodex(ecoGuardianTheme, session);

    expect(lines.map((line) => line.display)).toEqual(["1", "812", "15400", "27", "812", "15400"]);
    for (const line of lines) expect(line.label.trim()).not.toBe("");
  });

  it("rounds a fractional damage total rather than printing its full float", () => {
    const session = foldRun(createSessionStatistics(), {
      level: 3,
      statistics: { kills: 4, totalDamage: 123.456, upgradeCounts: {} },
    });

    expect(selectSessionCodex(ecoGuardianTheme, session)[2]?.display).toBe("123.5");
  });
});

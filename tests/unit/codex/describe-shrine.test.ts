import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { selectShrineCodex } from "../../../src/game/systems/codex/describe-shrine";

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

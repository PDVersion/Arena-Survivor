import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { applyRunUpgrade, createRunState, type RunState } from "../../../src/game/state/run-state";
import { selectRunSummaryValues, selectUpgradeTally } from "../../../src/game/state/statistics";
import { awardExperience } from "../../../src/game/systems/xp";

const character = ecoGuardianTheme.characters[0];
if (!character) throw new Error("Missing starter character");

function startRun(): RunState {
  return createRunState({
    themeId: ecoGuardianTheme.id,
    characterId: character.id,
    baseStats: character.baseStats,
    xpCurve: ecoGuardianTheme.tuning.progression.xpCurve,
  });
}

/** Put the run into `level_up` with `count` pending choices. */
function withPendingChoices(state: RunState, count: number): RunState {
  let progression = state.progression;
  for (let index = 0; index < count; index += 1) {
    progression = awardExperience(
      progression,
      progression.xpToNextLevel,
      1,
      state.xpCurve,
    ).progression;
  }
  return { ...state, status: "level_up", progression };
}

function upgrade(id: (typeof archetypeIds.upgrade)[keyof typeof archetypeIds.upgrade]) {
  const definition = ecoGuardianTheme.upgrades.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Missing upgrade ${id}`);
  return definition;
}

describe("upgrade tally", () => {
  it("starts empty and counts every selection", () => {
    let run = withPendingChoices(startRun(), 4);
    expect(run.statistics.upgradeCounts).toEqual({});

    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.pierce));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));

    expect(run.statistics.upgradeCounts).toEqual({
      [archetypeIds.upgrade.damage]: 3,
      [archetypeIds.upgrade.pierce]: 1,
    });
  });

  it("never disagrees with the selected id list", () => {
    let run = withPendingChoices(startRun(), 5);
    for (const id of [
      archetypeIds.upgrade.damage,
      archetypeIds.upgrade.pierce,
      archetypeIds.upgrade.damage,
      archetypeIds.upgrade.moveSpeed,
      archetypeIds.upgrade.pierce,
    ]) {
      run = applyRunUpgrade(run, upgrade(id));
    }

    const totalCounted = Object.values(run.statistics.upgradeCounts).reduce(
      (total, count) => total + (count ?? 0),
      0,
    );
    expect(totalCounted).toBe(run.selectedUpgradeIds.length);
    for (const id of new Set(run.selectedUpgradeIds)) {
      expect(run.statistics.upgradeCounts[id]).toBe(
        run.selectedUpgradeIds.filter((entry) => entry === id).length,
      );
    }
  });

  it("renders theme names ordered by count then first selection", () => {
    let run = withPendingChoices(startRun(), 4);
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.pierce));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.moveSpeed));

    expect(selectUpgradeTally(run, ecoGuardianTheme.copy.content)).toEqual([
      "Reinforced Tools ×2",
      "Deep Reach ×1",
      "Field Boots ×1",
    ]);
  });

  it("falls back to the stable id when copy is missing rather than dropping a row", () => {
    let run = withPendingChoices(startRun(), 1);
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));

    expect(selectUpgradeTally(run, {} as never)).toEqual([`${archetypeIds.upgrade.damage} ×1`]);
  });

  it("exposes the tally through the terminal summary with theme vocabulary", () => {
    let run = withPendingChoices(startRun(), 1);
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.critChance));

    const summary = selectRunSummaryValues(
      run,
      ecoGuardianTheme.copy.vocabulary,
      ecoGuardianTheme.copy.content,
    );
    expect(summary.upgradesTitle).toBe("Equipment Requisitioned");
    expect(summary.upgrades).toEqual(["Precision Sort ×1"]);
  });

  it("stays serializable and survives a JSON round trip", () => {
    let run = withPendingChoices(startRun(), 2);
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));
    run = applyRunUpgrade(run, upgrade(archetypeIds.upgrade.damage));

    expect(JSON.parse(JSON.stringify(run))).toEqual(run);
  });
});

describe("per-role reward scaling", () => {
  it("pays more for durable and death-spawning roles", () => {
    const byId = new Map(ecoGuardianTheme.enemies.map((enemy) => [enemy.id, enemy]));
    const bottle = byId.get(archetypeIds.enemy.swarmBasic)!;
    const bag = byId.get(archetypeIds.enemy.fastFragile)!;
    const glass = byId.get(archetypeIds.enemy.slowDurable)!;
    const bagged = byId.get(archetypeIds.enemy.deathSpawner)!;

    expect(bottle.xpReward).toBe(1);
    expect(bag.xpReward).toBeGreaterThan(bottle.xpReward);
    expect(glass.xpReward).toBeGreaterThan(bag.xpReward);
    expect(bagged.xpReward).toBeGreaterThan(bag.xpReward);
  });

  it("pays offspring a share of their own role rather than the parent's", () => {
    const bagged = ecoGuardianTheme.enemies.find(
      (enemy) => enemy.id === archetypeIds.enemy.deathSpawner,
    );
    const child = ecoGuardianTheme.enemies.find(
      (enemy) => enemy.id === bagged?.deathSpawn?.enemyId,
    );

    // The burst is part of the package, but a child must never be worth more
    // than its own role or a spawner becomes an experience pump.
    const childReward = child!.xpReward * bagged!.deathSpawn!.rewardMultiplier;
    expect(childReward).toBeGreaterThan(0);
    expect(childReward).toBeLessThan(child!.xpReward);
  });

  it("declares a toughness share so late spawns pay more", () => {
    expect(ecoGuardianTheme.tuning.progression.toughnessRewardShare).toBeGreaterThan(0);
  });
});

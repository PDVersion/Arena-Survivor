import { describe, expect, it } from "vitest";
import {
  completeCollectionSweepAttack,
  createCollectionSweepProgress,
  selectCollectionSweepHits,
  type CollectionSweepProgress,
} from "../../../src/game/systems/weapons/collection-sweep";

const effect = {
  kind: "collection_sweep" as const,
  triggerEvery: [8, 6, 4, 4] as const,
  radius: 34,
  damageMultiplier: 0.75,
  levelFiveInterval: { min: 2, max: 4 },
  levelFiveExtraPositions: { min: 1, max: 3 },
};

function run(level: number, attacks: number, random = () => 0): readonly number[] {
  let progress: CollectionSweepProgress = createCollectionSweepProgress();
  const triggers: number[] = [];
  for (let attack = 1; attack <= attacks; attack += 1) {
    const result = completeCollectionSweepAttack(progress, level, effect, random);
    progress = result.progress;
    if (result.triggered) triggers.push(attack);
  }
  return triggers;
}

describe("Collection Sweep", () => {
  it("hits every eligible body in a circle once", () => {
    const targets = [
      { targetId: "inside", x: 10, y: 0, radius: 2, active: true },
      { targetId: "edge", x: 12, y: 0, radius: 2, active: true },
      { targetId: "outside", x: 13, y: 0, radius: 2, active: true },
      { targetId: "dead", x: 0, y: 0, radius: 2, active: true, defeated: true },
    ];
    expect(selectCollectionSweepHits({ x: 0, y: 0 }, 10, targets).map(({ targetId }) => targetId))
      .toEqual(["inside", "edge"]);
  });

  it("keeps counting while unowned and does not reset when acquired", () => {
    let progress = createCollectionSweepProgress();
    for (let attack = 0; attack < 7; attack += 1) {
      progress = completeCollectionSweepAttack(progress, 0, effect, () => 0).progress;
    }
    const acquired = completeCollectionSweepAttack(progress, 1, effect, () => 0);
    expect(acquired.progress.completedAttacks).toBe(8);
    expect(acquired.triggered).toBe(true);
  });

  it("uses the exact level 1–4 cadence and authored positions", () => {
    expect(run(1, 16)).toEqual([8, 16]);
    expect(run(2, 12)).toEqual([6, 12]);
    expect(run(3, 8)).toEqual([4, 8]);

    let progress: CollectionSweepProgress = { completedAttacks: 3, nextLevelFiveAt: null };
    const levelFour = completeCollectionSweepAttack(progress, 4, effect, () => 0);
    expect(levelFour.positions).toEqual([
      { phase: "extension", fraction: 0.5 },
      { phase: "extension", fraction: 1 },
    ]);
  });

  it("rolls bounded deterministic level-five cadence and positions once per trigger", () => {
    const values = [0.5, 0, 0.999, 0.25, 0.75, 0.5, 0];
    let index = 0;
    const random = () => values[index++ % values.length];
    let progress = createCollectionSweepProgress();

    const first = completeCollectionSweepAttack(progress, 5, effect, random);
    progress = first.progress;
    expect(first.triggered).toBe(false);
    expect(progress.nextLevelFiveAt).toBe(3);

    progress = completeCollectionSweepAttack(progress, 5, effect, random).progress;
    const trigger = completeCollectionSweepAttack(progress, 5, effect, random);
    expect(trigger.triggered).toBe(true);
    expect(trigger.positions.filter(({ phase }) => phase === "extension")).toHaveLength(3);
    expect(trigger.positions.filter(({ phase }) => phase === "retraction")).toHaveLength(3);
    expect(trigger.positions.every(({ fraction }) => fraction >= 0 && fraction <= 1)).toBe(true);
    expect(trigger.progress.nextLevelFiveAt).toBeGreaterThanOrEqual(5);
    expect(trigger.progress.nextLevelFiveAt).toBeLessThanOrEqual(7);
  });
});

import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { applyWorldChoice, createWorldState, selectWorldModifiers } from "../../../src/game/systems/chaos/world-modifiers";

describe("Chaos and world modifiers", () => {
  it("starts at a clean serializable 1.0x baseline", () => {
    const state = createWorldState();
    expect(state).toEqual({ chaos: 1, enemySpawnMultiplier: 1, xpMultiplier: 1, shrineActivations: {} });
    expect(selectWorldModifiers(state)).toMatchObject({
      chaos: 1, enemySpawnMultiplier: 1, enemyHealthMultiplier: 1,
      enemyDamageMultiplier: 1, xpMultiplier: 1, eliteChance: 0,
      shrineRewardMultiplier: 1,
    });
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it("multiplies repeated world choices without rounding products away", () => {
    let state = createWorldState();
    for (let index = 0; index < 2; index += 1) {
      state = applyWorldChoice(state, {
        shrineId: archetypeIds.shrine.multiplicity,
        chaosIncrease: 0.7,
        enemySpawnMultiplier: 2,
        xpMultiplier: 1.5,
      });
    }
    expect(state).toMatchObject({ chaos: 2.4, enemySpawnMultiplier: 4, xpMultiplier: 2.25 });
    expect(state.shrineActivations[archetypeIds.shrine.multiplicity]).toBe(2);
    const selected = selectWorldModifiers(state);
    expect(selected.enemySpawnMultiplier).toBeCloseTo(5.4);
    expect(selected.xpMultiplier).toBeCloseTo(3.0375);
    expect(selected.eliteChance).toBeCloseTo(0.056);
  });
});

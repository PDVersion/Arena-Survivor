import { describe, expect, it } from "vitest";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
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

describe("overtime escalation", () => {
  const tuning = ecoGuardianTheme.tuning.difficulty;
  const steps = tuning.time.steps;

  it("plateaus at the end of a timed run", () => {
    const atEnd = selectWorldModifiers(createWorldState(), tuning, 1);
    // A timed run never receives an overtime step, however it is measured.
    expect(selectWorldModifiers(createWorldState(), tuning, 1).enemyHealthMultiplier)
      .toBeCloseTo(atEnd.enemyHealthMultiplier, 6);
    expect(atEnd.enemyHealthMultiplier).toBeCloseTo(1 + tuning.time.enemyHealthAtEnd, 6);
  });

  it("compounds enemy health once the run outlives its duration", () => {
    const atEnd = selectWorldModifiers(createWorldState(), tuning, 1);
    const growth = 1 + tuning.time.endless.enemyHealthGrowthPerStep;

    for (const overtimeSteps of [1, 2, 4, 10]) {
      const progress = 1 + overtimeSteps / steps;
      const overtime = selectWorldModifiers(createWorldState(), tuning, progress);

      expect(overtime.enemyHealthMultiplier).toBeCloseTo(
        atEnd.enemyHealthMultiplier * growth ** overtimeSteps,
        4,
      );
      expect(overtime.threatStep).toBe(steps + overtimeSteps);
    }
  });

  it("outgrows anything linear, which is the point", () => {
    // A build's damage scales multiplicatively across several axes, so a linear
    // ramp is simply absorbed. After ten overtime steps health is an order of
    // magnitude up rather than a fraction.
    const atEnd = selectWorldModifiers(createWorldState(), tuning, 1);
    const tenSteps = selectWorldModifiers(createWorldState(), tuning, 2);

    expect(tenSteps.enemyHealthMultiplier / atEnd.enemyHealthMultiplier).toBeGreaterThan(10);
  });

  it("raises damage far more gently than health", () => {
    const atEnd = selectWorldModifiers(createWorldState(), tuning, 1);
    const overtime = selectWorldModifiers(createWorldState(), tuning, 2);

    const healthGrowth = overtime.enemyHealthMultiplier / atEnd.enemyHealthMultiplier;
    const damageGrowth = overtime.enemyDamageMultiplier / atEnd.enemyDamageMultiplier;
    // Health ends the run by making enemies unkillable, not by one-shotting a
    // build that was surviving comfortably a moment earlier.
    expect(damageGrowth).toBeLessThan(healthGrowth / 3);
    expect(damageGrowth).toBeGreaterThan(1);
  });

  it("leaves move speed alone in overtime", () => {
    const atEnd = selectWorldModifiers(createWorldState(), tuning, 1);
    const overtime = selectWorldModifiers(createWorldState(), tuning, 3);

    // Speed is governed by the engagement band in REC-066; overtime must not
    // quietly reintroduce enemies that outrun the player.
    expect(overtime.enemyMoveSpeedMultiplier).toBeCloseTo(atEnd.enemyMoveSpeedMultiplier, 6);
  });
});

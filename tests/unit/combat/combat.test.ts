import { describe, expect, it } from "vitest";
import {
  applyDamage,
  canApplyContactDamage,
  consumePierce,
  createPierceState,
  rollDamage,
} from "../../../src/game/systems/combat";

describe("combat rules", () => {
  it("rolls normal and critical damage deterministically", () => {
    expect(
      rollDamage({
        baseDamage: 10,
        damageBonus: 0.5,
        critChance: 0.25,
        critDamage: 2,
        random: () => 0.5,
      }),
    ).toMatchObject({ damage: 15, critical: false, tier: 0, multiplier: 1, baseDamage: 15, bonusDamage: 0 });
    expect(
      rollDamage({
        baseDamage: 10,
        damageBonus: 0.5,
        critChance: 0.25,
        critDamage: 2,
        random: () => 0.1,
      }),
    ).toMatchObject({ damage: 30, critical: true, tier: 1, multiplier: 2, baseDamage: 15, bonusDamage: 15 });
  });

  it("resolves uncapped crit chance into guaranteed and fractional tiers", () => {
    expect(
      rollDamage({
        baseDamage: 10,
        damageBonus: 0,
        critChance: 1.75,
        critDamage: 2,
        random: () => 0.999,
      }),
    ).toMatchObject({ damage: 20, critical: true, tier: 1, multiplier: 2 });
    expect(rollDamage({ baseDamage: 10, damageBonus: 0, critChance: 1.75, critDamage: 2, random: () => 0.5 }))
      .toMatchObject({ damage: 40, tier: 2, multiplier: 4, bonusDamage: 30 });
  });

  it("applies lethal damage once without negative health", () => {
    expect(applyDamage(10, 20)).toEqual({ health: 0, killed: true, applied: true });
    expect(applyDamage(0, 20)).toEqual({ health: 0, killed: false, applied: false });
  });

  it("consumes one base hit plus configured pierce and rejects duplicate targets", () => {
    const initial = createPierceState(1);
    const first = consumePierce(initial, "enemy-a");
    const duplicate = consumePierce(first, "enemy-a");
    const second = consumePierce(duplicate, "enemy-b");

    expect(initial.remainingHits).toBe(2);
    expect(first.remainingHits).toBe(1);
    expect(duplicate).toBe(first);
    expect(second.remainingHits).toBe(0);
    expect([...second.hitTargetIds]).toEqual(["enemy-a", "enemy-b"]);
  });

  it("throttles contact damage by simulation time", () => {
    expect(canApplyContactDamage(1000, 0, 1000)).toBe(true);
    expect(canApplyContactDamage(1999, 1000, 1000)).toBe(false);
    expect(canApplyContactDamage(2000, 1000, 1000)).toBe(true);
  });
});

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
    ).toEqual({ damage: 15, critical: false });
    expect(
      rollDamage({
        baseDamage: 10,
        damageBonus: 0.5,
        critChance: 0.25,
        critDamage: 2,
        random: () => 0.1,
      }),
    ).toEqual({ damage: 30, critical: true });
  });

  it("preserves uncapped crit chance in stats while V0.1 rolls always crit above 100%", () => {
    expect(
      rollDamage({
        baseDamage: 10,
        damageBonus: 0,
        critChance: 1.75,
        critDamage: 2,
        random: () => 0.999,
      }),
    ).toEqual({ damage: 20, critical: true });
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

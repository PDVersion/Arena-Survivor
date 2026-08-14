import { describe, expect, it } from "vitest";
import { consumePierce, createPierceState, piercingMomentumDamage } from "../../../src/game/systems/combat";

describe("piercing momentum", () => {
  it("increases projectile-local damage only after unique hits", () => {
    let pierce = createPierceState(3);
    const damages: number[] = [];
    for (const target of ["a", "a", "b", "c"]) {
      const before = pierce;
      damages.push(piercingMomentumDamage(20, pierce.hitTargetIds.size, 0.1));
      pierce = consumePierce(pierce, target);
      if (target === "a" && before.hitTargetIds.has(target)) expect(pierce).toBe(before);
    }
    expect(damages).toEqual([20, 22, 22, 24]);
    expect([...pierce.hitTargetIds]).toEqual(["a", "b", "c"]);
  });
});

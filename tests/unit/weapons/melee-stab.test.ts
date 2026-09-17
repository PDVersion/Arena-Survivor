import { describe, expect, it } from "vitest";
import type { MeleeWeaponDefinition } from "../../../src/game/core/archetypes/contracts";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { selectMeleeAim, selectMeleeHits } from "../../../src/game/systems/weapons/melee-stab";

const weapon: MeleeWeaponDefinition = {
  id: archetypeIds.weapon.starter,
  deliveryKind: "melee",
  damage: 10,
  cooldownMs: 1000,
  range: 78,
  knockback: 10,
  armourPierce: 0,
  reach: 78,
  width: 18,
  targetCap: 1,
  extendMs: 130,
  retractMs: 180,
  presentationToken: "projectile",
};

const target = (id: string, x: number, y: number, radius = 10) => ({
  targetId: id, x, y, radius, active: true,
});

describe("melee stab", () => {
  it("aims only at a live target within reach", () => {
    expect(selectMeleeAim({ x: 0, y: 0 }, [target("far", 100, 0), target("near", 60, 0)], weapon.reach)?.targetId)
      .toBe("near");
    expect(selectMeleeAim({ x: 0, y: 0 }, [target("far", 100, 0)], weapon.reach)).toBeNull();
  });

  it("hits exactly one target in its narrow corridor and leaves targets outside untouched", () => {
    const hits = selectMeleeHits(
      { x: 0, y: 0 },
      0,
      weapon,
      [target("first", 45, 0), target("second", 60, 0), target("outside", 40, 30)],
    );
    expect(hits.map(({ targetId }) => targetId)).toEqual(["first"]);
  });
});

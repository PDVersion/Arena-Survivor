import { describe, expect, it } from "vitest";
import {
  attackCooldownMs,
  projectileSpreadAngles,
} from "../../../src/game/systems/weapons/weapon-timing";

describe("weapon timing seam", () => {
  it("preserves the current cooldown without bonuses", () => {
    expect(attackCooldownMs(1000, 0)).toBe(1000);
  });

  it("keeps the existing symmetric projectile spread", () => {
    expect(projectileSpreadAngles(1, 3)).toEqual([0.88, 1, 1.12]);
  });
});

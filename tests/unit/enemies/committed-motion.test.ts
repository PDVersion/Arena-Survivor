import { expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { advanceCommittedMotion, createMotionState } from "../../../src/game/systems/enemies/committed-motion";

for (const theme of [ecoGuardianTheme, knightMagicTheme]) {
  for (const enemy of theme.enemies.filter((e) => "committedMotion" in e)) {
    if (!("committedMotion" in enemy)) continue;
    const definition = enemy.committedMotion;
    it(`${theme.id}/${enemy.id} warns in range, locks bearing, travels finitely and recovers`, () => {
      const start = createMotionState();
      const at = { x: 0, y: 0 }, near = { x: definition.triggerRange, y: 0 }, moved = { x: 0, y: 1000 };
      expect(advanceCommittedMotion(start, definition, 100, at, moved)).toBe(start);
      for (const delta of [0, -1, NaN, Infinity]) expect(advanceCommittedMotion(start, definition, delta, at, near)).toBe(start);
      const warning = advanceCommittedMotion(start, definition, 10, at, near);
      expect(warning.phase).toBe("telegraph");
      expect(warning.headingX).toBeCloseTo(Math.cos(definition.aimOffsetRadians));
      expect(warning.headingY).toBeCloseTo(Math.sin(definition.aimOffsetRadians));
      const held = advanceCommittedMotion(warning, definition, definition.telegraphMs - 1, at, moved);
      expect(held.phase).toBe("telegraph");
      const travel = advanceCommittedMotion(held, definition, 1, at, moved);
      expect(travel).toEqual({ ...warning, phase: "travel" });
      const recovery = advanceCommittedMotion(travel, definition, definition.travelMs, at, moved);
      expect(recovery).toEqual({ ...warning, phase: "recover" });
      expect(advanceCommittedMotion(recovery, definition, definition.recoveryMs - 1, at, moved).phase).toBe("recover");
      expect(advanceCommittedMotion(recovery, definition, definition.recoveryMs, at, moved).phase).toBe("approach");
      expect(advanceCommittedMotion(warning, definition, 1e9, at, moved).phase).toBe("travel");
      expect(advanceCommittedMotion(travel, definition, 1e9, at, moved).phase).toBe("recover");
      expect(createMotionState()).toEqual(start);
      expect(validateTheme(theme)).toEqual([]);
    });
    it(`${theme.id}/${enemy.id} rejects malformed motion data`, () => {
      for (const field of ["triggerRange", "telegraphMs", "travelMs", "recoveryMs", "speedMultiplier", "cueWidth"] as const) {
        for (const value of [0, -1, Infinity, NaN]) {
          const invalid = { ...theme, enemies: theme.enemies.map((e) => e.id === enemy.id ? { ...e, committedMotion: { ...definition, [field]: value } } : e) };
          expect(validateTheme(invalid).join()).toContain("committed motion needs");
        }
      }
      expect(validateTheme({ ...theme, enemies: theme.enemies.map((e) => e.id === enemy.id ? { ...e, committedMotion: { ...definition, aimOffsetRadians: Infinity, cueToken: "missing" as never } } : e) }).join()).toContain("committed motion needs");
    });
  }
}

for (const theme of [ecoGuardianTheme, knightMagicTheme]) it(`${theme.id} direct pass and oblique gust make different routes`, () => {
  const can = theme.enemies.find((e) => e.id === "enemy.committed_charger")!;
  const wrapper = theme.enemies.find((e) => e.id === "enemy.gust_drifter")!;
  if (!("committedMotion" in wrapper)) return; // Airborne eco wrappers now pursue directly.
  const position = { x: 140, y: 0 }, target = { x: 0, y: 0 };
  const roll = advanceCommittedMotion(createMotionState(), can.committedMotion, 20, position, target);
  const gust = advanceCommittedMotion(createMotionState(), wrapper.committedMotion, 20, position, target);
  const rollDistance = can.moveSpeed * can.committedMotion.speedMultiplier * can.committedMotion.travelMs / 1000;
  expect(roll.headingY).toBeCloseTo(0);
  expect(position.x + roll.headingX * rollDistance).toBeLessThan(target.x - can.radius);
  // A modest sideways step escapes the captured center line by both body radii.
  expect(50).toBeGreaterThan(can.radius + theme.characters[0]!.radius);
  expect(Math.abs(gust.headingY)).toBeGreaterThan(.5);
  expect(rollDistance).toBeGreaterThan(wrapper.moveSpeed * wrapper.committedMotion.speedMultiplier * wrapper.committedMotion.travelMs / 1000);
  expect(can.committedMotion.recoveryMs).toBeGreaterThan(wrapper.committedMotion.recoveryMs);
});

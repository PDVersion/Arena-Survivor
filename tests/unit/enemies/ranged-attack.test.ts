import { expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { advanceRangedAttack, createRangedAttackState, shotHitFraction } from "../../../src/game/systems/enemies/ranged-attack";
const enemy = ecoGuardianTheme.enemies.find((e) => e.id === "enemy.ranged_attacker")!;
const attack = enemy.rangedAttack!;
const origin = { x: 0, y: 0 };
it("locks aim for the full warning, emits once, then holds release and recovery", () => {
  let result = advanceRangedAttack(createRangedAttackState(), attack, 16, origin, { x: 300, y: 0 });
  expect(result.state.phase).toBe("prepare"); expect(result.fire).toBe(false);
  result = advanceRangedAttack(result.state, attack, 999, origin, { x: 0, y: 200 });
  expect(result.state.phase).toBe("prepare"); expect(result.state.headingX).toBe(1);
  result = advanceRangedAttack(result.state, attack, 1, origin, { x: 0, y: 200 });
  expect(result.fire).toBe(true); expect(result.state.phase).toBe("release");
  result = advanceRangedAttack(result.state, attack, attack.releaseMs, origin, { x: 0, y: 200 });
  expect(result.fire).toBe(false); expect(result.state.phase).toBe("recover");
  result = advanceRangedAttack(result.state, attack, attack.recoveryMs, origin, { x: 0, y: 200 });
  expect(result.state.phase).toBe("approach");
  expect(advanceRangedAttack(result.state, attack, 16, origin, { x: 0, y: 200 }).state.headingY).toBe(1);
});
it("does not fire outside range, while paused, or catch up multiple attacks after a long tick", () => {
  const initial = createRangedAttackState();
  expect(advanceRangedAttack(initial, attack, 10, origin, { x: 321, y: 0 }).state).toBe(initial);
  const warned = advanceRangedAttack(initial, attack, 100000, origin, origin);
  expect(warned.state.phase).toBe("prepare"); expect(warned.fire).toBe(false);
  for (const delta of [0, -10, NaN]) expect(advanceRangedAttack(warned.state, attack, delta, origin, origin).state).toBe(warned.state);
  const released = advanceRangedAttack(warned.state, attack, 100000, origin, origin);
  expect(released.fire).toBe(true); expect(released.state.phase).toBe("release");
});
it("sweeps across a target, distinguishes misses and orders front/back obstacles", () => {
  const to = { x: 200, y: 0 }, player = { x: 100, y: 0, radius: 10 };
  const hit = shotHitFraction(origin, to, player, 7);
  expect(hit).toBeCloseTo(.415);
  expect(shotHitFraction(origin, to, { ...player, y: 30 }, 7)).toBe(Infinity);
  expect(shotHitFraction(origin, to, { ...player, x: 50 }, 7)).toBeLessThan(hit);
  expect(shotHitFraction(origin, to, { ...player, x: 150 }, 7)).toBeGreaterThan(hit);
  expect(shotHitFraction(origin, origin, { ...player, x: 0 }, 7)).toBe(0);
  expect(shotHitFraction(origin, origin, player, 7)).toBe(Infinity);
});
it("adds an optional eco role with finite reachable tuning without reopening the frozen theme", () => {
  expect(validateTheme(ecoGuardianTheme)).toEqual([]); expect(validateTheme(knightMagicTheme)).toEqual([]);
  expect(knightMagicTheme.enemies.some((e) => String(e.id) === enemy.id)).toBe(false);
  const invalid = { ...ecoGuardianTheme, enemies: ecoGuardianTheme.enemies.map((e) => e.id === enemy.id ? { ...e, rangedAttack: { ...attack, projectileLifetimeMs: 1 } } : e) };
  expect(validateTheme(invalid)).toContain(`${enemy.id} invalid ranged attack`);
  const missingCopy = { ...ecoGuardianTheme, copy: { ...ecoGuardianTheme.copy, content: { ...ecoGuardianTheme.copy.content, [enemy.id]: undefined } } };
  expect(validateTheme(missingCopy)).toContain(`${enemy.id} name/description is required`);
});

import { expect, it } from "vitest";
import { themeRegistry } from "../../../src/game/content/theme-registry";
import { introductionCount } from "../../../src/game/systems/director/arrival-cluster";
import { scheduleShrineArrivals } from "../../../src/game/systems/shrines/shrine-placement";
for (const { theme } of themeRegistry) it(`${theme.id} teaches roles before the mini-boss and leaves a final payoff window`, () => {
  const roles = theme.tuning.director.roles.filter((r) => r.unlockAt > 0).slice().sort((a, b) => a.unlockAt - b.unlockAt);
  for (let i = 1; i < roles.length; i++) {
    const retainedOpeningPair = roles[i - 1]!.enemyId === "enemy.fast_fragile" && roles[i]!.enemyId === "enemy.cluster_fodder";
    expect(roles[i]!.unlockAt - roles[i - 1]!.unlockAt).toBeGreaterThanOrEqual((retainedOpeningPair ? .05 : .06) - 1e-9);
  }
  const mini = theme.enemies.find((e) => e.boss?.kind === "mini")!.boss!;
  expect(mini.appearAt - roles.at(-1)!.unlockAt).toBeGreaterThanOrEqual(.1);
  expect(theme.tuning.director.eliteUnlockAt).toBeGreaterThan(mini.appearAt);
  for (const role of roles.filter((r) => r.enemyId === "enemy.slow_durable" || r.enemyId === "enemy.death_spawner")) {
    expect(introductionCount(role, theme.tuning.director, role.unlockAt)).toBeLessThanOrEqual(4);
  }
  const arrivals = scheduleShrineArrivals(theme.tuning.shrines, 300000);
  expect(new Set(arrivals.map((a) => a.shrineId)).size).toBe(arrivals.length);
  expect(arrivals[0]!.appearAtMs).toBeGreaterThanOrEqual(30000);
  expect(300000 - arrivals.at(-1)!.appearAtMs).toBeGreaterThanOrEqual(30000);
  const stretched = scheduleShrineArrivals(theme.tuning.shrines, 600000);
  expect(stretched.map((a) => a.appearAtMs)).toEqual(arrivals.map((a) => a.appearAtMs * 2));
  expect(theme.tuning.pace.gameplayRate).toBe(.5);
});

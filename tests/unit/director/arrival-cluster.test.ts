import { expect, it } from "vitest";
import { arrivalClusterAngles, arrivalClusterCount, introductionCount } from "../../../src/game/systems/director/arrival-cluster";
import { ecoGuardianTheme as theme } from "../../../src/game/content/themes/eco-guardian";
import { archetypeIds as ids } from "../../../src/game/core/archetypes/ids";
import { crossedUnlocks } from "../../../src/game/systems/director/spawn-director";
const definition = theme.enemies.find((e) => e.id === ids.enemy.fastFragile)!;
it("keeps formation symmetric, spaced in world units and bounded by actual free slots", () => {
  const angles = arrivalClusterAngles(definition, 100, 0.5, 500);
  expect(angles).toHaveLength(3);
  expect(angles[1]).toBe(0.5);
  expect((angles[1]! - angles[0]!) * 500).toBeCloseTo(definition.arrivalCluster.spacing);
  expect(arrivalClusterCount(definition, 0)).toBe(0);
  expect(arrivalClusterCount(definition, 2)).toBe(2);
  expect(arrivalClusterCount({}, 4)).toBe(1);
  for (const available of [-1, NaN, Infinity, 0.5]) expect(() => arrivalClusterCount(definition, available)).toThrow();
});
it("introduces just three once at its own threshold, independent of later natural formation", () => {
  const roles = [{ ...theme.tuning.director.roles.find((r) => r.enemyId === ids.enemy.clusterFodder)!, introductionCount: 3 }];
  const role = roles.find((r) => r.enemyId === ids.enemy.clusterFodder)!;
  expect(introductionCount(role, theme.tuning.director, .25)).toBe(3);
  expect(crossedUnlocks(theme.tuning.director, .25, .25)).toEqual([]);
  expect(crossedUnlocks(theme.tuning.director, .25, .39).some((role) => role.enemyId === ids.enemy.clusterFodder)).toBe(false);
});

import { describe, expect, it } from "vitest";
import { canSpawn, createDeathSpawns, pointOnSpawnRing, selectEnemyDefinition } from "../../../src/game/systems/spawning";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";

describe("spawning rules", () => {
  it("enforces an exclusive live-entity cap", () => {
    expect(canSpawn(79, 80)).toBe(true);
    expect(canSpawn(80, 80)).toBe(false);
    expect(canSpawn(81, 80)).toBe(false);
  });

  it("selects only unlocked roles using deterministic weighted rolls", () => {
    expect(selectEnemyDefinition(knightMagicTheme.enemies, 0, () => 0.99)?.id).toBe(
      archetypeIds.enemy.swarmBasic,
    );
    expect(selectEnemyDefinition(knightMagicTheme.enemies, 8_000, () => 0.99)?.id).toBe(
      archetypeIds.enemy.fastFragile,
    );
    expect(selectEnemyDefinition(knightMagicTheme.enemies, 30_000, () => 0.999)?.id).toBe(
      archetypeIds.enemy.deathSpawner,
    );
    expect(selectEnemyDefinition(knightMagicTheme.enemies, 30_000, () => 0)?.id).toBe(
      archetypeIds.enemy.swarmBasic,
    );
  });

  it("creates configured Broodmother offspring with parent and reward provenance", () => {
    const broodmother = knightMagicTheme.enemies.find(
      (enemy) => enemy.id === archetypeIds.enemy.deathSpawner,
    );
    if (!broodmother) throw new Error("Missing Broodmother definition");
    expect(createDeathSpawns(broodmother, "enemy-7", "death-9")).toEqual({
      enemyId: archetypeIds.enemy.fastFragile,
      count: 5,
      parentEntityId: "enemy-7",
      parentEventId: "death-9",
      spawnSource: archetypeIds.enemy.deathSpawner,
      rewardMultiplier: 0,
    });
  });

  it("places spawns on a ring and clamps them inside the arena margin", () => {
    expect(pointOnSpawnRing({ x: 100, y: 100 }, 50, 0, { width: 300, height: 200 }, 10)).toEqual({
      x: 150,
      y: 100,
    });
    expect(pointOnSpawnRing({ x: 280, y: 190 }, 50, 0, { width: 300, height: 200 }, 10)).toEqual({
      x: 290,
      y: 190,
    });
  });
});

import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import {
  canSpawn,
  createDeathSpawns,
  findOffScreenSpawnPoint,
  offScreenSpawnRadius,
  V02_SPAWN_LIMITS,
  type ViewRect,
} from "../../../src/game/systems/spawning";

const ARENA = { width: 3600, height: 2400 };
const VIEW_SIZE = { width: 1600, height: 900 };

function viewAt(x: number, y: number): ViewRect {
  return { centreX: x, centreY: y, width: VIEW_SIZE.width, height: VIEW_SIZE.height };
}

function isOnScreen(point: { x: number; y: number }, view: ViewRect): boolean {
  return (
    Math.abs(point.x - view.centreX) <= view.width / 2 &&
    Math.abs(point.y - view.centreY) <= view.height / 2
  );
}

describe("spawning rules", () => {
  it("enforces an exclusive live-entity cap", () => {
    expect(canSpawn(0, V02_SPAWN_LIMITS.maxAlive)).toBe(true);
    expect(canSpawn(V02_SPAWN_LIMITS.maxAlive - 1, V02_SPAWN_LIMITS.maxAlive)).toBe(true);
    expect(canSpawn(V02_SPAWN_LIMITS.maxAlive, V02_SPAWN_LIMITS.maxAlive)).toBe(false);
    expect(canSpawn(-1, V02_SPAWN_LIMITS.maxAlive)).toBe(false);
  });

  it("derives the spawn radius from the visible view, not a constant", () => {
    const radius = offScreenSpawnRadius(viewAt(0, 0), 100);
    // Half-diagonal of 1600x900 is ~918; V0.2's fixed 360 sat well inside it.
    expect(radius).toBeCloseTo(Math.hypot(1600, 900) / 2 + 100);
    expect(radius).toBeGreaterThan(900);

    // A larger view must push spawns further out.
    const wider = offScreenSpawnRadius({ ...viewAt(0, 0), width: 2400, height: 1350 }, 100);
    expect(wider).toBeGreaterThan(radius);
  });

  it("never places an ambient spawn inside the view, anywhere in the arena", () => {
    const margin = 25;
    const positions = [
      { x: ARENA.width / 2, y: ARENA.height / 2 },
      { x: margin, y: margin },
      { x: ARENA.width - margin, y: margin },
      { x: margin, y: ARENA.height - margin },
      { x: ARENA.width - margin, y: ARENA.height - margin },
      { x: ARENA.width / 2, y: margin },
      { x: margin, y: ARENA.height / 2 },
    ];

    for (const origin of positions) {
      const view = viewAt(origin.x, origin.y);
      const radius = offScreenSpawnRadius(view, 100);
      for (let step = 0; step < 32; step += 1) {
        const point = findOffScreenSpawnPoint({
          origin,
          radius,
          angleRadians: (step * Math.PI * 2) / 32,
          arena: ARENA,
          view,
          margin,
        });
        expect(isOnScreen(point, view)).toBe(false);
        expect(point.x).toBeGreaterThanOrEqual(margin);
        expect(point.y).toBeGreaterThanOrEqual(margin);
        expect(point.x).toBeLessThanOrEqual(ARENA.width - margin);
        expect(point.y).toBeLessThanOrEqual(ARENA.height - margin);
      }
    }
  });

  it("rejects rather than clamps, which is what dragged V0.2 spawns on screen", () => {
    // Player hard against the left wall: the ring's left half leaves the arena.
    const origin = { x: 30, y: ARENA.height / 2 };
    const view = viewAt(origin.x, origin.y);
    const point = findOffScreenSpawnPoint({
      origin,
      radius: offScreenSpawnRadius(view, 100),
      // Pointing directly at the wall, so the first candidate is invalid.
      angleRadians: Math.PI,
      arena: ARENA,
      view,
      margin: 20,
    });

    expect(point.x).toBeGreaterThanOrEqual(20);
    expect(isOnScreen(point, view)).toBe(false);
  });

  it("is deterministic for the same inputs", () => {
    const view = viewAt(1800, 1200);
    const options = {
      origin: { x: 1800, y: 1200 },
      radius: offScreenSpawnRadius(view, 100),
      angleRadians: 1.234,
      arena: ARENA,
      view,
      margin: 14,
    };
    expect(findOffScreenSpawnPoint(options)).toEqual(findOffScreenSpawnPoint(options));
  });

  it("creates configured death-spawn offspring with parent and reward provenance", () => {
    const definition = knightMagicTheme.enemies.find(
      (enemy) => enemy.id === archetypeIds.enemy.deathSpawner,
    );
    if (!definition) throw new Error("Missing death-spawner definition");

    expect(createDeathSpawns(definition, "parent-1", "death-1")).toEqual({
      enemyId: archetypeIds.enemy.fastFragile,
      count: 5,
      parentEntityId: "parent-1",
      parentEventId: "death-1",
      spawnSource: archetypeIds.enemy.deathSpawner,
      rewardMultiplier: 0.5,
    });

    const plain = knightMagicTheme.enemies.find(
      (enemy) => enemy.id === archetypeIds.enemy.swarmBasic,
    );
    expect(createDeathSpawns(plain!, "parent-2", "death-2")).toBeNull();
  });
});

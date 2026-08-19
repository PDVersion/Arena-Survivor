import { describe, expect, it } from "vitest";
import { ecoGuardianTheme } from "../../../src/game/content/themes/eco-guardian";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { SpatialHash } from "../../../src/game/systems/spatial/spatial-hash";
import {
  knockbackDisplacement,
  resolvePlayerAgainstSolids,
  separateCrowd,
  type SolidBody,
} from "../../../src/game/systems/separation/crowd-separation";

const ARENA = { width: 3600, height: 2400 };
const OPTIONS = { maxNeighbours: 8, maxDisplacement: 6 };

function body(
  id: string,
  x: number,
  y: number,
  separationRadius = 10,
  mass = 1,
  solid = false,
): SolidBody {
  return { id, x, y, separationRadius, mass, solid };
}

function indexed(bodies: readonly SolidBody[]): SpatialHash<SolidBody> {
  const hash = new SpatialHash<SolidBody>(64);
  for (const entry of bodies) hash.insert(entry);
  return hash;
}

function distance(a: SolidBody, b: SolidBody): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

describe("crowd separation", () => {
  it("pushes overlapping bodies apart", () => {
    const bodies = [body("a", 100, 100), body("b", 105, 100)];
    const before = distance(bodies[0]!, bodies[1]!);

    separateCrowd(bodies, indexed(bodies), OPTIONS);

    expect(distance(bodies[0]!, bodies[1]!)).toBeGreaterThan(before);
  });

  it("separates perfectly coincident bodies, which is the whole point", () => {
    // Without a deterministic fallback normal these share a position forever,
    // because the contact normal between them is undefined.
    const bodies = [body("a", 200, 200), body("b", 200, 200)];

    separateCrowd(bodies, indexed(bodies), OPTIONS);

    expect(distance(bodies[0]!, bodies[1]!)).toBeGreaterThan(0);
  });

  it("is deterministic for coincident bodies", () => {
    const first = [body("a", 200, 200), body("b", 200, 200)];
    const second = [body("a", 200, 200), body("b", 200, 200)];

    separateCrowd(first, indexed(first), OPTIONS);
    separateCrowd(second, indexed(second), OPTIONS);

    expect(first).toEqual(second);
  });

  it("leaves bodies that are already clear untouched", () => {
    const bodies = [body("a", 100, 100), body("b", 400, 400)];
    const snapshot = structuredClone(bodies);

    const stats = separateCrowd(bodies, indexed(bodies), OPTIONS);

    expect(bodies).toEqual(snapshot);
    expect(stats.adjustments).toBe(0);
  });

  it("moves the lighter body further than the heavier one", () => {
    const light = body("light", 100, 100, 10, 1);
    const heavy = body("heavy", 108, 100, 10, 8);
    const bodies = [light, heavy];

    separateCrowd(bodies, indexed(bodies), OPTIONS);

    expect(Math.abs(light.x - 100)).toBeGreaterThan(Math.abs(heavy.x - 108));
  });

  it("never displaces a body further than the per-frame ceiling", () => {
    const bodies = [body("a", 100, 100, 40), body("b", 101, 100, 40)];

    separateCrowd(bodies, indexed(bodies), { maxNeighbours: 8, maxDisplacement: 2 });

    expect(Math.abs(bodies[0]!.x - 100)).toBeLessThanOrEqual(2.0001);
  });

  it("bounds work per body so a dense pile stays linear", () => {
    const bodies = Array.from({ length: 40 }, (_, index) => body(`e${index}`, 100, 100));

    const stats = separateCrowd(bodies, indexed(bodies), { maxNeighbours: 4, maxDisplacement: 6 });

    expect(stats.adjustments).toBeLessThanOrEqual(bodies.length * 4);
  });

  it("resolves a dense stack toward separation over repeated frames", () => {
    const bodies = Array.from({ length: 12 }, (_, index) => body(`e${index}`, 500, 500));

    for (let frame = 0; frame < 60; frame += 1) {
      separateCrowd(bodies, indexed(bodies), OPTIONS);
    }

    // No pair may remain perfectly stacked.
    for (let index = 0; index < bodies.length; index += 1) {
      for (let other = index + 1; other < bodies.length; other += 1) {
        expect(distance(bodies[index]!, bodies[other]!)).toBeGreaterThan(0.5);
      }
    }
  });
});

describe("player against solids", () => {
  const player = () => ({ x: 500, y: 500, radius: 18 });

  it("pushes the player out of a solid enemy", () => {
    const solid = body("glass", 505, 500, 22, 4, true);
    const target = player();

    const resolved = resolvePlayerAgainstSolids(target, indexed([solid]), ARENA, 30);

    expect(resolved).toBe(1);
    expect(Math.hypot(target.x - solid.x, target.y - solid.y)).toBeGreaterThanOrEqual(
      18 + 22 - 0.001,
    );
  });

  it("ignores non-solid enemies so small litter is walked through", () => {
    const soft = body("bag", 505, 500, 22, 1, false);
    const target = player();

    expect(resolvePlayerAgainstSolids(target, indexed([soft]), ARENA, 30)).toBe(0);
    expect(target).toEqual(player());
  });

  it("displaces the enemy instead when the player is against a wall", () => {
    // Player pinned in the corner: pushing them out would leave the arena, so
    // a crowd must not be able to wedge them through it.
    const target = { x: 18, y: 18, radius: 18 };
    const solid = body("glass", 30, 18, 22, 4, true);

    resolvePlayerAgainstSolids(target, indexed([solid]), ARENA, 30);

    expect(target.x).toBeGreaterThanOrEqual(18);
    expect(target.y).toBeGreaterThanOrEqual(18);
    expect(solid.x).toBeGreaterThan(30);
  });

  it("separates a solid sharing the player's exact position", () => {
    const target = player();
    const solid = body("glass", 500, 500, 22, 4, true);

    resolvePlayerAgainstSolids(target, indexed([solid]), ARENA, 30);

    expect(Math.hypot(target.x - solid.x, target.y - solid.y)).toBeGreaterThan(0);
  });
});

describe("knockback", () => {
  it("pushes directly away from the source", () => {
    const push = knockbackDisplacement({ x: 0, y: 0 }, { x: 10, y: 0 }, 20, 1);
    expect(push.x).toBeCloseTo(20);
    expect(push.y).toBeCloseTo(0);
  });

  it("scales inversely with mass so heavy roles shrug it off", () => {
    const light = knockbackDisplacement({ x: 0, y: 0 }, { x: 10, y: 0 }, 20, 1);
    const heavy = knockbackDisplacement({ x: 0, y: 0 }, { x: 10, y: 0 }, 20, 8);
    expect(heavy.x).toBeLessThan(light.x);
  });

  it("is inert at zero strength, which is what both production weapons declare", () => {
    expect(knockbackDisplacement({ x: 0, y: 0 }, { x: 10, y: 0 }, 0, 1)).toEqual({ x: 0, y: 0 });
  });

  it("still produces a direction for coincident points", () => {
    const push = knockbackDisplacement({ x: 5, y: 5 }, { x: 5, y: 5 }, 20, 1);
    expect(Math.hypot(push.x, push.y)).toBeGreaterThan(0);
  });
});

describe("crowd density", () => {
  const themes = [
    ["eco-guardian", ecoGuardianTheme],
    ["knight-magic", knightMagicTheme],
  ] as const;

  it.each(themes)("keeps every %s role bunching rather than spacing out", (_name, theme) => {
    // At or below the drawn radius, so bodies still touch and a swarm reads as
    // a crowd. Above it they would stand off from each other in a grid.
    for (const role of theme.tuning.bodies.roles) {
      expect(role.separationScale).toBeGreaterThan(0);
      expect(role.separationScale).toBeLessThanOrEqual(1);
    }
  });

  it.each(themes)("keeps %s bodies from sitting inside each other", (_name, theme) => {
    // Raised after play testing: a detonation clearing a pocket let the retained
    // spawn backlog refill it at once, and the light roles overlapped so heavily
    // that the arrivals read as a single blob. See REC-067.
    for (const role of theme.tuning.bodies.roles) {
      expect(role.separationScale).toBeGreaterThanOrEqual(0.7);
    }
  });

  it.each(themes)("sizes the %s hash cell for the largest body it can hold", (_name, theme) => {
    const largest = Math.max(
      ...theme.tuning.bodies.roles.map((role) => {
        const enemy = theme.enemies.find((entry) => entry.id === role.enemyId)!;
        return enemy.radius * role.separationScale;
      }),
    );
    const elite = theme.elites[0]!.radiusMultiplier;

    // Elites included: a cell smaller than the largest body's diameter lets an
    // overlapping pair fall in non-adjacent cells and never be resolved.
    expect(theme.tuning.bodies.cellSize).toBeGreaterThanOrEqual(largest * elite * 2);
  });
});

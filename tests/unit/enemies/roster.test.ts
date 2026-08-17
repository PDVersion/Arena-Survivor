import { describe, expect, it } from "vitest";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { archetypeIds } from "../../../src/game/core/archetypes/ids";
import { CausalEventQueue } from "../../../src/game/systems/events/causal-events";
import { createDeathSpawns } from "../../../src/game/systems/spawning";

describe("expanded enemy roster", () => {
  // Health and contact damage remain the product baselines. Rewards were
  // separated by role in V0.3 Phase 3, and move speeds were rescaled in Phase 4
  // for the off-screen spawn envelope -- the old values were tuned against a
  // 360-unit ring and left enemies unable to reach the player. See REC-049.
  it("uses the product baselines for Runner and Tank", () => {
    const byId = new Map(knightMagicTheme.enemies.map((enemy) => [enemy.id, enemy]));
    expect(byId.get(archetypeIds.enemy.fastFragile)).toMatchObject({ maxHealth: 10, moveSpeed: 240, contactDamage: 8, xpReward: 2 });
    expect(byId.get(archetypeIds.enemy.slowDurable)).toMatchObject({ maxHealth: 80, moveSpeed: 90, contactDamage: 20, xpReward: 7 });
  });

  it("claims one Broodmother death-spawn effect and retains all five children", () => {
    const definition = knightMagicTheme.enemies.find((enemy) => enemy.id === archetypeIds.enemy.deathSpawner);
    if (!definition) throw new Error("Missing Broodmother definition");
    const queue = new CausalEventQueue();
    const spawn = createDeathSpawns(definition, "brood-1", "death-1");
    if (!spawn) throw new Error("Missing death-spawn capability");
    expect(queue.claimLethal("brood-1")).toBe(true);
    expect(queue.claimLethal("brood-1")).toBe(false);
    expect(queue.claimEffect("brood-1", "enemy.death_spawn")).toBe(true);
    expect(queue.claimEffect("brood-1", "enemy.death_spawn")).toBe(false);
    for (let index = 0; index < spawn.count; index += 1) {
      queue.enqueue({ eventId: `child-${index}`, kind: "spawn.requested", entityId: spawn.parentEntityId, provenance: { sourceCategory: "enemy", sourceId: spawn.spawnSource, parentEventId: spawn.parentEventId, effectId: "enemy.death_spawn" }, payload: { enemyId: spawn.enemyId } });
    }
    expect(queue.snapshot()).toMatchObject({ backlog: 5, backlogHighWater: 5 });
  });
});

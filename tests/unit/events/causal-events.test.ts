import { describe, expect, it } from "vitest";
import { CausalEventQueue } from "../../../src/game/systems/events/causal-events";
import { runHeadlessLoadHarness } from "../../../src/game/systems/load/load-harness";

describe("causal event queue", () => {
  it("retains due work and processes it iteratively within a budget", () => {
    const queue = new CausalEventQueue();
    for (let index = 0; index < 5; index += 1) {
      queue.enqueue({ eventId: `event-${index}`, kind: "spawn.requested", provenance: { sourceCategory: "world" }, payload: { index } });
    }
    const processed: string[] = [];
    expect(queue.process(2, (event) => processed.push(event.eventId))).toBe(2);
    expect(queue.snapshot()).toMatchObject({ backlog: 3, backlogHighWater: 5, processed: 2 });
    queue.process(10, (event) => processed.push(event.eventId));
    expect(processed).toEqual(["event-0", "event-1", "event-2", "event-3", "event-4"]);
  });

  it("rejects duplicate event IDs and grants lethal/effect claims exactly once", () => {
    const queue = new CausalEventQueue();
    const event = { eventId: "same", kind: "death.committed" as const, entityId: "enemy-1", provenance: { sourceCategory: "weapon" as const }, payload: {} };
    expect(queue.enqueue(event)).toBe(true);
    expect(queue.enqueue(event)).toBe(false);
    expect(queue.claimLethal("enemy-1")).toBe(true);
    expect(queue.claimLethal("enemy-1")).toBe(false);
    expect(queue.claimEffect("enemy-1", "split")).toBe(true);
    expect(queue.claimEffect("enemy-1", "split")).toBe(false);
  });

  it("retains the head event when a capacity-aware consumer defers it", () => {
    const queue = new CausalEventQueue();
    queue.enqueue({ eventId: "spawn-1", kind: "spawn.requested", provenance: { sourceCategory: "enemy" }, payload: {} });
    expect(queue.process(1, () => false)).toBe(0);
    expect(queue.snapshot()).toMatchObject({ backlog: 1, processed: 0 });
    expect(queue.process(1, () => true)).toBe(1);
  });

  it("processes a deterministic 300-event representative load without loss", () => {
    const result = runHeadlessLoadHarness(300, 17);
    expect(result).toMatchObject({ requested: 300, processed: 300, backlogHighWater: 300 });
    expect(new Set(result.eventIds).size).toBe(300);
    expect(result.ticks).toBe(18);
  });
});

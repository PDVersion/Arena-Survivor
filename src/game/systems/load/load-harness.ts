import { CausalEventQueue, type CausalEvent } from "../events/causal-events";

export interface LoadHarnessResult {
  readonly requested: number;
  readonly processed: number;
  readonly ticks: number;
  readonly backlogHighWater: number;
  readonly eventIds: readonly string[];
}

export function runHeadlessLoadHarness(requested = 300, perTickBudget = 24): LoadHarnessResult {
  const queue = new CausalEventQueue();
  const eventIds: string[] = [];
  for (let index = 0; index < requested; index += 1) {
    queue.enqueue({
      eventId: `load-${index + 1}`,
      kind: "spawn.requested",
      provenance: { sourceCategory: "world", sourceId: "load.harness" },
      payload: { sequence: index + 1 },
    });
  }
  let ticks = 0;
  while (queue.snapshot().backlog > 0) {
    ticks += 1;
    queue.process(perTickBudget, (event: CausalEvent) => eventIds.push(event.eventId));
  }
  const snapshot = queue.snapshot();
  return Object.freeze({
    requested,
    processed: snapshot.processed,
    ticks,
    backlogHighWater: snapshot.backlogHighWater,
    eventIds: Object.freeze(eventIds),
  });
}

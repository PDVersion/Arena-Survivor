import type { ContentId } from "../../core/archetypes/ids";
import type { EventSourceCategory } from "../../core/archetypes/categories";

export type RuntimeEventId = string;
export type RuntimeEntityId = string;
export type RuntimeEffectId = string;

export type CausalEventKind =
  | "hit.committed"
  | "death.committed"
  | "spawn.requested"
  | "spawn.committed"
  | "reward.committed"
  | "feedback.requested"
  | "effect.explosion";

export interface EventProvenance {
  readonly sourceCategory: EventSourceCategory;
  readonly sourceId?: ContentId | RuntimeEntityId;
  readonly parentEventId?: RuntimeEventId;
  readonly effectId?: RuntimeEffectId;
}

export interface CausalEvent<TPayload = Readonly<Record<string, unknown>>> {
  readonly eventId: RuntimeEventId;
  readonly kind: CausalEventKind;
  readonly entityId?: RuntimeEntityId;
  readonly provenance: EventProvenance;
  readonly payload: TPayload;
}

export interface EventQueueSnapshot {
  readonly backlog: number;
  readonly backlogHighWater: number;
  readonly processed: number;
  readonly rejectedDuplicates: number;
}

export class CausalEventQueue {
  private pending: CausalEvent[] = [];
  private readonly knownEventIds = new Set<RuntimeEventId>();
  private readonly lethalClaims = new Set<RuntimeEntityId>();
  private readonly effectClaims = new Set<string>();
  private processed = 0;
  private rejectedDuplicates = 0;
  private backlogHighWater = 0;

  enqueue(event: CausalEvent): boolean {
    if (this.knownEventIds.has(event.eventId)) {
      this.rejectedDuplicates += 1;
      return false;
    }
    this.knownEventIds.add(event.eventId);
    this.pending.push(structuredClone(event));
    this.backlogHighWater = Math.max(this.backlogHighWater, this.pending.length);
    return true;
  }

  process(maximum: number, consumer: (event: CausalEvent) => unknown): number {
    const count = Math.min(Math.max(0, Math.floor(maximum)), this.pending.length);
    let processedNow = 0;
    for (let index = 0; index < count; index += 1) {
      const event = this.pending.shift();
      if (!event) break;
      if (consumer(event) === false) {
        this.pending.unshift(event);
        break;
      }
      this.processed += 1;
      processedNow += 1;
    }
    return processedNow;
  }

  claimLethal(entityId: RuntimeEntityId): boolean {
    if (this.lethalClaims.has(entityId)) return false;
    this.lethalClaims.add(entityId);
    return true;
  }

  claimEffect(entityId: RuntimeEntityId, effectId: RuntimeEffectId): boolean {
    const key = `${entityId}\u0000${effectId}`;
    if (this.effectClaims.has(key)) return false;
    this.effectClaims.add(key);
    return true;
  }

  clear(): void {
    this.pending = [];
    this.knownEventIds.clear();
    this.lethalClaims.clear();
    this.effectClaims.clear();
    this.processed = 0;
    this.rejectedDuplicates = 0;
    this.backlogHighWater = 0;
  }

  snapshot(): EventQueueSnapshot {
    return Object.freeze({
      backlog: this.pending.length,
      backlogHighWater: this.backlogHighWater,
      processed: this.processed,
      rejectedDuplicates: this.rejectedDuplicates,
    });
  }
}

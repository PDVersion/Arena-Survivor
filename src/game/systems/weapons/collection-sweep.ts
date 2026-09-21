import type { SkillEffectDefinition } from "../../core/archetypes/contracts";
import type { RandomSource } from "../upgrades";

export type CollectionSweepEffect = Extract<SkillEffectDefinition, { kind: "collection_sweep" }>;

export interface CollectionSweepProgress {
  readonly completedAttacks: number;
  readonly nextLevelFiveAt: number | null;
}

export interface CollectionSweepPosition {
  readonly phase: "extension" | "retraction";
  /** Distance along the grabber path, where 1 is maximum reach. */
  readonly fraction: number;
}

export interface CollectionSweepResolution {
  readonly progress: CollectionSweepProgress;
  readonly positions: readonly CollectionSweepPosition[];
  readonly triggered: boolean;
}

export interface CollectionSweepTarget {
  readonly targetId: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly active: boolean;
  readonly defeated?: boolean;
}

/** Every live body touching one sweep circle, returned at most once. */
export function selectCollectionSweepHits<T extends CollectionSweepTarget>(
  centre: Readonly<{ x: number; y: number }>,
  radius: number,
  targets: Iterable<T>,
): readonly T[] {
  const hits: T[] = [];
  for (const target of targets) {
    if (!target.active || target.defeated) continue;
    if (Math.hypot(target.x - centre.x, target.y - centre.y) <= radius + target.radius) hits.push(target);
  }
  return Object.freeze(hits);
}

export function createCollectionSweepProgress(): CollectionSweepProgress {
  return Object.freeze({ completedAttacks: 0, nextLevelFiveAt: null });
}

function integerBetween(range: Readonly<{ min: number; max: number }>, random: RandomSource): number {
  const min = Math.ceil(range.min);
  const max = Math.floor(range.max);
  return min + Math.floor(Math.min(0.999_999_999, Math.max(0, random())) * (max - min + 1));
}

function randomPositions(
  phase: CollectionSweepPosition["phase"],
  count: number,
  random: RandomSource,
): readonly CollectionSweepPosition[] {
  return Array.from({ length: count }, () => Object.freeze({
    phase,
    fraction: Math.min(1, Math.max(0, random())),
  }));
}

/**
 * Completes exactly one grabber attack and resolves any Collection Sweep cue.
 *
 * The attack counter belongs to the weapon, not the skill level: acquiring or
 * improving the technique therefore never resets accumulated attacks. Seeded
 * choices are consumed only when level five schedules or fires a trigger.
 */
export function completeCollectionSweepAttack(
  progress: CollectionSweepProgress,
  level: number,
  effect: CollectionSweepEffect,
  random: RandomSource,
): CollectionSweepResolution {
  const completedAttacks = progress.completedAttacks + 1;
  if (level <= 0) {
    return Object.freeze({
      progress: Object.freeze({ completedAttacks, nextLevelFiveAt: null }),
      positions: Object.freeze([]),
      triggered: false,
    });
  }

  if (level < 5) {
    const cadence = effect.triggerEvery[Math.min(3, Math.floor(level) - 1)] ?? effect.triggerEvery[3];
    const triggered = completedAttacks % cadence === 0;
    const positions = triggered
      ? level >= 4
        ? [{ phase: "extension" as const, fraction: 0.5 }, { phase: "extension" as const, fraction: 1 }]
        : [{ phase: "extension" as const, fraction: 1 }]
      : [];
    return Object.freeze({
      progress: Object.freeze({ completedAttacks, nextLevelFiveAt: null }),
      positions: Object.freeze(positions),
      triggered,
    });
  }

  const triggerAt = progress.nextLevelFiveAt ??
    progress.completedAttacks + integerBetween(effect.levelFiveInterval, random);
  if (completedAttacks < triggerAt) {
    return Object.freeze({
      progress: Object.freeze({ completedAttacks, nextLevelFiveAt: triggerAt }),
      positions: Object.freeze([]),
      triggered: false,
    });
  }

  const extensionCount = integerBetween(effect.levelFiveExtraPositions, random);
  const retractionCount = integerBetween(effect.levelFiveExtraPositions, random);
  const positions = [
    { phase: "extension" as const, fraction: 0.5 },
    { phase: "extension" as const, fraction: 1 },
    ...randomPositions("extension", extensionCount, random),
    ...randomPositions("retraction", retractionCount, random),
  ];
  return Object.freeze({
    progress: Object.freeze({
      completedAttacks,
      nextLevelFiveAt: completedAttacks + integerBetween(effect.levelFiveInterval, random),
    }),
    positions: Object.freeze(positions),
    triggered: true,
  });
}

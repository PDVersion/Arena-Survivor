import { archetypeIds as ids, type EnemyId } from "../../../core/archetypes/ids";
import type { BossDefinition, BossSummonPattern } from "../../../core/archetypes/contracts";
const e = ids.enemy;
const entry = (enemyId: EnemyId, count: number) => ({ enemyId, count, rewardMultiplier: 1 });
// Light attacks shed more small pieces; heavy attacks release fewer durable enemies.
export const miniSummons = { patterns: [
  { name: "Loose litter", spreadRadius: 80, entries: [entry(e.clusterFodder, 3), entry(e.fastFragile, 3), entry(e.gustDrifter, 2)] },
  { name: "Hard litter", spreadRadius: 90, entries: [entry(e.swarmBasic, 2), entry(e.committedCharger, 2), entry(e.rangedAttacker, 1)] },
  { name: "Compacted fragments", spreadRadius: 75, entries: [entry(e.fastFragile, 5), entry(e.stationaryFragment, 2)] },
] } as const satisfies NonNullable<BossDefinition["summons"]>;
export const finalSummons = { patterns: [
  { name: "Scattered rubbish", spreadRadius: 110, entries: [entry(e.clusterFodder, 4), entry(e.fastFragile, 4), entry(e.gustDrifter, 3)] },
  { name: "Heavy load", spreadRadius: 125, entries: [entry(e.slowDurable, 1), entry(e.deathSpawner, 1), entry(e.swarmBasic, 2), entry(e.committedCharger, 2)] },
  { name: "Pressure release", spreadRadius: 115, entries: [entry(e.rangedAttacker, 2), entry(e.stationaryFragment, 4), entry(e.scavenger, 1)] },
], nearDeath: { name: "Last load — mixed release", healthFraction: .2, spreadRadius: 140,
  entries: [entry(e.clusterFodder, 2), entry(e.fastFragile, 4), entry(e.gustDrifter, 2), entry(e.swarmBasic, 2), entry(e.committedCharger, 1), entry(e.slowDurable, 1), entry(e.deathSpawner, 1), entry(e.rangedAttacker, 1), entry(e.stationaryFragment, 3), entry(e.scavenger, 1)] },
} as const satisfies NonNullable<BossDefinition["summons"]>;
const pool = (patterns: readonly BossSummonPattern[]) => [...new Set(patterns.flatMap((pattern) => pattern.entries.map((entry) => entry.enemyId)))];
export const miniFragments = { pool: pool(miniSummons.patterns), chanceBonus: .2, minimumChance: .45, childCount: 4, spreadRadius: 32 };
export const finalFragments = { pool: pool([...finalSummons.patterns, finalSummons.nearDeath]), chanceBonus: .25, minimumChance: .65, childCount: 8, spreadRadius: 48 };

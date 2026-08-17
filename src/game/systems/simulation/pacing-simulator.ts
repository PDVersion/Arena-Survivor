import type { EnemyDefinition, ThemeManifest } from "../../core/archetypes/contracts";
import { archetypeIds } from "../../core/archetypes/ids";
import { awardExperience, createProgressionState, type ProgressionState } from "../xp";
import { createWorldState, selectWorldModifiers, type WorldState } from "../chaos/world-modifiers";
import { selectEnemyDefinition, V02_SPAWN_LIMITS } from "../spawning";
import { createSeededRandom } from "../upgrades";
import type { BuildContext, BuildModel } from "./build-models";

/**
 * A deterministic, Phaser-free model of run pacing.
 *
 * It answers "when do levels arrive, and does reward income keep up with the
 * curve" without opening a browser. It deliberately does NOT model movement,
 * positioning, player damage taken, pickup travel time, or build choice — a
 * five-minute question becomes a sub-millisecond one at the cost of precision.
 * Treat its output as a band, not a prediction.
 */

const DEFAULT_STEP_MS = 100;
const DEFAULT_BUCKET_MS = 15_000;
const SIMULATION_SEED = 0x5157_0003;

export interface PacingOptions {
  readonly theme: ThemeManifest;
  readonly build: BuildModel;
  readonly durationMs: number;
  readonly stepMs?: number;
  readonly bucketMs?: number;
  /** Chaos the run is assumed to sit at. `1` is a shrine-free run. */
  readonly chaos?: number;
  readonly seed?: number;
}

export interface PacingBucket {
  readonly startMs: number;
  readonly endMs: number;
  readonly spawnedByRole: Readonly<Record<string, number>>;
  readonly liveEnemies: number;
  readonly damagePerSecond: number;
  readonly kills: number;
  readonly xpEarned: number;
  readonly level: number;
  readonly cumulativeXp: number;
}

export interface PacingReport {
  readonly themeId: string;
  readonly buildId: string;
  readonly durationMs: number;
  readonly chaos: number;
  readonly buckets: readonly PacingBucket[];
  readonly finalLevel: number;
  readonly totalKills: number;
  readonly totalXp: number;
  readonly peakLiveEnemies: number;
  /** Simulation time in ms at which each level was first reached, index 0 = level 2. */
  readonly levelTimestampsMs: readonly number[];
}

interface LiveRole {
  readonly definition: EnemyDefinition;
  count: number;
  /** Health each member of this cohort spawned with, after world multipliers. */
  readonly effectiveHealth: number;
  readonly effectiveReward: number;
}

function chaosWorldState(chaos: number): WorldState {
  return { ...createWorldState(), chaos };
}

export function simulatePacing(options: PacingOptions): PacingReport {
  const stepMs = options.stepMs ?? DEFAULT_STEP_MS;
  const bucketMs = options.bucketMs ?? DEFAULT_BUCKET_MS;
  const chaos = options.chaos ?? 1;
  if (!Number.isFinite(options.durationMs) || options.durationMs <= 0) {
    throw new Error("Run duration must be greater than zero");
  }
  if (!Number.isFinite(stepMs) || stepMs <= 0) throw new Error("Step must be greater than zero");

  const theme = options.theme;
  const tuning = theme.tuning;
  const weapon = theme.weapons.find((entry) => entry.id === archetypeIds.weapon.starterProjectile);
  const character = theme.characters.find((entry) => entry.id === archetypeIds.character.starter);
  if (!weapon || !character) throw new Error("The theme is missing required simulation content");

  const world = chaosWorldState(chaos);
  const modifiers = selectWorldModifiers(world, tuning.difficulty);
  const random = createSeededRandom(options.seed ?? SIMULATION_SEED);

  let progression: ProgressionState = createProgressionState(tuning.progression.xpCurve);
  const live = new Map<string, LiveRole>();
  const levelTimestampsMs: number[] = [];
  const buckets: PacingBucket[] = [];

  let elapsedMs = 0;
  let nextSpawnAtMs = 0;
  let damagePool = 0;
  let totalKills = 0;
  let totalXp = 0;
  let peakLiveEnemies = 0;

  let bucketStartMs = 0;
  let bucketSpawns: Record<string, number> = {};
  let bucketKills = 0;
  let bucketXp = 0;
  let bucketDpsTotal = 0;
  let bucketDpsSamples = 0;

  const liveCount = (): number => {
    let total = 0;
    for (const role of live.values()) total += role.count;
    return total;
  };

  const closeBucket = (endMs: number, dps: number): void => {
    buckets.push(
      Object.freeze({
        startMs: bucketStartMs,
        endMs,
        spawnedByRole: Object.freeze({ ...bucketSpawns }),
        liveEnemies: liveCount(),
        damagePerSecond: bucketDpsSamples === 0 ? dps : bucketDpsTotal / bucketDpsSamples,
        kills: bucketKills,
        xpEarned: bucketXp,
        level: progression.level,
        cumulativeXp: totalXp,
      }),
    );
    bucketStartMs = endMs;
    bucketSpawns = {};
    bucketKills = 0;
    bucketXp = 0;
    bucketDpsTotal = 0;
    bucketDpsSamples = 0;
  };

  while (elapsedMs < options.durationMs) {
    elapsedMs = Math.min(options.durationMs, elapsedMs + stepMs);

    // Spawning uses the same weighted selector and cadence data as the scene.
    while (elapsedMs >= nextSpawnAtMs && liveCount() < V02_SPAWN_LIMITS.maxAlive) {
      const definition = selectEnemyDefinition(theme.enemies, elapsedMs, random);
      if (!definition) break;
      const existing = live.get(definition.id);
      if (existing) {
        existing.count += 1;
      } else {
        live.set(definition.id, {
          definition,
          count: 1,
          effectiveHealth: definition.maxHealth * modifiers.enemyHealthMultiplier,
          effectiveReward:
            definition.xpReward *
            (1 +
              (modifiers.enemyHealthMultiplier - 1) * tuning.progression.toughnessRewardShare),
        });
      }
      bucketSpawns[definition.id] = (bucketSpawns[definition.id] ?? 0) + 1;
      nextSpawnAtMs += tuning.director.spawnIntervalMs / modifiers.enemySpawnMultiplier;
    }

    const context: BuildContext = {
      weaponDamage: weapon.damage,
      weaponCooldownMs: weapon.cooldownMs,
      baseCritChance: character.baseStats.critChance,
      critDamage: character.baseStats.critDamage,
      liveEnemies: liveCount(),
    };
    const dps = options.build.damagePerSecond(progression.level, context);
    bucketDpsTotal += dps;
    bucketDpsSamples += 1;
    damagePool += (dps * stepMs) / 1000;

    // Spend the damage pool on the densest cohort first, which approximates
    // auto-targeting the nearest enemy in a crowd.
    let guard = 0;
    while (damagePool > 0 && liveCount() > 0 && guard < 4096) {
      guard += 1;
      let target: LiveRole | undefined;
      for (const role of live.values()) {
        if (role.count <= 0) continue;
        if (!target || role.count > target.count) target = role;
      }
      if (!target || damagePool < target.effectiveHealth) break;
      damagePool -= target.effectiveHealth;
      target.count -= 1;
      if (target.count === 0) live.delete(target.definition.id);
      totalKills += 1;
      bucketKills += 1;

      const reward = target.effectiveReward * modifiers.xpMultiplier;
      totalXp += reward;
      bucketXp += reward;
      const previousLevel = progression.level;
      const award = awardExperience(progression, reward, 1, tuning.progression.xpCurve);
      progression = award.progression;
      for (let gained = previousLevel; gained < progression.level; gained += 1) {
        levelTimestampsMs.push(elapsedMs);
      }
    }

    peakLiveEnemies = Math.max(peakLiveEnemies, liveCount());

    if (elapsedMs - bucketStartMs >= bucketMs || elapsedMs >= options.durationMs) {
      closeBucket(elapsedMs, dps);
    }
  }

  return Object.freeze({
    themeId: theme.id,
    buildId: options.build.id,
    durationMs: options.durationMs,
    chaos,
    buckets: Object.freeze(buckets),
    finalLevel: progression.level,
    totalKills,
    totalXp,
    peakLiveEnemies,
    levelTimestampsMs: Object.freeze(levelTimestampsMs),
  });
}

/** Simulation time at which a level was first reached, or `undefined`. */
export function timeToLevel(report: PacingReport, level: number): number | undefined {
  if (level <= 1) return 0;
  return report.levelTimestampsMs[level - 2];
}

/** Player level at a moment in the run, from the closed buckets. */
export function levelAt(report: PacingReport, atMs: number): number {
  let level = 1;
  for (const bucket of report.buckets) {
    if (bucket.endMs <= atMs) level = bucket.level;
  }
  return level;
}

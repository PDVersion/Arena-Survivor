export interface ArenaTestSnapshot {
  readonly status: "booting" | "ready" | "failed";
  readonly scene: string | null;
  readonly themeId: string;
  readonly canvas: Readonly<{ width: number; height: number }>;
  readonly arena?: Readonly<{ width: number; height: number }>;
  readonly camera?: Readonly<{ scrollX: number; scrollY: number }>;
  readonly run?: Readonly<{
    status: "playing" | "paused" | "level_up" | "dead" | "complete";
    elapsedMs: number;
    durationMs: number;
    kills: number;
    liveEnemies: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    pendingChoices: number;
  }>;
  readonly player?: Readonly<{
    characterId: string;
    x: number;
    y: number;
    radius: number;
    moveSpeed: number;
    velocityX: number;
    velocityY: number;
    health: number;
    invulnerable: boolean;
    maxHealth: number;
    pickupRadius: number;
    damageBonus: number;
    attackSpeedBonus: number;
    critChance: number;
  }>;
  readonly progression?: Readonly<{
    pickups: number;
    pickupsDropped: number;
    pickupsCollected: number;
    choiceIds: readonly string[];
    selectedUpgradeIds: readonly string[];
    activeSkillIds: readonly string[];
    pierceBonus: number;
    projectileCountBonus: number;
  }>;
  readonly hud?: Readonly<{
    health: string;
    experience: string;
    level: string;
    time: string;
    kills: string;
    enemies: string;
  }>;
  readonly lifecycle?: Readonly<{
    runGeneration: number;
    terminalOverlay: "dead" | "complete" | null;
    focusPaused: boolean;
  }>;
  readonly feedback?: Readonly<{
    hitFlashes: number;
    trailsEmitted: number;
    pickupCues: number;
    audioUnlocked: boolean;
    muted: boolean;
    focused: boolean;
    voices: number;
    audioEmitted: number;
    activeVisuals: number;
    visualHighWater: number;
    dropped: number;
    reducedMotion: boolean;
  }>;
  readonly elites?: Readonly<{
    spawned: number;
    defeated: number;
    live: number;
    byRole: Readonly<Record<string, number>>;
  }>;
  readonly statistics?: Readonly<{
    kills: number;
    peakEnemiesAlive: number;
    highestChaos: number;
    highestCritChance: number;
    highestCritTier: number;
    longestPierceChain: number;
    largestKillChain: number;
    totalDamage: number;
    damageBreakdown: Readonly<{
      direct: number;
      criticalBonus: number;
      piercingMomentum: number;
      explosion: number;
      chainedExplosion: number;
      remainder: number;
    }>;
    summaryMetrics: readonly string[];
    summaryDamage: readonly string[];
    upgradeCounts: Readonly<Record<string, number>>;
    summaryUpgrades: readonly string[];
  }>;
  readonly pacing?: Readonly<{
    /** Run progress in `[0, 1]`, the input the V0.3 director curves resolve from. */
    progress: number;
    /** Ambient spawn cadence currently in effect, after world multipliers. */
    spawnIntervalMs: number;
    /** Ambient cadence before world multipliers, straight from theme tuning. */
    baseSpawnIntervalMs: number;
    liveByRole: Readonly<Record<string, number>>;
    xpEarned: number;
    xpByBucket: readonly number[];
    bucketMs: number;
    levelTimestampsMs: readonly number[];
  }>;
  readonly load?: Readonly<{
    enabled: boolean;
    requested: number;
    spawned: number;
    eventBacklog: number;
    eventBacklogHighWater: number;
    processedEffects: number;
    gameplayBacklogHighWater: number;
    processedGameplayEvents: number;
    droppedPresentationCues: number;
    liveHighWater: number;
    trackedHighWater: number;
    frameSamples: number;
    averageFrameMs: number;
    maxFrameMs: number;
  }>;
  readonly effects?: Readonly<{
    explosionsCommitted: number;
    chainExplosionsCommitted: number;
    fractureQueued: number;
    fractureSpawned: number;
    bloodlustKills: number;
    bloodlustAttackSpeedBonus: number;
    directDamage: number;
    explosionDamage: number;
    chainedExplosionDamage: number;
    eventBacklog: number;
    eventBacklogHighWater: number;
    processedEvents: number;
  }>;
  readonly shrine?: Readonly<{
    id: string | null;
    x: number;
    y: number;
    inRange: boolean;
    activated: boolean;
    active: boolean;
    scheduled: number;
    spawned: number;
    targetCount: number;
    durationMs: number;
    rewardMultiplier: number;
    enemiesSpawned: number;
    enemiesDefeated: number;
    shrineXpDropped: number;
    ambientXpDropped: number;
    shrineXpCollected: number;
    ambientXpCollected: number;
    feedbackCount: number;
    instances: readonly Readonly<{ id: string; activated: boolean }>[];
  }>;
  readonly world?: Readonly<{
    chaos: number;
    enemySpawnMultiplier: number;
    enemyHealthMultiplier: number;
    enemyDamageMultiplier: number;
    xpMultiplier: number;
    eliteChance: number;
    shrineRewardMultiplier: number;
    activations: Readonly<Record<string, number>>;
    duplicatedEnemiesQueued: number;
    duplicatedEnemiesSpawned: number;
  }>;
  readonly combat?: Readonly<{
    weaponId: string | null;
    enemyId: string | null;
    projectiles: number;
    shotsFired: number;
    criticalShots: number;
    highestCritTier: number;
    longestPierceChain: number;
    contactHits: number;
    enemyCap: number;
    projectileCap: number;
    projectileSample: Readonly<{
      id: string;
      x: number;
      y: number;
      velocityX: number;
      velocityY: number;
      damage: number;
      critTier: number;
      pierceChainIndex: number;
    }> | null;
    roster: Readonly<Record<string, number>>;
    rosterHighWater: Readonly<Record<string, number>>;
    offspringQueued: number;
    offspringSpawned: number;
  }>;
  readonly error?: string;
}

type TelemetryUpdater = (snapshot: ArenaTestSnapshot) => void;

let updater: TelemetryUpdater | undefined;

export function registerTestTelemetryUpdater(nextUpdater: TelemetryUpdater): void {
  if (import.meta.env.MODE === "test") updater = nextUpdater;
}

export function updateTestTelemetry(snapshot: ArenaTestSnapshot): void {
  updater?.(snapshot);
}

export interface ArenaTestSnapshot {
  readonly status: "booting" | "ready" | "failed";
  readonly scene: string | null;
  readonly themeId: string;
  readonly canvas: Readonly<{ width: number; height: number }>;
  readonly arena?: Readonly<{ width: number; height: number }>;
  readonly camera?: Readonly<{ scrollX: number; scrollY: number }>;
  readonly run?: Readonly<{
    status: "playing" | "paused" | "level_up" | "time_up" | "dead" | "complete";
    /** How the clock is being treated: `timed`, `endless`, or `clearing`. */
    mode: "timed" | "endless" | "clearing";
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
    /** Orbs merged to hold the population under its cap. */
    pickupsMerged: number;
    choiceIds: readonly string[];
    selectedUpgradeIds: readonly string[];
    skillLevels: Readonly<Record<string, number>>;
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
  readonly impact?: Readonly<{
    hitStopGranted: number;
    hitStopDenied: number;
    hitStopSpentMs: number;
    /** Damage entering aggregation, and damage drawn. They must reconcile. */
    damageAccumulated: number;
    damageFlushed: number;
    pendingNumbers: number;
    killChainDetuneCents: number;
    deathCause: Readonly<{ sourceId: string; elite: boolean; atMs: number }> | null;
  }>;
  readonly ui?: Readonly<{
    pauseOpen: boolean;
    /** Whether the end-of-timer decision is on screen. */
    overtimeOpen: boolean;
    /** Heading the terminal summary is showing, or null when it is not up. */
    terminalTitle: string | null;
    pauseTab: string | null;
    settings: Readonly<Record<string, boolean>>;
    /** What each offered card claims, derived from the real upgrade application. */
    cardDescriptions: readonly Readonly<{
      id: string;
      level: number;
      nextLevel: number;
      isNew: boolean;
      rarity: string;
      /** The offer's rolled tier and what it multiplies the gain by. */
      tier: string;
      tierMultiplier: number;
      lines: readonly Readonly<{ label: string; from: string | null; to: string }>[];
    }>[];
    statLines: readonly Readonly<{ key: string; display: string }>[];
    /** Reference entries and the effects each one claims. */
    codexEntries: readonly Readonly<{
      id: string;
      name: string;
      effects: readonly Readonly<{ label: string; display: string }>[];
    }>[];
    codexSection: string | null;
    /** The whole upgrade pool with what the session has taken from it. */
    codexUpgrades: readonly Readonly<{
      id: string;
      name: string;
      sessionTotal: number;
      bestInRun: number;
      maxPerRun: number;
    }>[];
    codexSession: readonly Readonly<{ label: string; display: string }>[];
  }>;
  readonly crowd?: Readonly<{
    indexed: number;
    pairChecks: number;
    /** Peak per-frame candidate visits; the cost signal for the 300-enemy gate. */
    pairChecksHighWater: number;
    adjustments: number;
    solidResolutions: number;
    contactShoves: number;
    weaponShoves: number;
    /** Enemy pairs sharing a position; separation exists to keep this at zero. */
    coincidentPairs: number;
  }>;
  readonly hazards?: Readonly<{
    active: number;
    placed: number;
    cleared: number;
    /** Damage hazards dealt to the player; never part of the damage ledger. */
    damageDealt: number;
    slowActive: boolean;
    byKind: Readonly<Record<string, number>>;
  }>;
  readonly view?: Readonly<{
    /** Constant logical world area, identical at every window size. */
    logicalWidth: number;
    logicalHeight: number;
    /** CSS size the letterboxed canvas is drawn at. */
    displayWidth: number;
    displayHeight: number;
    /** World-space rectangle currently visible. */
    worldWidth: number;
    worldHeight: number;
    spawnRadius: number;
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
    batchSize: number;
    eliteChance: number;
    roleWeights: Readonly<Record<string, number>>;
    milestoneWaves: number;
    waveSpawned: number;
    /** Wave enemies released on a fixed heading rather than chasing. */
    driftSpawned: number;
    driftReclaimed: number;
    driftLive: number;
    /** Ambient spawns that landed inside the visible view; the invariant is zero. */
    spawnsInsideView: number;
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
    instances: readonly Readonly<{ id: string; activated: boolean; x: number; y: number }>[];
    /** Shrine instances scheduled for the whole run. */
    plannedCount: number;
    /** Instances that have arrived so far; below `plannedCount` until the end. */
    revealedCount: number;
    /** Simulation time the next instance arrives, or `null` once all have. */
    nextAppearAtMs: number | null;
  }>;
  readonly world?: Readonly<{
    chaos: number;
    enemySpawnMultiplier: number;
    enemyHealthMultiplier: number;
    enemyDamageMultiplier: number;
    xpMultiplier: number;
    eliteChance: number;
    shrineRewardMultiplier: number;
    enemyMoveSpeedMultiplier: number;
    /** Discrete elapsed-time escalation step, shown as a threat level. */
    threatStep: number;
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
  readonly menu?: Readonly<{
    title: string;
    startAction: string;
    runsPlayed: number;
    bestLevel: number;
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

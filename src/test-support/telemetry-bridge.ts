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
  }>;
  readonly load?: Readonly<{
    enabled: boolean;
    requested: number;
    spawned: number;
    eventBacklog: number;
    eventBacklogHighWater: number;
    processedEffects: number;
    droppedPresentationCues: number;
    liveHighWater: number;
    trackedHighWater: number;
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

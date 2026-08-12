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
    pierceBonus: number;
    projectileCountBonus: number;
  }>;
  readonly combat?: Readonly<{
    weaponId: string | null;
    enemyId: string | null;
    projectiles: number;
    shotsFired: number;
    criticalShots: number;
    contactHits: number;
    enemyCap: number;
    projectileCap: number;
    projectileSample: Readonly<{
      id: string;
      x: number;
      y: number;
      velocityX: number;
      velocityY: number;
    }> | null;
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

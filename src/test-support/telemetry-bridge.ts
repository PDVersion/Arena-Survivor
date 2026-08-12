export interface ArenaTestSnapshot {
  readonly status: "booting" | "ready" | "failed";
  readonly scene: string | null;
  readonly themeId: string;
  readonly canvas: Readonly<{ width: number; height: number }>;
  readonly arena?: Readonly<{ width: number; height: number }>;
  readonly camera?: Readonly<{ scrollX: number; scrollY: number }>;
  readonly run?: Readonly<{
    status: "playing" | "paused" | "dead" | "complete";
    elapsedMs: number;
    durationMs: number;
  }>;
  readonly player?: Readonly<{
    characterId: string;
    x: number;
    y: number;
    radius: number;
    moveSpeed: number;
    velocityX: number;
    velocityY: number;
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

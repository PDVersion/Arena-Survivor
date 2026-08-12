export interface ArenaTestSnapshot {
  readonly status: "booting" | "ready" | "failed";
  readonly scene: string | null;
  readonly themeId: string;
  readonly canvas: Readonly<{ width: number; height: number }>;
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

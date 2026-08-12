import type { ArenaTestSnapshot } from "./telemetry-bridge";
import { registerTestTelemetryUpdater } from "./telemetry-bridge";

declare global {
  interface Window {
    readonly __ARENA_TEST__?: {
      readonly getSnapshot: () => ArenaTestSnapshot;
    };
  }
}

let snapshot: ArenaTestSnapshot = Object.freeze({
  status: "booting",
  scene: null,
  themeId: "",
  canvas: Object.freeze({ width: 0, height: 0 }),
});

registerTestTelemetryUpdater((nextSnapshot) => {
  snapshot = Object.freeze({
    ...nextSnapshot,
    canvas: Object.freeze({ ...nextSnapshot.canvas }),
    arena: nextSnapshot.arena ? Object.freeze({ ...nextSnapshot.arena }) : undefined,
    camera: nextSnapshot.camera ? Object.freeze({ ...nextSnapshot.camera }) : undefined,
    run: nextSnapshot.run ? Object.freeze({ ...nextSnapshot.run }) : undefined,
    player: nextSnapshot.player ? Object.freeze({ ...nextSnapshot.player }) : undefined,
    combat: nextSnapshot.combat
      ? Object.freeze({
          ...nextSnapshot.combat,
          projectileSample: nextSnapshot.combat.projectileSample
            ? Object.freeze({ ...nextSnapshot.combat.projectileSample })
            : null,
        })
      : undefined,
  });
});

Object.defineProperty(window, "__ARENA_TEST__", {
  configurable: false,
  enumerable: false,
  writable: false,
  value: Object.freeze({ getSnapshot: () => snapshot }),
});

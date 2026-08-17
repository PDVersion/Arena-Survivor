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
    hud: nextSnapshot.hud ? Object.freeze({ ...nextSnapshot.hud }) : undefined,
    lifecycle: nextSnapshot.lifecycle ? Object.freeze({ ...nextSnapshot.lifecycle }) : undefined,
    feedback: nextSnapshot.feedback ? Object.freeze({ ...nextSnapshot.feedback }) : undefined,
    elites: nextSnapshot.elites ? Object.freeze({
      ...nextSnapshot.elites,
      byRole: Object.freeze({ ...nextSnapshot.elites.byRole }),
    }) : undefined,
    statistics: nextSnapshot.statistics ? Object.freeze({
      ...nextSnapshot.statistics,
      damageBreakdown: Object.freeze({ ...nextSnapshot.statistics.damageBreakdown }),
      summaryMetrics: Object.freeze([...nextSnapshot.statistics.summaryMetrics]),
      summaryDamage: Object.freeze([...nextSnapshot.statistics.summaryDamage]),
    }) : undefined,
    load: nextSnapshot.load ? Object.freeze({ ...nextSnapshot.load }) : undefined,
    effects: nextSnapshot.effects ? Object.freeze({ ...nextSnapshot.effects }) : undefined,
    shrine: nextSnapshot.shrine ? Object.freeze({
      ...nextSnapshot.shrine,
      instances: Object.freeze(nextSnapshot.shrine.instances.map((instance) => Object.freeze({ ...instance }))),
    }) : undefined,
    world: nextSnapshot.world ? Object.freeze({
      ...nextSnapshot.world,
      activations: Object.freeze({ ...nextSnapshot.world.activations }),
    }) : undefined,
    combat: nextSnapshot.combat
      ? Object.freeze({
          ...nextSnapshot.combat,
          roster: Object.freeze({ ...nextSnapshot.combat.roster }),
          rosterHighWater: Object.freeze({ ...nextSnapshot.combat.rosterHighWater }),
          projectileSample: nextSnapshot.combat.projectileSample
            ? Object.freeze({ ...nextSnapshot.combat.projectileSample })
            : null,
        })
      : undefined,
    progression: nextSnapshot.progression
      ? Object.freeze({
          ...nextSnapshot.progression,
          choiceIds: Object.freeze([...nextSnapshot.progression.choiceIds]),
          selectedUpgradeIds: Object.freeze([...nextSnapshot.progression.selectedUpgradeIds]),
          skillLevels: Object.freeze({ ...nextSnapshot.progression.skillLevels }),
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

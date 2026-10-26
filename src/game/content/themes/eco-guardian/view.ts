import type { ViewTuning } from "../../../core/archetypes/tuning";

export const view = {
  zoom: 2,
  toolEffects: {
    suction: { durationMs: 520, fadeMs: 180, cycleMs: 1100, streams: 4, lowStreams: 2, strokeWidth: 12, dustRadius: 1.8,
      opacity: 0.14, nozzleLength: 20, nozzleWidth: 12, twist: 0.28,
      tailFraction: 0.3, innerFraction: 0.16 },
    claw: { prongs: 3, strokeWidth: 3, durationMs: 180, openingRadians: 0.75,
      tipFraction: 0.35, closeFraction: 0.65 },
  },
  minimapEnemyShapes: { default: "circle", low: "square" },
} as const satisfies ViewTuning;

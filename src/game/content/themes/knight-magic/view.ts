import type { ViewTuning } from "../../../core/archetypes/tuning";

export const view = {
  zoom: 2,
  minimapEnemyShapes: { default: "circle", low: "square" },
} as const satisfies ViewTuning;

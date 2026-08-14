export const modifierLayers = ["player", "weapon", "enemy", "world", "reward"] as const;
export type ModifierLayer = (typeof modifierLayers)[number];

export interface ModifierInput {
  readonly layer: ModifierLayer;
  readonly sourceId: string;
  readonly additive?: number;
  readonly multiplicative?: number;
}

export interface ModifierResult {
  readonly base: number;
  readonly additiveTotal: number;
  readonly multiplicativeProduct: number;
  readonly value: number;
  readonly orderedInputs: readonly ModifierInput[];
}

export function resolveModifiers(base: number, inputs: readonly ModifierInput[]): ModifierResult {
  const order = new Map(modifierLayers.map((layer, index) => [layer, index]));
  const orderedInputs = [...inputs].sort((left, right) =>
    (order.get(left.layer) ?? 0) - (order.get(right.layer) ?? 0) ||
    left.sourceId.localeCompare(right.sourceId),
  );
  const additiveTotal = orderedInputs.reduce((total, input) => total + (input.additive ?? 0), 0);
  const multiplicativeProduct = orderedInputs.reduce(
    (product, input) => product * (input.multiplicative ?? 1),
    1,
  );
  return Object.freeze({
    base,
    additiveTotal,
    multiplicativeProduct,
    value: (base + additiveTotal) * multiplicativeProduct,
    orderedInputs: Object.freeze(orderedInputs),
  });
}

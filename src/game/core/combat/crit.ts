export interface CritTierResult {
  readonly tier: number;
  readonly guaranteedTier: number;
  readonly fractionalChance: number;
  readonly multiplier: number;
}

export function critTierMultiplier(tier: number): number {
  return 2 ** Math.max(0, Math.floor(tier));
}

export function resolveCritTier(critChance: number, random: () => number): CritTierResult {
  const chance = Math.max(0, critChance);
  const guaranteedTier = Math.floor(chance);
  const fractionalChance = Math.round((chance - guaranteedTier) * 1_000_000_000_000) / 1_000_000_000_000;
  const tier = guaranteedTier + (random() < fractionalChance ? 1 : 0);
  return Object.freeze({ tier, guaranteedTier, fractionalChance, multiplier: critTierMultiplier(tier) });
}

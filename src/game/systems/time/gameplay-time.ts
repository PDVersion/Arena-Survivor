export interface GameplayRateInput {
  readonly baseRate: number;
  readonly reducedMotion: boolean;
  readonly hitStopActive: boolean;
  readonly deathSlowActive: boolean;
}

export function validateGameplayRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1) {
    throw new Error("Gameplay rate must be greater than zero and at most one");
  }
  return rate;
}

/** Feedback slowdowns multiply the base experiment rate; reduced motion removes only feedback. */
export function resolveGameplayRate(input: GameplayRateInput): number {
  const baseRate = validateGameplayRate(input.baseRate);
  if (input.reducedMotion) return baseRate;
  if (input.hitStopActive) return baseRate * 0.08;
  if (input.deathSlowActive) return baseRate * 0.35;
  return baseRate;
}

export function expectedRealDurationMs(simulatedDurationMs: number, gameplayRate: number): number {
  return simulatedDurationMs / validateGameplayRate(gameplayRate);
}

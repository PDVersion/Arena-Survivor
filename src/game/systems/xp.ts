export interface ProgressionState {
  readonly level: number;
  readonly xp: number;
  readonly xpToNextLevel: number;
  readonly pendingChoices: number;
}

export interface ExperienceAwardResult {
  readonly progression: ProgressionState;
  readonly levelsGained: number;
  readonly awardedXp: number;
}

export interface PickupClaimResult {
  readonly claimedPickupIds: ReadonlySet<string>;
  readonly awardedXp: number;
  readonly claimed: boolean;
}

export function xpRequiredForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new Error("Level must be a positive integer");
  return 2 + (level - 1) * 2;
}

export function createProgressionState(): ProgressionState {
  return { level: 1, xp: 0, xpToNextLevel: xpRequiredForLevel(1), pendingChoices: 0 };
}

export function awardExperience(
  state: ProgressionState,
  amount: number,
  multiplier = 1,
): ExperienceAwardResult {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("XP amount cannot be negative");
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new Error("XP multiplier must be greater than zero");
  }

  const awardedXp = amount * multiplier;
  let xp = state.xp + awardedXp;
  let level = state.level;
  let levelsGained = 0;
  let required = xpRequiredForLevel(level);

  while (xp >= required) {
    xp -= required;
    level += 1;
    levelsGained += 1;
    required = xpRequiredForLevel(level);
  }

  return {
    awardedXp,
    levelsGained,
    progression: {
      level,
      xp,
      xpToNextLevel: required,
      pendingChoices: state.pendingChoices + levelsGained,
    },
  };
}

export function consumePendingChoice(state: ProgressionState): ProgressionState {
  if (state.pendingChoices < 1) throw new Error("No level-up choice is pending");
  return { ...state, pendingChoices: state.pendingChoices - 1 };
}

export function claimExperiencePickup(
  claimedPickupIds: ReadonlySet<string>,
  pickupId: string,
  xpValue: number,
): PickupClaimResult {
  if (claimedPickupIds.has(pickupId)) {
    return { claimedPickupIds, awardedXp: 0, claimed: false };
  }
  if (!Number.isFinite(xpValue) || xpValue < 0) throw new Error("Pickup XP cannot be negative");
  return {
    claimedPickupIds: new Set([...claimedPickupIds, pickupId]),
    awardedXp: xpValue,
    claimed: true,
  };
}

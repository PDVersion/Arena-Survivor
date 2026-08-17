import type { XpBand, XpCurve } from "../core/archetypes/tuning";

/**
 * The V0.1/V0.2 curve. Used when no theme curve is supplied so pure rule tests
 * and helpers keep a stable default.
 */
export const DEFAULT_XP_CURVE: XpCurve = Object.freeze({ kind: "linear", baseXp: 2, step: 2 });

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

function growthForLevel(bands: readonly XpBand[], level: number): number {
  let growth = bands[0]?.growth ?? 1;
  for (const band of bands) {
    if (band.fromLevel <= level) growth = band.growth;
  }
  return growth;
}

/**
 * Requirement on the default curve.
 *
 * The curve is deliberately NOT an optional second parameter: this function is
 * passed to `Array.prototype.map` in places, which would supply the element
 * index as a curve. Use `xpRequiredForLevelOn` when a theme curve is in hand.
 */
export function xpRequiredForLevel(level: number): number {
  return xpRequiredForLevelOn(DEFAULT_XP_CURVE, level);
}

export function xpRequiredForLevelOn(curve: XpCurve, level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new Error("Level must be a positive integer");
  if (curve.kind === "linear") return curve.baseXp + (level - 1) * curve.step;

  // Compound the unrounded requirement so rounding never accumulates.
  let requirement = curve.baseXp;
  for (let from = 1; from < level; from += 1) {
    requirement *= growthForLevel(curve.bands, from);
  }
  return Math.round(requirement);
}

export function createProgressionState(curve: XpCurve = DEFAULT_XP_CURVE): ProgressionState {
  return { level: 1, xp: 0, xpToNextLevel: xpRequiredForLevelOn(curve, 1), pendingChoices: 0 };
}

export function awardExperience(
  state: ProgressionState,
  amount: number,
  multiplier = 1,
  curve: XpCurve = DEFAULT_XP_CURVE,
): ExperienceAwardResult {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("XP amount cannot be negative");
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new Error("XP multiplier must be greater than zero");
  }

  const awardedXp = amount * multiplier;
  let xp = state.xp + awardedXp;
  let level = state.level;
  let levelsGained = 0;
  let required = xpRequiredForLevelOn(curve, level);

  while (xp >= required) {
    xp -= required;
    level += 1;
    levelsGained += 1;
    required = xpRequiredForLevelOn(curve, level);
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

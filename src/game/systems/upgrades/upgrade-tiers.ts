import { upgradeStatTargets, type UpgradeStatTarget } from "../../core/archetypes/effects";
import { tierRank, type UpgradeTier } from "../../core/archetypes/tiers";
import type { UpgradeDefinition } from "../../core/archetypes/contracts";
import type { UpgradeTiersTuning } from "../../core/archetypes/tuning";

/**
 * Rolling how good an offer is.
 *
 * The definition says which upgrade appeared; the tier says what this
 * particular card is worth. Keeping them separate is what lets a core pick like
 * pierce sit at a common appearance rate while still producing the occasional
 * standout roll — under the previous model the only way to make an upgrade
 * exciting was to make it rare, which made it late instead.
 */

/**
 * Targets whose value has to stay a whole number.
 *
 * A projectile count of 1.4 is not a thing the weapon can fire, so these round
 * rather than scale continuously. With the shipped ladder that means uncommon
 * and rare roll the same `+1` as common, and epic upward roll `+2` — a coarser
 * ladder, but an honest one. The alternative is a card that promises 1.4 and
 * delivers 1.
 */
const INTEGER_TARGETS: ReadonlySet<UpgradeStatTarget> = new Set<UpgradeStatTarget>([
  "weapon.pierce",
  "weapon.projectileCount",
]);

export function isIntegerTarget(target: UpgradeStatTarget): boolean {
  return INTEGER_TARGETS.has(target);
}

/** Every target the pool can name, so a new one cannot be silently unscaled. */
export const scalableTargets = upgradeStatTargets;

export function tierMultiplier(tuning: UpgradeTiersTuning, tier: UpgradeTier): number {
  return tuning.tiers.find((entry) => entry.tier === tier)?.multiplier ?? 1;
}

/**
 * Whether an upgrade's offers roll a tier at all.
 *
 * World modifiers are a declared bargain — more pressure bought with more
 * reward — so scaling one half of it changes what the player agreed to, and
 * scaling both halves changes nothing. Those cards always roll common. This is
 * derived from the effects rather than authored, so a new world upgrade cannot
 * forget to opt out.
 */
export function isTiered(upgrade: UpgradeDefinition): boolean {
  return !upgrade.effects.some((effect) => effect.kind === "world.modify");
}

/**
 * Weight of one tier at a given luck.
 *
 * Common is never biased, so luck can only ever shift the distribution upward
 * and a maxed-luck build still sees plenty of ordinary cards.
 */
export function tierWeight(
  tuning: UpgradeTiersTuning,
  tier: UpgradeTier,
  luck = 0,
): number {
  const entry = tuning.tiers.find((candidate) => candidate.tier === tier);
  if (!entry) return 0;
  const bias = 1 + Math.max(0, luck) * tuning.luckWeightBias * tierRank(tier);
  return entry.weight * bias;
}

/** Roll one offer's tier. Untiered upgrades always come back common. */
export function rollUpgradeTier(
  tuning: UpgradeTiersTuning,
  random: () => number,
  luck = 0,
): UpgradeTier {
  const roll = random();
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new Error("Random source must return a value in [0, 1)");
  }
  const total = tuning.tiers.reduce(
    (sum, entry) => sum + tierWeight(tuning, entry.tier, luck),
    0,
  );
  if (total <= 0) return "common";

  let remaining = roll * total;
  for (const entry of tuning.tiers) {
    remaining -= tierWeight(tuning, entry.tier, luck);
    if (remaining < 0) return entry.tier;
  }
  return tuning.tiers.at(-1)?.tier ?? "common";
}

/** One offered card: which upgrade, and what this roll of it is worth. */
export interface UpgradeOffer {
  readonly definition: UpgradeDefinition;
  readonly tier: UpgradeTier;
}

/** Roll a tier for each drawn upgrade, in draw order. */
export function rollOfferTiers(
  choices: readonly UpgradeDefinition[],
  tuning: UpgradeTiersTuning,
  random: () => number,
  luck = 0,
): readonly UpgradeOffer[] {
  return Object.freeze(
    choices.map((definition) =>
      Object.freeze({
        definition,
        tier: isTiered(definition) ? rollUpgradeTier(tuning, random, luck) : ("common" as const),
      }),
    ),
  );
}

/**
 * What one stat effect is worth at a given multiplier.
 *
 * Integer targets round, and never below the authored value: a higher tier must
 * never be worse than a common one, which unguarded rounding would allow.
 */
export function scaleStatValue(
  target: UpgradeStatTarget,
  value: number,
  multiplier: number,
): number {
  const scaled = value * multiplier;
  if (!isIntegerTarget(target)) return scaled;
  return Math.max(value, Math.round(scaled));
}

/**
 * How many skill levels one offer grants.
 *
 * Skills level in whole steps, so the multiplier rounds the same way the
 * integer stats do: the top half of the ladder is worth two levels.
 */
export function scaleSkillLevels(multiplier: number): number {
  return Math.max(1, Math.round(multiplier));
}

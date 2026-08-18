/**
 * Roll quality for a single upgrade offer.
 *
 * Distinct from `UpgradeDefinition.rarity`, and the two answer different
 * questions. Rarity is a property of the upgrade *type* and decides how often
 * that upgrade appears in a draw at all. A tier is rolled per offer and decides
 * how much that particular card gives — the same Reinforced Tools card can come
 * up common or legendary, and the legendary one is worth twice as much.
 *
 * The ladder and its colours follow the convention the genre has settled on, so
 * a player reads a yellow border as "take this" without being told.
 */
export const upgradeTiers = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "unique",
] as const;

export type UpgradeTier = (typeof upgradeTiers)[number];

/** Position on the ladder, `0` for common. Luck biases the roll by this. */
export function tierRank(tier: UpgradeTier): number {
  return upgradeTiers.indexOf(tier);
}

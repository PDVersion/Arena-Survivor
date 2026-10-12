/** Stable IDs stored in session settings and snapshotted by a run. */
export const difficultyIds = ["beginner", "normal", "experienced"] as const;
export type DifficultyId = (typeof difficultyIds)[number];

export function isDifficultyId(value: unknown): value is DifficultyId {
  return difficultyIds.some((id) => id === value);
}

export interface DifficultyPreset {
  readonly enemyHealth: number;
  readonly enemyDamage: number;
  readonly enemySpeed: number;
  readonly spawnRate: number;
  readonly playerHealth: number;
  readonly playerSpeed: number;
  readonly pickupRadius: number;
  readonly weaponDamage: number;
  readonly weaponCooldown: number;
  readonly hazardDamage: number;
  readonly hazardRate: number;
}

export const difficultyMultiplierKeys = [
  "enemyHealth", "enemyDamage", "enemySpeed", "spawnRate", "playerHealth",
  "playerSpeed", "pickupRadius", "weaponDamage", "weaponCooldown", "hazardDamage", "hazardRate",
] as const satisfies readonly (keyof DifficultyPreset)[];

export type DifficultyPresets = Readonly<Record<DifficultyId, DifficultyPreset>>;

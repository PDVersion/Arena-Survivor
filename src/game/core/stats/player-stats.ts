export interface PlayerBaseStats {
  readonly maxHealth: number;
  readonly moveSpeed: number;
  readonly armour: number;
  readonly regeneration: number;
  readonly pickupRadius: number;
  readonly damageBonus: number;
  readonly attackSpeedBonus: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly luck: number;
  readonly xpMultiplier: number;
}

export const playerStatKeys = [
  "maxHealth",
  "moveSpeed",
  "armour",
  "regeneration",
  "pickupRadius",
  "damageBonus",
  "attackSpeedBonus",
  "critChance",
  "critDamage",
  "luck",
  "xpMultiplier",
] as const satisfies readonly (keyof PlayerBaseStats)[];

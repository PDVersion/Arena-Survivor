import { critTierMultiplier } from "../../core/combat/crit";

/**
 * A coarse model of how a player's damage output grows with level.
 *
 * These are deliberately simple closed forms rather than a replay of the
 * upgrade system: the simulator answers pacing questions ("when do levels
 * arrive, does income keep up with the curve"), not build questions. Treat the
 * numbers as a band, not a prediction.
 */
export interface BuildModel {
  readonly id: string;
  readonly description: string;
  /** Sustained damage per second at a given player level. */
  readonly damagePerSecond: (level: number, context: BuildContext) => number;
}

export interface BuildContext {
  /** Base weapon damage before any bonus. */
  readonly weaponDamage: number;
  /** Base weapon cooldown in milliseconds. */
  readonly weaponCooldownMs: number;
  /** Base crit chance, where 1 means 100%. */
  readonly baseCritChance: number;
  /** Crit damage multiplier per tier. */
  readonly critDamage: number;
  /** Live enemies at this moment, for models whose output scales with density. */
  readonly liveEnemies: number;
}

function baseDps(context: BuildContext): number {
  return (context.weaponDamage * 1000) / context.weaponCooldownMs;
}

/** Expected damage multiplier from an uncapped crit chance, per REC-031. */
export function expectedCritMultiplier(critChance: number, critDamage: number): number {
  const chance = Math.max(0, critChance);
  const guaranteed = Math.floor(chance);
  const fraction = chance - guaranteed;
  const lower = critTierMultiplier(guaranteed);
  const upper = critTierMultiplier(guaranteed + 1);
  const scale = critDamage / 2;
  return (lower * (1 - fraction) + upper * fraction) * (guaranteed > 0 ? scale ** guaranteed : 1);
}

const models: readonly BuildModel[] = [
  {
    id: "passive",
    description: "Takes no offensive upgrades. The floor of the DPS band.",
    damagePerSecond: (_level, context) =>
      baseDps(context) * expectedCritMultiplier(context.baseCritChance, context.critDamage),
  },
  {
    id: "damage-rush",
    description: "Every level takes the additive damage upgrade (+25% of base).",
    damagePerSecond: (level, context) =>
      baseDps(context) *
      (1 + 0.25 * (level - 1)) *
      expectedCritMultiplier(context.baseCritChance, context.critDamage),
  },
  {
    id: "crit",
    description: "Alternates crit chance and attack speed, reaching overcrit tiers.",
    damagePerSecond: (level, context) => {
      const critLevels = Math.floor((level - 1) / 2);
      const speedLevels = Math.ceil((level - 1) / 2);
      const critChance = context.baseCritChance + 0.1 * critLevels;
      return (
        baseDps(context) *
        (1 + 0.2 * speedLevels) *
        expectedCritMultiplier(critChance, context.critDamage)
      );
    },
  },
  {
    id: "spread",
    description:
      "Spreads picks across damage, attack speed, crit and projectiles: the multiplicative build the DPS budget is written for.",
    damagePerSecond: (level, context) => {
      // A real player does not pour every level into one axis. Roughly a fifth
      // of picks land on each offensive axis, and those axes multiply.
      const perAxis = Math.floor((level - 1) / 5);
      const projectiles = 1 + Math.min(6, perAxis);
      const critChance = context.baseCritChance + 0.1 * perAxis;
      return (
        baseDps(context) *
        (1 + 0.25 * perAxis) *
        (1 + 0.2 * perAxis) *
        projectiles *
        expectedCritMultiplier(critChance, context.critDamage)
      );
    },
  },
  {
    id: "explosion",
    description:
      "Splits between damage and on-kill detonation; output rises with enemy density.",
    damagePerSecond: (level, context) => {
      const damageLevels = Math.floor((level - 1) / 2);
      const densityBonus = 1 + Math.min(2, context.liveEnemies / 40);
      return (
        baseDps(context) *
        (1 + 0.25 * damageLevels) *
        densityBonus *
        expectedCritMultiplier(context.baseCritChance, context.critDamage)
      );
    },
  },
];

export const buildModels: readonly BuildModel[] = Object.freeze(models);

export function findBuildModel(id: string): BuildModel | undefined {
  return buildModels.find((model) => model.id === id);
}

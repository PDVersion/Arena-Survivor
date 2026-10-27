import { critTierMultiplier } from "../../core/combat/crit";
import type { SkillEffectDefinition, WeaponDefinition } from "../../core/archetypes/contracts";

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
  readonly cappedCrit?: boolean;
  readonly secondaryWeapon?: WeaponDefinition;
  readonly evolvedWeapon?: WeaponDefinition;
  /** Earliest level after acquisition, prerequisite picks and the evolution choice. */
  readonly evolutionLevel?: number;
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
  readonly collectionSweep?: Extract<SkillEffectDefinition, { kind: "collection_sweep" }>;
}

function baseDps(context: BuildContext): number {
  return (context.weaponDamage * 1000) / context.weaponCooldownMs;
}

/** Expected damage multiplier from an uncapped crit chance, per REC-031. */
export function expectedCritMultiplier(critChance: number, critDamage: number, cappedLinear = false): number {
  const chance = Math.max(0, critChance);
  const guaranteed = Math.floor(chance);
  const fraction = chance - guaranteed;
  if (cappedLinear) {
    const gain = (tier: number) => Math.min(4, 1 + (critDamage - 1) * Math.min(3, tier));
    return gain(guaranteed) * (1 - fraction) + gain(guaranteed + 1) * fraction;
  }
  const lower = critTierMultiplier(guaranteed);
  const upper = critTierMultiplier(guaranteed + 1);
  const scale = critDamage / 2;
  return (lower * (1 - fraction) + upper * fraction) * (guaranteed > 0 ? scale ** guaranteed : 1);
}

function secondaryDps(context: BuildContext, packed: boolean, level: number, weapon = context.secondaryWeapon): number {
  if (!weapon) return 0;
  const targetCap = weapon.deliveryKind === "melee" ? weapon.targetCap === null ? null : weapon.targetCap +
    (weapon.targetGrowth ? Math.min(weapon.targetGrowth.maxPicks, Math.max(0, level - 2)) * weapon.targetGrowth.perPick : 0) : 1;
  const targets = packed ? Math.min(context.liveEnemies, targetCap ?? context.liveEnemies) : Math.min(1, context.liveEnemies);
  const neighbours = packed && weapon.splash ? Math.min(weapon.splash.targetCap, Math.max(0, context.liveEnemies - 1)) : 0;
  return weapon.damage * 1000 / weapon.cooldownMs * targets * (1 + neighbours * (weapon.splash?.damageMultiplier ?? 0));
}

const models: readonly BuildModel[] = [
  ...[false, true].map((packed): BuildModel => ({
    id: packed ? "evolved-packed" : "evolved-single",
    description: "Acquires second tool at level2, buys one owned reach/capacity pick each subsequent level, then evolves. Authored contact band, no movement/overkill/offer-frequency model.",
    damagePerSecond: (level, context) => {
      const weapon = context.evolutionLevel && level >= context.evolutionLevel ? context.evolvedWeapon : context.secondaryWeapon;
      return (baseDps(context) + (level >= 2 ? secondaryDps(context, packed, level, weapon) : 0)) *
        expectedCritMultiplier(context.baseCritChance, context.critDamage, context.cappedCrit);
    },
  })),
  ...[false, true].map((packed): BuildModel => ({
    id: packed ? "two-tools-packed" : "two-tools-single",
    description: packed ? "Second tool at level2, then owned track picks; authored target/splash caps with packed targets. Ideal-contact upper band, no overkill model."
      : "Second tool at level2; one target in reach, no splash neighbours. Contact-only lower band.",
    damagePerSecond: (level, context) => (baseDps(context) + (level >= 2 ? secondaryDps(context, packed, level) : 0)) *
      expectedCritMultiplier(context.baseCritChance, context.critDamage, context.cappedCrit),
  })),
  {
    id: "passive",
    description: "Takes no offensive upgrades. The floor of the DPS band.",
    damagePerSecond: (_level, context) =>
      baseDps(context) * expectedCritMultiplier(context.baseCritChance, context.critDamage, context.cappedCrit),
  },
  {
    id: "damage-rush",
    description: "Every level takes the additive damage upgrade (+25% of base).",
    damagePerSecond: (level, context) =>
      baseDps(context) *
      (1 + 0.25 * (level - 1)) *
      expectedCritMultiplier(context.baseCritChance, context.critDamage, context.cappedCrit),
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
        expectedCritMultiplier(critChance, context.critDamage, context.cappedCrit)
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
        expectedCritMultiplier(critChance, context.critDamage, context.cappedCrit)
      );
    },
  },
  {
    id: "collection-sweep",
    description: "Buys Collection Sweep through level five; assumes each authored sweep circle catches one target.",
    damagePerSecond: (level, context) => {
      const effect = context.collectionSweep;
      const sweepLevel = Math.min(5, Math.max(0, level - 1));
      if (!effect || sweepLevel === 0) return baseDps(context);
      const cadence = sweepLevel < 5
        ? effect.triggerEvery[sweepLevel - 1]!
        : (effect.levelFiveInterval.min + effect.levelFiveInterval.max) / 2;
      const positions = sweepLevel < 4
        ? 1
        : sweepLevel === 4
        ? 2
        : 2 + effect.levelFiveExtraPositions.min + effect.levelFiveExtraPositions.max;
      const extraDamagePerAttack = positions / cadence * effect.damageMultiplier;
      return baseDps(context) * (1 + extraDamagePerAttack) *
        expectedCritMultiplier(context.baseCritChance, context.critDamage, context.cappedCrit);
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
        expectedCritMultiplier(context.baseCritChance, context.critDamage, context.cappedCrit)
      );
    },
  },
];

export const buildModels: readonly BuildModel[] = Object.freeze(models);

export function findBuildModel(id: string): BuildModel | undefined {
  return buildModels.find((model) => model.id === id);
}

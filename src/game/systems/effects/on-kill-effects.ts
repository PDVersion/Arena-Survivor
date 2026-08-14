export interface PositionedTarget {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly active: boolean;
}

export interface BloodlustConfig {
  readonly windowMs: number;
  readonly killsPerStep: number;
  readonly attackSpeedPerStep: number;
}

export function targetsWithinRadius<T extends PositionedTarget>(
  targets: readonly T[],
  centre: Readonly<{ x: number; y: number }>,
  radius: number,
): readonly T[] {
  const radiusSquared = Math.max(0, radius) ** 2;
  return targets.filter((target) =>
    target.active && (target.x - centre.x) ** 2 + (target.y - centre.y) ** 2 <= radiusSquared,
  );
}

export function shouldFracture(chance: number, random: () => number): boolean {
  return random() < Math.min(1, Math.max(0, chance));
}

export function selectBloodlust(
  killTimesMs: readonly number[],
  nowMs: number,
  config: BloodlustConfig,
): Readonly<{ killTimesMs: readonly number[]; attackSpeedBonus: number }> {
  const retained = killTimesMs.filter((time) => time > nowMs - config.windowMs && time <= nowMs);
  const steps = Math.floor(retained.length / Math.max(1, config.killsPerStep));
  return Object.freeze({
    killTimesMs: Object.freeze(retained),
    attackSpeedBonus: steps * config.attackSpeedPerStep,
  });
}

export function shouldExplodeOnKill(
  damageSource: "direct" | "explosion" | "chained_explosion",
  explosionEnabled: boolean,
  chainReactionEnabled: boolean,
): boolean {
  return explosionEnabled && (damageSource === "direct" || chainReactionEnabled);
}

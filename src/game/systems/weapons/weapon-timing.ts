export function attackCooldownMs(
  baseCooldownMs: number,
  attackSpeedBonus: number,
  transientAttackSpeedBonus = 0,
): number {
  const multiplier = Math.max(0.01, 1 + attackSpeedBonus + transientAttackSpeedBonus);
  return baseCooldownMs / multiplier;
}

export function projectileSpreadAngles(baseAngle: number, projectileCount: number): readonly number[] {
  const count = Math.max(1, Math.floor(projectileCount));
  return Object.freeze(
    Array.from({ length: count }, (_, index) => baseAngle + (index - (count - 1) / 2) * 0.12),
  );
}

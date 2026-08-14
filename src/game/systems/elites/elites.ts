export function shouldSpawnElite(
  chance: number,
  random: () => number,
  inherited?: boolean,
): boolean {
  if (inherited !== undefined) return inherited;
  return random() < Math.max(0, Math.min(1, chance));
}

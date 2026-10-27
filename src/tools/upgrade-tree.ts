import type { UpgradeId } from "../game/core/archetypes/ids";
/** Clicking an acquired node removes that node and its descendants. Base clears the path. */
export function toggleTreeLevel(currentPicks: number, clickedLevel: number, maxPicks: number): number {
  if (clickedLevel <= 1) return 0;
  const wanted = Math.max(0, Math.min(maxPicks, clickedLevel - 1));
  return wanted <= currentPicks ? wanted - 1 : wanted;
}
export function clearToolBranches(picks: Partial<Record<UpgradeId, number>>, ids: readonly UpgradeId[]): Partial<Record<UpgradeId, number>> {
  return { ...picks, ...Object.fromEntries(ids.map((id) => [id, 0])) };
}

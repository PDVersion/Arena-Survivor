import type { CleanupToolDefinition } from "../../core/archetypes/contracts";
import type { UpgradeId } from "../../core/archetypes/ids";
export function resolveCleanupTool(tool: CleanupToolDefinition, picks: readonly UpgradeId[]): CleanupToolDefinition {
  const result = { ...tool };
  for (const track of tool.tracks) {
    const level = Math.min(4, picks.filter((id) => id === track.id).length);
    Object.assign(result, { [track.stat]: result[track.stat] + level * track.step });
  }
  return result;
}
/** Head leads along the tangent; handle trails. No sprite measurements enter collision. */
export function orbitHead(angle: number, radius: number): { x: number; y: number; rotation: number } {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, rotation: angle + Math.PI / 2 };
}

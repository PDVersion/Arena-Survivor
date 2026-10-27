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
/** Validate base and full-track extremes before any scheduler consumes them. */
export function validateCleanupTool(tool: CleanupToolDefinition): readonly string[] {
  const issues: string[] = [];
  if (!["aura", "bin", "orbit"].includes(tool.kind)) issues.push("unsupported cleanup kind");
  if (new Set(tool.tracks.map((track) => track.id)).size !== tool.tracks.length) issues.push("duplicate cleanup track");
  const full = resolveCleanupTool(tool, tool.tracks.flatMap((track) => Array<UpgradeId>(4).fill(track.id)));
  for (const value of [tool, full]) {
    for (const key of ["radius", "damage", "tickMs", "speed", "flightMs", "fuseMs", "headRadius", "displayWidth"] as const) {
      if (!Number.isFinite(value[key]) || value[key] <= 0) issues.push(`cleanup ${key} must stay positive`);
    }
    if (!Number.isFinite(value.slow) || value.slow < 0 || value.slow >= 1) issues.push("cleanup slow must stay below immunity");
    if (![value.count, value.rows].every((n) => Number.isSafeInteger(n) && n > 0) || value.count * value.rows > 64) issues.push("cleanup contact population exceeds bounded budget");
    if (!Number.isFinite(value.dotDamage) || value.dotDamage < 0) issues.push("cleanup DOT damage cannot be negative");
  }
  return [...new Set(issues)];
}

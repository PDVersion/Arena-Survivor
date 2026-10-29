import type { CleanupToolDefinition } from "../../core/archetypes/contracts";
import type { UpgradeId } from "../../core/archetypes/ids";
export function resolveCleanupTool(tool: CleanupToolDefinition, picks: readonly UpgradeId[]): CleanupToolDefinition {
  const step = tool.progression?.levels[Math.min(tool.progression.levels.length - 1, picks.filter((id) => id === tool.progression!.id).length)];
  const result = { ...tool, ...step };
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
  if (!["aura", "bin", "orbit", "beam"].includes(tool.kind)) issues.push("unsupported cleanup kind");
  if (new Set(tool.tracks.map((track) => track.id)).size !== tool.tracks.length) issues.push("duplicate cleanup track");
  const full = resolveCleanupTool(tool, tool.tracks.flatMap((track) => Array<UpgradeId>(4).fill(track.id)));
  for (const value of [tool, full, ...(tool.progression?.levels.map((_, i) => resolveCleanupTool(tool, Array<UpgradeId>(i).fill(tool.progression!.id))) ?? [])]) {
    for (const key of ["radius", "damage", "tickMs", "speed", "flightMs", "fuseMs", "headRadius", "displayWidth"] as const) {
      if (!Number.isFinite(value[key]) || value[key] <= 0) issues.push(`cleanup ${key} must stay positive`);
    }
    if (!Number.isFinite(value.slow) || value.slow < 0 || value.slow >= 1) issues.push("cleanup slow must stay below immunity");
    if (![value.count, value.rows].every((n) => Number.isSafeInteger(n) && n > 0) || value.count * value.rows > 64) issues.push("cleanup contact population exceeds bounded budget");
    if (!Number.isFinite(value.dotDamage) || value.dotDamage < 0) issues.push("cleanup DOT damage cannot be negative");
  }
  return [...new Set(issues)];
}

/** Distance along a normalized ray to the current camera edge, including offscreen starts. */
export function sweepReach(x: number, y: number, dx: number, dy: number, view: { x: number; y: number; width: number; height: number }): number {
  const tx = dx > 0 ? (view.x + view.width - x) / dx : dx < 0 ? (view.x - x) / dx : Infinity;
  const ty = dy > 0 ? (view.y + view.height - y) / dy : dy < 0 ? (view.y - y) / dy : Infinity;
  return Math.max(0, Math.min(tx, ty));
}
/** Swept contact avoids tunnelling when a fast head crosses a target between frames. */
export function sweepContact(x: number, y: number, ax: number, ay: number, bx: number, by: number, radius: number): boolean {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy) <= radius;
}

import type { PacingReport, TimeToKillRow } from "./pacing-simulator";

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

function padLeft(value: string, width: number): string {
  return value.length >= width ? value : " ".repeat(width - value.length) + value;
}

function clock(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function compact(value: number): string {
  if (value >= 10_000) return `${Math.round(value / 1000)}k`;
  if (value >= 100) return String(Math.round(value));
  return value.toFixed(1).replace(/\.0$/, "");
}

/** Render a pacing report as a fixed-width text table for the terminal. */
export function formatPacingReport(report: PacingReport): string {
  const lines: string[] = [];
  lines.push(
    `theme ${report.themeId}  ·  build ${report.buildId}  ·  ${clock(report.durationMs)} run  ·  chaos x${report.chaos.toFixed(1)}`,
  );
  lines.push("");
  lines.push(
    [
      pad("time", 7),
      padLeft("lvl", 4),
      padLeft("dps", 8),
      padLeft("spawned", 8),
      padLeft("live", 6),
      padLeft("kills", 7),
      padLeft("xp", 8),
      padLeft("total xp", 9),
    ].join(" "),
  );
  lines.push("-".repeat(62));

  for (const bucket of report.buckets) {
    const spawned = Object.values(bucket.spawnedByRole).reduce((total, count) => total + count, 0);
    lines.push(
      [
        pad(clock(bucket.endMs), 7),
        padLeft(String(bucket.level), 4),
        padLeft(compact(bucket.damagePerSecond), 8),
        padLeft(String(spawned), 8),
        padLeft(String(bucket.liveEnemies), 6),
        padLeft(String(bucket.kills), 7),
        padLeft(compact(bucket.xpEarned), 8),
        padLeft(compact(bucket.cumulativeXp), 9),
      ].join(" "),
    );
  }

  lines.push("-".repeat(62));
  lines.push(
    `final level ${report.finalLevel}  ·  kills ${report.totalKills}  ·  peak live ${report.peakLiveEnemies}  ·  total xp ${Math.round(report.totalXp)}`,
  );

  const milestones = [5, 10, 15, 20, 25, 30]
    .map((level) => {
      const at = report.levelTimestampsMs[level - 2];
      return at === undefined ? null : `L${level} ${clock(at)}`;
    })
    .filter((entry): entry is string => entry !== null);
  if (milestones.length > 0) lines.push(`reached  ${milestones.join("  ·  ")}`);

  const roles = new Map<string, number>();
  for (const bucket of report.buckets) {
    for (const [role, count] of Object.entries(bucket.spawnedByRole)) {
      roles.set(role, (roles.get(role) ?? 0) + count);
    }
  }
  if (roles.size > 0) {
    lines.push(
      `spawned  ${[...roles.entries()].map(([role, count]) => `${role} ${count}`).join("  ·  ")}`,
    );
  }

  return lines.join("\n");
}

/** The time-to-kill table, which is how the balance pass is actually decided. */
export function formatTimeToKill(
  rows: readonly TimeToKillRow[],
  roleIds: readonly string[],
): string {
  const shortName = (id: string): string => id.replace(/^enemy\./, "").slice(0, 9);
  const lines: string[] = [];
  lines.push(
    [pad("at", 7), padLeft("lvl", 4), padLeft("dps", 8), ...roleIds.map((id) => padLeft(shortName(id), 10))].join(" "),
  );
  lines.push("-".repeat(29 + roleIds.length * 11));

  // Every second bucket keeps the table readable without hiding a divergence.
  for (const row of rows.filter((_, index) => index % 2 === 1)) {
    lines.push(
      [
        pad(`${Math.round(row.progress * 100)}%`, 7),
        padLeft(String(row.level), 4),
        padLeft(compact(row.damagePerSecond), 8),
        ...roleIds.map((id) => padLeft(`${round(row.seconds[id] ?? 0)}s`, 10)),
      ].join(" "),
    );
  }
  return lines.join("\n");
}

function round(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 100) return String(Math.round(value));
  return value.toFixed(value < 1 ? 2 : 1);
}

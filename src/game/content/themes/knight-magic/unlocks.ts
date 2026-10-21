import { archetypeIds } from "../../../core/archetypes/ids";
export const unlocks = [
  { kind: "weapon", id: archetypeIds.weapon.secondary, metric: "runsPlayed", required: 1 },
  { kind: "upgrade", id: archetypeIds.upgrade.bloodlust, metric: "totalKills", required: 25 },
] as const;

import { archetypeIds } from "../../../core/archetypes/ids";
import type { CurseDefinition, UpgradeDefinition } from "../../../core/archetypes/contracts";

export const curses = [
  { id: archetypeIds.curse.frenzy, chaosIncrease: 0, enemySpawnMultiplier: 1.3,
    xpMultiplier: 1.2, presentationToken: "shrine" },
  { id: archetypeIds.curse.escalation, chaosIncrease: 0.8, enemySpawnMultiplier: 1,
    xpMultiplier: 1.25, presentationToken: "shrine" },
] as const satisfies readonly CurseDefinition[];

export const curseOffers = [
  { id: archetypeIds.upgrade.acceptFrenzy,
    effects: [{ kind: "curse.accept", curseId: archetypeIds.curse.frenzy }],
    maxLevel: 1, track: "general", rarity: "rare", category: "world", presentationToken: "shrine" },
  { id: archetypeIds.upgrade.acceptEscalation,
    effects: [{ kind: "curse.accept", curseId: archetypeIds.curse.escalation }],
    maxLevel: 1, track: "general", rarity: "rare", category: "world", presentationToken: "shrine" },
] as const satisfies readonly UpgradeDefinition[];

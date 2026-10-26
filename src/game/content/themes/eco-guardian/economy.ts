import type { EconomyDefinition } from "../../../systems/economy/economy";
export const economy = {
  criticalPresentation: [{ colour: "#facc15", size: 20 }, { colour: "#ffffff", size: 26 }, { colour: "#ef4444", size: 30 }],
  denominations: [4, 25], dropChances: { magnet: 0.003, food: 0.005, impact: 0.004 },
  fortuneScale: 0.01, maxDropChance: 0.08, foodHealth: 20, impactValue: 1, mergeDistance: 28,
  fragmentation: { chance: 0.75, fortuneReduction: 0.004, cleanHitReduction: 0.12, critReduction: 0.4,
    parentShare: 0.75, totalShare: 1.1, childCount: 2 },
  shop: [
    { id: "shop.safety", name: "Durable Safety Gear", description: "+5 maximum health each level.", maxLevel: 5, baseCost: 5, costGrowth: 1.7, stat: "maxHealth", perLevel: 5 },
    { id: "shop.tools", name: "Tool Maintenance", description: "+5% tool damage each level.", maxLevel: 5, baseCost: 6, costGrowth: 1.7, stat: "damageBonus", perLevel: 0.05 },
    { id: "shop.fortune", name: "Community Connections", description: "+5 Fortune each level.", maxLevel: 5, baseCost: 5, costGrowth: 1.7, stat: "luck", perLevel: 5 },
    { id: "shop.boots", name: "Reliable Boots", description: "+5 movement speed each level.", maxLevel: 5, baseCost: 4, costGrowth: 1.7, stat: "moveSpeed", perLevel: 5 },
  ],
} as const satisfies EconomyDefinition;

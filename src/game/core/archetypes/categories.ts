export const eventSourceCategories = [
  "ambient",
  "weapon",
  "enemy",
  "skill",
  "shrine",
  "world",
] as const;

export type EventSourceCategory = (typeof eventSourceCategories)[number];

export const feedbackCategories = [
  "damage",
  "critical",
  "overcritical",
  "pierce",
  "explosion",
  "shrine",
  "elite",
] as const;

export type FeedbackCategory = (typeof feedbackCategories)[number];

export const eliteIds = { baseline: "elite.baseline", split: "elite.split", shield: "elite.shield", acceleration: "elite.acceleration" } as const;
export type EliteId = (typeof eliteIds)[keyof typeof eliteIds];

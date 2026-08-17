import { defineTheme } from "../../define-theme";
import { characters } from "./characters";
import { enemies } from "./enemies";
import { copy } from "./copy";
import { tokens } from "./tokens";
import { weapons } from "./weapons";
import { pickups } from "./pickups";
import { upgrades } from "./upgrades";
import { shrines } from "./shrines";
import { skills } from "./skills";
import { elites } from "./elites";
import { progression } from "./progression";
import { director } from "./director";
import { difficulty } from "./difficulty";

/**
 * The production theme from V0.3 onward.
 *
 * Waste and pollution rather than knights and magic. Enemy health is derived
 * from how long each material persists in the environment (see `enemies.ts`),
 * which is the first step toward the mechanics-as-lesson design in
 * `build/EDUCATION_PIVOT.md`. No type system, facts, or knowledge layer here —
 * those are later milestones.
 */
export const ecoGuardianTheme = defineTheme({
  id: "eco_guardian",
  schemaVersion: 1,
  copy,
  tokens,
  characters,
  weapons,
  enemies,
  pickups,
  upgrades,
  shrines,
  skills,
  elites,
  tuning: { progression, director, difficulty },
});

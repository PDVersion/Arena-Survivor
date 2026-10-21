import { unlocks } from "./unlocks";
import type { UpgradeDefinition } from "../../../core/archetypes/contracts";
import { defineTheme } from "../../define-theme";
import { characters } from "./characters";
import { enemies } from "./enemies";
import { copy } from "./copy";
import { tokens } from "./tokens";
import { sprites } from "./sprites";
import { weapons, weaponSlotCount, weaponAcquisition, weaponEvolution } from "./weapons";
import { pickups } from "./pickups";
import { upgrades, upgradeTierTuning } from "./upgrades";
import { curses, curseOffers } from "./curses";
import { shrines, shrineTuning } from "./shrines";
import { skills } from "./skills";
import { elites } from "./elites";
import { progression } from "./progression";
import { director } from "./director";
import { difficulty } from "./difficulty";
import { difficultyPresets } from "./difficulty-presets";
import { bodies } from "./bodies";
import { hazards, hazardTuning } from "./hazards";
import { view } from "./view";
import { pace } from "./pace";

export const knightMagicTheme = defineTheme({
  id: "knight_magic",
  schemaVersion: 1,
  unlocks,
  copy,
  // Sprites are merged in here rather than authored in `tokens.ts`, so the
  // sprite roster and the palette stay in separate files.
  tokens: { ...tokens, sprites },
  characters,
  weapons,
  weaponSlotCount,
  enemies,
  pickups,
  upgrades: [...upgrades, ...curseOffers, weaponAcquisition, weaponEvolution, ...weapons.flatMap<UpgradeDefinition>((weapon) => weapon.upgrades)],
  shrines,
  curses,
  skills,
  elites,
  hazards,
  tuning: {
    difficultyPresets,
    view,
    pace,
    progression,
    director,
    difficulty,
    bodies,
    hazards: hazardTuning,
    shrines: shrineTuning,
    upgradeTiers: upgradeTierTuning,
  },
});

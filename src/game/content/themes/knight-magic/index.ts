import { defineTheme } from "../../define-theme";
import { characters } from "./characters";
import { enemies } from "./enemies";
import { copy } from "./copy";
import { tokens } from "./tokens";
import { weapons } from "./weapons";
import { pickups } from "./pickups";
import { upgrades, upgradeTierTuning } from "./upgrades";
import { shrines, shrineTuning } from "./shrines";
import { skills } from "./skills";
import { elites } from "./elites";
import { progression } from "./progression";
import { director } from "./director";
import { difficulty } from "./difficulty";
import { bodies } from "./bodies";
import { hazards, hazardTuning } from "./hazards";

export const knightMagicTheme = defineTheme({
  id: "knight_magic",
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
  hazards,
  tuning: {
    progression,
    director,
    difficulty,
    bodies,
    hazards: hazardTuning,
    shrines: shrineTuning,
    upgradeTiers: upgradeTierTuning,
  },
});

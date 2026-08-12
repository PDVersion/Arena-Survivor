import { defineTheme } from "../../define-theme";
import { characters } from "./characters";
import { enemies } from "./enemies";
import { copy } from "./copy";
import { tokens } from "./tokens";
import { weapons } from "./weapons";

export const knightMagicTheme = defineTheme({
  id: "knight_magic",
  schemaVersion: 1,
  copy,
  tokens,
  characters,
  weapons,
  enemies,
});

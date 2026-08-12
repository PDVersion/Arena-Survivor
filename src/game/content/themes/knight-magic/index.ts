import { defineTheme } from "../../define-theme";
import { characters } from "./characters";
import { copy } from "./copy";
import { tokens } from "./tokens";

export const knightMagicTheme = defineTheme({
  id: "knight_magic",
  schemaVersion: 1,
  copy,
  tokens,
  characters,
});

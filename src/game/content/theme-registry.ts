import type { ThemeManifest } from "../core/archetypes/contracts";
import { knightMagicTheme } from "./themes/knight-magic";

export interface ThemeRegistryEntry {
  /** Directory name under `themes/`, used as the CLI-friendly key. */
  readonly key: string;
  readonly id: string;
  readonly theme: ThemeManifest;
}

/**
 * Every production theme pack.
 *
 * This is a tooling and validation surface, not the runtime selection point —
 * `active-theme.ts` remains the single place the game chooses a theme, so the
 * production bundle never pulls in a pack it does not render.
 */
export const themeRegistry: readonly ThemeRegistryEntry[] = Object.freeze([
  Object.freeze({ key: "knight-magic", id: knightMagicTheme.id, theme: knightMagicTheme }),
]);

import Phaser from "phaser";
import type { ThemeManifest } from "../../core/archetypes/contracts";
import { spriteEntries } from "./resolve-sprite";

/**
 * Queue a theme's sprite sheets.
 *
 * Called from the boot scene's `preload`. A pack with no sprites queues
 * nothing and the loader completes immediately, which is the state both
 * production packs ship in today.
 *
 * Filtering is applied per texture rather than through Phaser's `pixelArt`
 * flag. `pixelArt: true` also sets `antialias: false` and `roundPixels: true`
 * for the whole game, which hardens the edge of every primitive — and
 * primitives are not going away: `knight-magic` has no sprite roster at all,
 * the floor grid stays procedural, and new content renders as a primitive
 * until someone draws it. Nearest-neighbour belongs on the pixel art and
 * nowhere else. See REC-073.
 *
 * @returns how many sheets were queued, so a caller can log or assert on it.
 */
export function loadThemeSprites(
  scene: Phaser.Scene,
  theme: Pick<ThemeManifest, "tokens">,
): number {
  const entries = spriteEntries(theme.tokens);
  if (entries.length === 0) return 0;

  for (const [, definition] of entries) {
    scene.load.spritesheet(definition.key, definition.path, {
      frameWidth: definition.frameWidth,
      frameHeight: definition.frameHeight,
    });
  }

  scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
    for (const [, definition] of entries) {
      // Filtering has to be set after load: the texture does not exist before.
      scene.textures.get(definition.key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  });

  return entries.length;
}

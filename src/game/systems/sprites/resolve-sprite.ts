import type { SpriteDefinition, ThemeTokens } from "../../core/archetypes/contracts";
import type { ContentId } from "../../core/archetypes/ids";

/**
 * Resolving a sprite, and nothing else.
 *
 * Deliberately free of Phaser so it can be unit-tested — `vitest.config.ts`
 * runs in a node environment, and everything that touches the renderer is
 * covered by the browser suite instead.
 */

/** The sprite for a content id, or `undefined` if this pack has none. */
export function resolveSprite(
  tokens: Pick<ThemeTokens, "sprites">,
  contentId: ContentId,
): SpriteDefinition | undefined {
  return tokens.sprites?.[contentId];
}

/** Every declared sprite, in a shape the loader and the tooling can iterate. */
export function spriteEntries(
  tokens: Pick<ThemeTokens, "sprites">,
): readonly (readonly [ContentId, SpriteDefinition])[] {
  const sprites = tokens.sprites;
  if (!sprites) return [];
  return Object.entries(sprites).filter(
    (entry): entry is [ContentId, SpriteDefinition] => entry[1] !== undefined,
  );
}

import type { SpriteDefinition } from "../../core/archetypes/contracts";

export function isAtlasSprite(definition: SpriteDefinition): boolean {
  return definition.path.endsWith("/atlas.png");
}

export function atlasTextureKey(path: string): string {
  return `sprite_atlas.${path.replace(/[^a-z0-9]+/gi, "_")}`;
}

export function runtimeTextureKey(definition: SpriteDefinition): string {
  return isAtlasSprite(definition) ? atlasTextureKey(definition.path) : definition.key;
}

export function runtimeFrame(
  definition: SpriteDefinition,
  frame: number,
): number | string {
  return isAtlasSprite(definition) ? `${definition.key}/${frame}` : frame;
}

import Phaser from "phaser";

/**
 * UI type is rendered to a larger private canvas before WebGL scales it.
 *
 * Camera zoom intentionally enlarges the world, but fixed UI passes through
 * that camera too. A higher text texture resolution preserves hard glyph edges
 * at 2×, while bottom padding prevents serif descenders being clipped by the
 * browser canvas' font metrics.
 */
export const UI_TEXT_RESOLUTION = 4;
export const UI_SCALE = 1.25;

export interface UiViewport {
  readonly centreX: number;
  readonly centreY: number;
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
}

/** Authored UI viewport that scales up without leaving the physical screen. */
export function uiViewport(scene: Phaser.Scene): UiViewport {
  const centreX = scene.scale.width / 2;
  const centreY = scene.scale.height / 2;
  const width = scene.scale.width / UI_SCALE;
  const height = scene.scale.height / UI_SCALE;
  return { centreX, centreY, width, height, left: centreX - width / 2, top: centreY - height / 2 };
}

/** Counter the world camera zoom, then apply the intentional UI scale. */
export function configureUiContainer(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
): Phaser.GameObjects.Container {
  const zoom = scene.cameras.main.zoom || 1;
  const scale = UI_SCALE / zoom;
  const centreX = scene.scale.width / 2;
  const centreY = scene.scale.height / 2;
  return container
    .setPosition(centreX * (1 - scale), centreY * (1 - scale))
    .setScale(scale)
    .setScrollFactor(0, 0, true);
}

/** Convert a pointer back into the authored UI coordinate system. */
export function uiPointer(scene: Phaser.Scene, pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 {
  const { centreX, centreY } = uiViewport(scene);
  return new Phaser.Math.Vector2(
    centreX + (pointer.x - centreX) / UI_SCALE,
    centreY + (pointer.y - centreY) / UI_SCALE,
  );
}

export function addUiText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string | string[],
  style: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, { ...style, resolution: UI_TEXT_RESOLUTION })
    .setPadding(4, 4, 4, 8);
}

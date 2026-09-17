import type Phaser from "phaser";

export interface ViewSize {
  readonly width: number;
  readonly height: number;
}

export function visibleWorldSize(renderSize: ViewSize, zoom: number): ViewSize {
  if (!Number.isFinite(zoom) || zoom <= 0) throw new Error("Camera zoom must be greater than zero");
  return Object.freeze({ width: renderSize.width / zoom, height: renderSize.height / zoom });
}

export function configureRunCamera(
  camera: Phaser.Cameras.Scene2D.Camera,
  bounds: ViewSize,
  target: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform,
  zoom: number,
): void {
  camera.setBounds(0, 0, bounds.width, bounds.height);
  camera.setZoom(zoom);
  camera.startFollow(target, true, 0.12, 0.12);
}

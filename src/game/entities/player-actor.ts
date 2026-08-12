import Phaser from "phaser";
import type { CharacterDefinition, ThemeTokens } from "../core/archetypes/contracts";
import { resolveMovement, type DirectionalInput } from "../systems/player-movement";

export class PlayerActor extends Phaser.GameObjects.Rectangle {
  readonly definition: CharacterDefinition;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: CharacterDefinition,
    tokens: ThemeTokens,
  ) {
    const diameter = definition.radius * 2;
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    super(scene, x, y, diameter, diameter, colour);
    this.definition = definition;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (tokens.playerShape === "diamond") this.setRotation(Math.PI / 4);

    this.arcadeBody.setCollideWorldBounds(true);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  move(input: DirectionalInput, moveSpeed = this.definition.baseStats.moveSpeed): void {
    const velocity = resolveMovement(input, moveSpeed);
    this.arcadeBody.setVelocity(velocity.x, velocity.y);
  }

  stop(): void {
    this.arcadeBody.setVelocity(0, 0);
  }
}

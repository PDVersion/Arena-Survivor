import type Phaser from "phaser";
import type { CleanupToolDefinition, ThemeTokens, WeaponDefinition } from "../core/archetypes/contracts";
import type { EnemyActor } from "./enemy-actor";
import { orbitHead } from "../systems/weapons/cleanup-tools";
import { runtimeFrame, runtimeTextureKey } from "../systems/sprites/runtime-sprite";
interface Bin { x: number; y: number; fromX: number; fromY: number; born: number; nextTick: number; tool: CleanupToolDefinition; weapon: WeaponDefinition }
/** Bounded presentation and contact scheduler; damage always returns to the scene's lethal commit. */
export class CleanupToolRuntime {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private images: Phaser.GameObjects.Image[] = [];
  private imageCount = 0;
  private bins: Bin[] = [];
  private next = new Map<string, number>();
  private contacts = new Map<string, number>();
  constructor(private scene: Phaser.Scene, private tokens: ThemeTokens,
    private hit: (enemy: EnemyActor, damage: number, weapon: WeaponDefinition) => void) {
    this.graphics = scene.add.graphics().setDepth(16);
  }
  private draw(weapon: WeaponDefinition, x: number, y: number, width: number, rotation = 0): void {
    const sprite = this.tokens.sprites?.[weapon.id];
    if (!sprite || !this.scene.textures.exists(runtimeTextureKey(sprite))) return;
    let image = this.images[this.imageCount];
    if (!image) { image = this.scene.add.image(0, 0, runtimeTextureKey(sprite), runtimeFrame(sprite, 0)).setDepth(22); this.images.push(image); }
    image.setTexture(runtimeTextureKey(sprite), runtimeFrame(sprite, 0))
      .setPosition(x, y).setOrigin(weapon.cleanup?.kind === "orbit" ? .85 : .5, .5)
      .setDisplaySize(width, width * sprite.frameHeight / sprite.frameWidth).setRotation(rotation).setVisible(true);
    this.imageCount++;
  }
  update(now: number, player: { x: number; y: number }, tools: readonly { weapon: WeaponDefinition; tool: CleanupToolDefinition; attackRate: number }[], enemies: ReadonlySet<EnemyActor>): void {
    this.graphics.clear(); this.imageCount = 0;
    for (const [id, until] of this.contacts) if (until < now) this.contacts.delete(id);
    const area = (x: number, y: number, tool: CleanupToolDefinition, damage: number, weapon: WeaponDefinition) => {
      for (const enemy of enemies) if (enemy.active && !enemy.defeated && Math.hypot(enemy.x - x, enemy.y - y) <= tool.radius + enemy.radius) {
        if (tool.slow > 0) enemy.applySlow(now + tool.tickMs, 1 - tool.slow);
        this.hit(enemy, damage, weapon);
      }
    };
    for (const { weapon, tool, attackRate } of tools) {
      if (tool.kind === "aura") {
        this.graphics.fillStyle(0x92999d, .12).fillCircle(player.x, player.y, tool.radius)
          .lineStyle(2, 0xb5bdc2, .45).strokeCircle(player.x, player.y, tool.radius);
        if (now >= (this.next.get(weapon.id) ?? 0)) {
          area(player.x, player.y, tool, tool.damage, weapon);
          this.next.set(weapon.id, now + tool.tickMs / attackRate);
        }
      } else if (tool.kind === "bin" && now >= (this.next.get(weapon.id) ?? 0)) {
        if (this.bins.length < 20) for (let i = 0; i < tool.count && this.bins.length < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const x = player.x + Math.cos(angle) * tool.throwDistance, y = player.y + Math.sin(angle) * tool.throwDistance;
          this.bins.push({ x, y, fromX: player.x, fromY: player.y, born: now, nextTick: now + tool.flightMs, tool, weapon });
        }
        this.next.set(weapon.id, now + weapon.cooldownMs / attackRate);
      } else if (tool.kind === "orbit") {
        for (let row = 0; row < tool.rows; row++) for (let i = 0; i < tool.count; i++) {
          const head = orbitHead(now / 1000 * tool.speed + i * Math.PI * 2 / tool.count + row * .3, tool.radius + row * tool.rowSpacing);
          const x = player.x + head.x, y = player.y + head.y;
          this.draw(weapon, x, y, tool.displayWidth, head.rotation);
          this.graphics.fillStyle(0xb9c2c5, .4).fillCircle(x, y, tool.headRadius / 2);
          for (const enemy of enemies) {
            const key = `${weapon.id}:${row}:${i}:${enemy.targetId}`;
            if (enemy.active && !enemy.defeated && now >= (this.contacts.get(key) ?? 0) && Math.hypot(enemy.x - x, enemy.y - y) <= tool.headRadius + enemy.radius) {
              this.contacts.set(key, now + tool.tickMs / attackRate); this.hit(enemy, tool.damage, weapon);
            }
          }
        }
      }
    }
    this.bins = this.bins.filter((bin) => {
      const age = now - bin.born, tool = bin.tool;
      if (age >= tool.flightMs + tool.fuseMs) {
        area(bin.x, bin.y, tool, tool.damage, bin.weapon);
        // A short scene-owned fade communicates the burst without retaining the bin.
        const cue = this.scene.add.circle(bin.x, bin.y, tool.radius, 0x9ab69c, .3).setDepth(17);
        this.scene.tweens.add({ targets: cue, alpha: 0, duration: 300, onComplete: () => cue.destroy() });
        return false;
      }
      const flight = Math.min(1, age / tool.flightMs);
      const x = bin.fromX + (bin.x - bin.fromX) * flight;
      const y = bin.fromY + (bin.y - bin.fromY) * flight - Math.sin(flight * Math.PI) * 35;
      this.draw(bin.weapon, x, y, tool.displayWidth, flight < 1 ? flight * Math.PI * 2 : 0);
      if (flight === 1) {
        this.graphics.lineStyle(1, 0xa6b6a8, .45).strokeCircle(bin.x, bin.y, tool.radius);
        if (now >= bin.nextTick && age < tool.flightMs + Math.min(tool.dotMs, tool.fuseMs)) {
          area(bin.x, bin.y, tool, tool.dotDamage, bin.weapon); bin.nextTick = now + tool.tickMs;
        }
      }
      return true;
    });
    for (let i = this.imageCount; i < this.images.length; i++) this.images[i]!.setVisible(false);
  }
  destroy(): void { this.graphics.destroy(); for (const image of this.images) image.destroy(); this.images = []; this.bins = []; this.next.clear(); this.contacts.clear(); }
}

import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { StatLine, WorldLine } from "../systems/upgrades/describe-upgrade";
import type { RunSettings, SettingKey } from "../state/settings-state";

export const pauseTabs = ["stats", "upgrades", "world", "settings"] as const;
export type PauseTab = (typeof pauseTabs)[number];

export interface PauseMenuView {
  readonly stats: readonly StatLine[];
  readonly world: readonly WorldLine[];
  /** Upgrades taken, already formatted by the shared run-summary selector. */
  readonly upgrades: readonly string[];
  readonly settings: RunSettings;
}

/**
 * The pause overlay.
 *
 * Everything shown here comes from the same selectors as the upgrade cards and
 * the terminal tally, so the three surfaces cannot disagree about a number.
 */
export class PauseMenuUi {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private tab: PauseTab = "stats";
  private view?: PauseMenuView;
  private tabBounds: { readonly tab: PauseTab; readonly bounds: Phaser.Geom.Rectangle }[] = [];
  private settingBounds: { readonly key: SettingKey; readonly bounds: Phaser.Geom.Rectangle }[] = [];
  private onToggle?: (key: SettingKey) => void;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  get isOpen(): boolean {
    return this.container !== undefined;
  }

  get activeTab(): PauseTab {
    return this.tab;
  }

  show(view: PauseMenuView, onToggle: (key: SettingKey) => void): void {
    this.view = view;
    this.onToggle = onToggle;
    this.render();
  }

  /** Cycle tabs, so the overlay is usable without a pointer. */
  cycleTab(direction: 1 | -1): void {
    const index = pauseTabs.indexOf(this.tab);
    this.tab = pauseTabs[(index + direction + pauseTabs.length) % pauseTabs.length]!;
    if (this.view) this.render();
  }

  refresh(view: PauseMenuView): void {
    this.view = view;
    if (this.container) this.render();
  }

  private render(): void {
    const view = this.view;
    if (!view) return;
    this.destroyContainer();

    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;

    const panelWidth = Math.min(880, width - 32);
    const panelHeight = Math.min(600, height - 32);
    const panel = this.scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, background, 1)
      .setStrokeStyle(3, accent);
    const top = height / 2 - panelHeight / 2;
    const left = width / 2 - panelWidth / 2;

    const children: Phaser.GameObjects.GameObject[] = [panel];
    children.push(
      this.scene.add
        .text(width / 2, top + 26, this.theme.copy.vocabulary.paused, {
          color: palette.accent,
          fontFamily: "Georgia, serif",
          fontSize: "24px",
          fontStyle: "bold",
        })
        .setOrigin(0.5),
    );

    this.tabBounds = [];
    const tabWidth = (panelWidth - 48) / pauseTabs.length;
    pauseTabs.forEach((tab, index) => {
      const x = left + 24 + tabWidth * index + tabWidth / 2;
      const y = top + 68;
      const active = tab === this.tab;
      children.push(
        this.scene.add
          .rectangle(x, y, tabWidth - 8, 34, active ? accent : floor, active ? 0.85 : 1)
          .setStrokeStyle(2, accent),
        this.scene.add
          .text(x, y, this.tabLabel(tab), {
            color: active ? palette.background : palette.text,
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            fontStyle: "bold",
          })
          .setOrigin(0.5),
      );
      this.tabBounds.push({
        tab,
        bounds: new Phaser.Geom.Rectangle(x - tabWidth / 2, y - 17, tabWidth, 34),
      });
    });

    this.settingBounds = [];
    const bodyTop = top + 104;
    const rowStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      lineSpacing: 7,
    };

    if (this.tab === "stats") {
      children.push(...this.renderRows(view.stats, left, bodyTop, panelWidth, rowStyle));
    } else if (this.tab === "world") {
      children.push(...this.renderRows(view.world, left, bodyTop, panelWidth, rowStyle));
    } else if (this.tab === "upgrades") {
      const text = view.upgrades.length > 0 ? view.upgrades.join("\n") : "—";
      children.push(this.scene.add.text(left + 32, bodyTop, text, rowStyle));
    } else {
      const labels: Readonly<Record<SettingKey, string>> = {
        detailedUpgradeCards: "Detailed upgrade cards",
        reducedMotion: "Reduced motion",
        muted: "Mute audio",
      };
      (Object.keys(labels) as SettingKey[]).forEach((key, index) => {
        const y = bodyTop + index * 44;
        const on = view.settings[key];
        children.push(
          this.scene.add.text(left + 32, y, labels[key], rowStyle),
          this.scene.add
            .rectangle(left + panelWidth - 96, y + 10, 96, 30, on ? accent : floor, 1)
            .setStrokeStyle(2, accent),
          this.scene.add
            .text(left + panelWidth - 96, y + 10, on ? "ON" : "OFF", {
              ...rowStyle,
              color: on ? palette.background : palette.text,
              fontStyle: "bold",
            })
            .setOrigin(0.5),
        );
        this.settingBounds.push({
          key,
          bounds: new Phaser.Geom.Rectangle(left + panelWidth - 144, y - 5, 96, 40),
        });
      });
    }

    children.push(
      this.scene.add
        .text(width / 2, top + panelHeight - 26, "Tab / arrows to switch · Escape to resume", {
          color: palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "15px",
        })
        .setOrigin(0.5)
        .setAlpha(0.7),
    );

    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = this.scene.add.container(0, 0, children).setScrollFactor(0, 0, true).setDepth(1050);
  }

  private renderRows(
    rows: readonly { readonly label: string; readonly display: string }[],
    left: number,
    top: number,
    panelWidth: number,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.GameObject[] {
    // Two columns so a long stat list never overflows the panel.
    const perColumn = Math.ceil(rows.length / 2);
    const columns = [rows.slice(0, perColumn), rows.slice(perColumn)];
    return columns.flatMap((column, index) => {
      const x = left + 32 + index * ((panelWidth - 64) / 2);
      return [
        this.scene.add.text(x, top, column.map((row) => row.label).join("\n"), style),
        this.scene.add.text(
          x + (panelWidth - 64) / 2 - 24,
          top,
          column.map((row) => row.display).join("\n"),
          { ...style, align: "right" },
        ).setOrigin(1, 0),
      ];
    });
  }

  private tabLabel(tab: PauseTab): string {
    if (tab === "stats") return "STATS";
    if (tab === "upgrades") return this.theme.copy.vocabulary.upgradesTaken.toUpperCase();
    if (tab === "world") return this.theme.copy.vocabulary.chaos.toUpperCase();
    return "SETTINGS";
  }

  hide(): void {
    this.destroyContainer();
    this.view = undefined;
    this.onToggle = undefined;
  }

  private destroyContainer(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container?.destroy(true);
    this.container = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const tab = this.tabBounds.find((entry) => entry.bounds.contains(pointer.x, pointer.y));
    if (tab) {
      this.tab = tab.tab;
      this.render();
      return;
    }
    const setting = this.settingBounds.find((entry) => entry.bounds.contains(pointer.x, pointer.y));
    if (setting) this.onToggle?.(setting.key);
  }
}

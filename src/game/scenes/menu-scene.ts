import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { archetypeIds } from "../core/archetypes/ids";
import { createRunState } from "../state/run-state";
import { getSessionStatistics } from "../state/session-statistics";
import { cycleMinimapOpacity, getSessionSettings, toggleSetting, updateSessionSettings, type SettingKey } from "../state/settings-state";
import { selectSessionCodex, selectShrineCodex, selectUpgradeCodex } from "../systems/codex/describe-shrine";
import { selectPlayerStats, selectWorldLines } from "../systems/upgrades/describe-upgrade";
import { PauseMenuUi, type PauseTab } from "../ui/pause-menu-ui";
import { addUiText, configureUiContainer, uiPointer, uiViewport } from "../ui/ui-text";
import { updateTestTelemetry } from "../../test-support/telemetry-bridge";

type MenuAction = "start" | "info" | "settings";

/** Title screen with exactly three actions and no simulation of its own. */
export class MenuScene extends Phaser.Scene {
  private bounds: { readonly action: MenuAction; readonly rect: Phaser.Geom.Rectangle }[] = [];
  private overlay?: PauseMenuUi;
  private menuContainer?: Phaser.GameObjects.Container;

  constructor() {
    super("menu");
  }

  create(): void {
    const palette = activeTheme.tokens.palette;
    const copy = activeTheme.copy;
    const viewport = uiViewport(this);
    const centreX = viewport.centreX;
    this.cameras.main.setBackgroundColor(palette.background);
    this.drawBackdrop();

    const children: Phaser.GameObjects.GameObject[] = [
      addUiText(this, centreX, viewport.top + 120, copy.gameTitle, {
        color: palette.accent, fontFamily: "Georgia, serif", fontSize: "56px", fontStyle: "bold",
      }).setOrigin(0.5),
      addUiText(this, centreX, viewport.top + 174, copy.arenaName, {
        color: palette.text, fontFamily: "Georgia, serif", fontSize: "22px",
      }).setOrigin(0.5).setAlpha(0.75),
    ];

    const actions: readonly { action: MenuAction; label: string; y: number }[] = [
      { action: "start", label: copy.vocabulary.startAction, y: this.scale.height * 0.52 },
      { action: "info", label: "Info", y: this.scale.height * 0.62 },
      { action: "settings", label: "Settings", y: this.scale.height * 0.72 },
    ];
    this.bounds = [];
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    for (const [index, action] of actions.entries()) {
      const label = addUiText(this, centreX, action.y, action.label, {
        color: index === 0 ? palette.background : palette.text,
        fontFamily: "Georgia, serif", fontSize: "24px", fontStyle: "bold",
      }).setOrigin(0.5);
      const width = Math.max(280, label.width + 72);
      const button = this.add.rectangle(centreX, action.y, width, 54, index === 0 ? accent : floor, 1)
        .setStrokeStyle(3, accent)
        .setInteractive({ useHandCursor: true });
      children.push(button, label);
      this.bounds.push({ action: action.action, rect: new Phaser.Geom.Rectangle(centreX - width / 2, action.y - 27, width, 54) });
    }

    this.menuContainer = configureUiContainer(this, this.add.container(0, 0, children)).setDepth(10);
    this.overlay = new PauseMenuUi(this, activeTheme);
    this.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKey, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointer, this);
    this.publishTelemetry();
  }

  private drawBackdrop(): void {
    const { width, height } = this.scale;
    const palette = activeTheme.tokens.palette;
    const grid = this.add.graphics();
    grid.fillStyle(Phaser.Display.Color.HexStringToColor(palette.floor).color, 1);
    grid.fillRect(0, 0, width, height);
    grid.lineStyle(1, Phaser.Display.Color.HexStringToColor(palette.grid).color, 0.6);
    for (let x = 0; x <= width; x += 64) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 64) grid.lineBetween(0, y, width, y);
    grid.setDepth(-1);
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.code === "Escape" && this.overlay?.isOpen) {
      this.overlay.hide();
      this.menuContainer?.setVisible(true);
      this.publishTelemetry();
      return;
    }
    if (this.overlay?.isOpen) {
      if (event.code === "Tab" || event.code === "ArrowRight") this.overlay.cycleTab(1);
      if (event.code === "ArrowLeft") this.overlay.cycleTab(-1);
      if (event.code === "ArrowDown") this.overlay.cycleCodexSection(1);
      if (event.code === "ArrowUp") this.overlay.cycleCodexSection(-1);
      return;
    }
    if (event.code === "Enter" || event.code === "Space" || event.code === "NumpadEnter") this.startRun();
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    if (this.overlay?.isOpen) return;
    const point = uiPointer(this, pointer);
    const hit = this.bounds.find((entry) => entry.rect.contains(point.x, point.y));
    if (hit?.action === "start") this.startRun();
    if (hit?.action === "info") this.openOverlay("codex");
    if (hit?.action === "settings") this.openOverlay("settings");
  }

  private openOverlay(tab: PauseTab): void {
    this.menuContainer?.setVisible(false);
    this.overlay?.show(this.infoView(), (key) => this.applySetting(key), { tab, menuContext: true });
    this.publishTelemetry();
  }

  private infoView() {
    const character = activeTheme.characters.find((entry) => entry.id === archetypeIds.character.starter)!;
    const state = createRunState({
      themeId: activeTheme.id,
      characterId: character.id,
      baseStats: character.baseStats,
      xpCurve: activeTheme.tuning.progression.xpCurve,
    });
    const session = getSessionStatistics();
    return {
      stats: selectPlayerStats(state, activeTheme),
      world: selectWorldLines(state.world, activeTheme),
      upgrades: [],
      codex: selectShrineCodex(activeTheme),
      codexUpgrades: selectUpgradeCodex(activeTheme, session),
      codexSession: selectSessionCodex(activeTheme, session),
      settings: getSessionSettings(),
    };
  }

  private applySetting(key: SettingKey): void {
    const current = getSessionSettings();
    updateSessionSettings(key === "minimapOpacity" ? cycleMinimapOpacity(current) : toggleSetting(current, key));
    this.overlay?.refresh(this.infoView());
    this.publishTelemetry();
  }

  private startRun(): void {
    this.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKey, this);
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointer, this);
    this.scene.start("run");
  }

  private publishTelemetry(): void {
    const session = getSessionStatistics();
    updateTestTelemetry({
      status: "ready", scene: this.scene.key, themeId: activeTheme.id,
      canvas: { width: this.scale.width, height: this.scale.height },
      menu: {
        title: activeTheme.copy.gameTitle,
        startAction: activeTheme.copy.vocabulary.startAction,
        runsPlayed: session.runsPlayed,
        bestLevel: session.bestLevel,
        overlayOpen: Boolean(this.overlay?.isOpen),
        overlayTab: this.overlay?.activeTab ?? null,
        actions: ["start", "info", "settings"],
      },
    });
  }
}

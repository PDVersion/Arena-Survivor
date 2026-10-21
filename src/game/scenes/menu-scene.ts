import { SaveManagerUi } from "../ui/save-manager-ui";
import { describeProfile, getProfileStatus } from "../systems/persistence/profile-service";
import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { archetypeIds } from "../core/archetypes/ids";
import { createRunState } from "../state/run-state";
import { getSessionStatistics } from "../state/session-statistics";
import { cyclePresentationQuality, cycleDifficulty, cycleMinimapOpacity, getSessionSettings, toggleSetting, updateSessionSettings, type SettingKey } from "../state/settings-state";
import { difficultyIds, type DifficultyId } from "../core/archetypes/difficulty";
import { resolveDifficultyTheme } from "../systems/difficulty/resolve-difficulty";
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
  private saveManager?: SaveManagerUi;
  private menuContainer?: Phaser.GameObjects.Container;
  private difficultyBounds: { id: DifficultyId; rect: Phaser.Geom.Rectangle }[] = [];
  private difficultyButtons = new Map<DifficultyId, { button: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }>();
  private difficultyDescription?: Phaser.GameObjects.Text;

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

    const saveStatus = getProfileStatus();
    if (saveStatus.mode !== "saved") children.push(addUiText(this, centreX, viewport.top + 700, saveStatus.message, {
      color: palette.text, fontFamily: "Georgia, serif", fontSize: "17px", align: "center", wordWrap: { width: 720 },
    }).setOrigin(0.5));

    this.difficultyBounds = [];
    this.difficultyButtons.clear();
    children.push(addUiText(this, centreX, viewport.top + 228, copy.difficulty.label, {
      color: palette.text, fontFamily: "Georgia, serif", fontSize: "20px",
    }).setOrigin(0.5));
    for (const [index, id] of difficultyIds.entries()) {
      const x = centreX + (index - 1) * 244;
      const y = viewport.top + 274;
      const button = this.add.rectangle(x, y, 228, 46, 0, 0.85)
        .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(palette.accent).color);
      const label = addUiText(this, x, y, `${index + 1}. ${copy.difficulty.levels[id].name}`, {
        color: palette.text, fontFamily: "Georgia, serif", fontSize: "20px", fontStyle: "bold",
      }).setOrigin(0.5);
      children.push(button, label);
      this.difficultyButtons.set(id, { button, label });
      this.difficultyBounds.push({ id, rect: new Phaser.Geom.Rectangle(x - 114, y - 23, 228, 46) });
    }
    this.difficultyDescription = addUiText(this, centreX, viewport.top + 314, "", {
      color: palette.text, fontFamily: "Georgia, serif", fontSize: "16px",
    }).setOrigin(0.5);
    children.push(this.difficultyDescription);
    this.refreshDifficulty();

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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKey, this);
      this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointer, this);
      this.saveManager?.destroy(); this.saveManager = undefined;
      this.overlay?.hide();
    });
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
    if (this.saveManager) return;
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
    const index = ["Digit1", "Digit2", "Digit3"].indexOf(event.code);
    if (index >= 0) this.chooseDifficulty(difficultyIds[index]!);
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      updateSessionSettings(cycleDifficulty(getSessionSettings(), event.code === "ArrowLeft" ? -1 : 1));
      this.refreshDifficulty();
      this.publishTelemetry();
    }
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    if (this.saveManager || this.overlay?.isOpen) return;
    const point = uiPointer(this, pointer);
    const difficulty = this.difficultyBounds.find((entry) => entry.rect.contains(point.x, point.y));
    if (difficulty) this.chooseDifficulty(difficulty.id);
    const hit = this.bounds.find((entry) => entry.rect.contains(point.x, point.y));
    if (hit?.action === "start") this.startRun();
    if (hit?.action === "info") this.openOverlay("codex");
    if (hit?.action === "settings") this.openOverlay("settings");
  }

  private openOverlay(tab: PauseTab): void {
    this.menuContainer?.setVisible(false);
    this.overlay?.show(this.infoView(), (key) => this.applySetting(key), { tab, menuContext: true, onManageSave: () => this.openSaveManager() });
    this.publishTelemetry();
  }

  private openSaveManager(): void {
    if (this.saveManager) return;
    const inputEnabled = this.input.enabled;
    const keyboardEnabled = this.input.keyboard?.enabled;
    this.input.enabled = false;
    if (this.input.keyboard) this.input.keyboard.enabled = false;
    this.saveManager = new SaveManagerUi(activeTheme, () => {
      this.saveManager = undefined;
      this.input.enabled = inputEnabled;
      if (this.input.keyboard && keyboardEnabled !== undefined) this.input.keyboard.enabled = keyboardEnabled;
      this.refreshDifficulty();
      this.overlay?.refresh(this.infoView());
      this.publishTelemetry();
    });
    this.saveManager.show();
  }

  private infoView() {
    const theme = resolveDifficultyTheme(activeTheme, getSessionSettings().difficulty);
    const character = theme.characters.find((entry) => entry.id === archetypeIds.character.starter)!;
    const state = createRunState({
      themeId: activeTheme.id,
      characterId: character.id,
      baseStats: character.baseStats,
      xpCurve: activeTheme.tuning.progression.xpCurve,
      difficulty: getSessionSettings().difficulty,
    });
    const session = getSessionStatistics();
    return {
      stats: selectPlayerStats(state, theme),
      world: selectWorldLines(state.world, activeTheme),
      upgrades: [],
      codex: selectShrineCodex(activeTheme),
      codexUpgrades: selectUpgradeCodex(activeTheme, session),
      codexSession: [...selectSessionCodex(activeTheme, session), ...describeProfile(activeTheme)],
      settings: getSessionSettings(),
    };
  }

  private applySetting(key: SettingKey): void {
    const current = getSessionSettings();
    updateSessionSettings(key === "presentationQuality" ? cyclePresentationQuality(current) : key === "difficulty" ? cycleDifficulty(current) : key === "minimapOpacity" ? cycleMinimapOpacity(current) : toggleSetting(current, key));
    this.refreshDifficulty();
    this.overlay?.refresh(this.infoView());
    this.publishTelemetry();
  }

  private startRun(): void {
    this.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleKey, this);
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointer, this);
    this.scene.start("run");
  }

  private publishTelemetry(): void {
    if (import.meta.env.MODE !== "test") return;
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
        difficulty: getSessionSettings().difficulty,
      },
    });
  }

  private chooseDifficulty(difficulty: DifficultyId): void {
    updateSessionSettings({ ...getSessionSettings(), difficulty });
    this.refreshDifficulty();
    this.publishTelemetry();
  }

  private refreshDifficulty(): void {
    const selected = getSessionSettings().difficulty;
    const palette = activeTheme.tokens.palette;
    for (const [id, { button, label }] of this.difficultyButtons) {
      button.setFillStyle(Phaser.Display.Color.HexStringToColor(id === selected ? palette.accent : palette.floor).color);
      label.setColor(id === selected ? palette.background : palette.text);
    }
    this.difficultyDescription?.setText(activeTheme.copy.difficulty.levels[selected].description);
  }
}

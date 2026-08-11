import Phaser from "phaser";
import "./style.css";
import { createGameConfig } from "./game/config";
import { activeTheme } from "./game/content/active-theme";
import { validateTheme } from "./game/content/define-theme";
import { updateTestTelemetry } from "./test-support/telemetry-bridge";

const app = document.querySelector<HTMLElement>("#app");

function showBootFailure(error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  if (app) {
    app.innerHTML = "";
    const message = document.createElement("p");
    message.className = "boot-failure";
    message.textContent = `${activeTheme.copy.bootFailure} ${detail}`;
    app.append(message);
  }
  updateTestTelemetry({
    status: "failed",
    scene: null,
    themeId: activeTheme.id,
    canvas: { width: 0, height: 0 },
    error: detail,
  });
}

async function boot(): Promise<void> {
  try {
    if (import.meta.env.MODE === "test") await import("./test-support/install-telemetry");

    const issues = validateTheme(activeTheme);
    if (issues.length > 0) throw new Error(issues.join("; "));
    if (!app) throw new Error("Missing application root");

    app.innerHTML = '<div id="game-container" aria-label="Arena Survivor game"></div>';
    new Phaser.Game(createGameConfig("game-container"));
  } catch (error) {
    showBootFailure(error);
  }
}

void boot();

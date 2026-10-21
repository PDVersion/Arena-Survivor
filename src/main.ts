import { initializeProfile } from "./game/systems/persistence/profile-service";
import "./style.css";
import { activeTheme } from "./game/content/active-theme";
import { validateTheme } from "./game/content/define-theme";
import { updateTestTelemetry } from "./test-support/telemetry-bridge";

const app = document.querySelector<HTMLElement>("#app");

function showBootFailure(error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  if (app) {
    const message = document.createElement("div");
    message.className = "boot-failure";
    message.setAttribute("role", "alert");
    const description = document.createElement("p");
    description.textContent = `${activeTheme.copy.bootFailure} ${detail}`;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = activeTheme.copy.bootRetry;
    retry.addEventListener("click", () => window.location.reload(), { once: true });
    message.append(description, retry);
    app.replaceChildren(message);
  }
  if (import.meta.env.MODE === "test") updateTestTelemetry({
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
    // Every renderer needs 2D canvases for text. Check before Phaser evaluates
    // its canvas feature probes, which otherwise fail outside construction.
    if (!document.createElement("canvas").getContext("2d")) {
      throw new Error(activeTheme.copy.bootGraphicsFailure);
    }

    app.innerHTML = '<div id="game-container" aria-label="Arena Survivor game"></div>';
    // A dependency may fail before Phaser can construct a Game (for example,
    // unsupported canvas contexts). Keep that import inside the recovery boundary.
    initializeProfile(activeTheme);
    const { startGame } = await import("./game/start-game");
    startGame("game-container", showBootFailure);
  } catch (error) {
    showBootFailure(error);
  }
}

void boot();

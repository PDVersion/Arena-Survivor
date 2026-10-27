import { activeTheme } from "../game/content/active-theme";
import { buyImpactUpgrade, getProfile, getProfileStatus, initializeProfile, subscribeProfile } from "../game/systems/persistence/profile-service";
import { shopCost } from "../game/systems/economy/economy";
import "./testing-area.css";
initializeProfile(activeTheme);
const root = document.getElementById("impact-shop")!;
function render(): void {
  const profile = getProfile();
  root.replaceChildren();
  const heading = document.createElement("h1"); heading.textContent = "Impact Shop";
  const intro = document.createElement("p"); intro.textContent = "Rare Impact Points stay with your save. Purchases improve every new cleanup run.";
  const balance = document.createElement("p"); balance.className = "balance"; balance.id = "impact-balance"; balance.textContent = `${profile.economy.impact} Impact Points`;
  const nav = document.createElement("nav"); nav.innerHTML = '<a href="/">Back to game</a><a href="/testing-area.html">Testing area</a><a href="/sprite-browser.html">Sprite browser</a>';
  const status = document.createElement("p"); status.className = "notice"; status.textContent = getProfileStatus().message;
  const grid = document.createElement("section"); grid.className = "shop-grid"; grid.setAttribute("aria-label", "Persistent upgrades");
  for (const item of activeTheme.economy?.shop ?? []) {
    const level = profile.economy.upgrades[item.id] ?? 0, cost = shopCost(item, level);
    const card = document.createElement("article"); card.className = "item-card";
    const title = document.createElement("h2"); title.textContent = item.name;
    const description = document.createElement("p"); description.textContent = item.description;
    const progress = document.createElement("p"); progress.textContent = `Level ${level} / ${item.maxLevel}`;
    const buy = document.createElement("button"); buy.textContent = level >= item.maxLevel ? "Fully upgraded" : `Buy for ${cost} Impact`;
    buy.disabled = level >= item.maxLevel || profile.economy.impact < cost;
    buy.setAttribute("aria-label", `Upgrade ${item.name}`); buy.onclick = () => buyImpactUpgrade(item.id);
    card.append(title, description, progress, buy); grid.append(card);
  }
  root.append(heading, intro, balance, nav, status, grid);
}
subscribeProfile(render); render();
window.addEventListener("storage", (event) => { if (event.key?.startsWith("arena-survivor.profile")) { initializeProfile(activeTheme); render(); } });
